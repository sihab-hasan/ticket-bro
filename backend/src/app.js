"use strict";

require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const path = require("path");

const env = require("./config/env");
const { globalLimiter } = require("./config/rateLimit.config");
const routes = require("./routes");
const {
  errorHandler,
  notFound,
} = require("./common/middleware/errorHandler.middleware");
const { sanitizeBody } = require("./common/middleware/validation.middleware");
const logger = require("./infrastructure/logger/logger");

// Audit middleware logs create/update/delete actions for privileged routes.
const { auditMiddleware } = require("./common/middleware/audit.middleware");

require("./modules/auth/strategies/passport");

const app = express();

// ── Trust Proxy ───────────────────────────────────────────────────────────────
// MUST be FIRST — before rate limiter, CORS, and cookieParser.
// Without this, req.ip is the proxy IP (127.0.0.1 in all envs), which means:
//   • All users share one rate-limit bucket → 5 failed logins = 429 for everyone
//   • Secure cookies may not be set correctly behind a load balancer
// In production: trust exactly 1 hop (the load balancer / reverse proxy).
// In development: still set it so req.ip resolves to the real local IP.
app.set('trust proxy', env.isProduction() ? 1 : false);

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: env.isProduction(),
    // Allow cross-origin image loads (avatar images from different port in dev)
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true); // allow curl/postman
      }

      const allowedOrigins = [
        env.FRONTEND_URL,
        env.BACKEND_URL,
      ];

      // Allow localhost
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Allow LAN devices
      if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin)) {
        return callback(null, true);
      }

      // Allow ANY Cloudflare tunnel
      if (/\.trycloudflare\.com$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }

      // Allow configured domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-tunnel-secret",
    ],
  })
);

// ── Global Rate Limiting ──────────────────────────────────────────────────────
// Applied AFTER trust proxy so req.ip is the real client IP.
app.use(globalLimiter);

// ── Webhook Raw Body ──────────────────────────────────────────────────────────
const API_PREFIX = `${env.API_PREFIX}/${env.API_VERSION}`;
app.use(`${API_PREFIX}/webhooks`, express.raw({ type: "application/json" }));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(env.COOKIE_SECRET));

// ── Sanitization ──────────────────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(sanitizeBody);

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP Logging ──────────────────────────────────────────────────────────────
if (!env.isTest()) {
  app.use(morgan("combined", { stream: logger.stream }));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use(API_PREFIX, routes);

// ── Audit Logging ────────────────────────────────────────────────────────────
// Attach audit middleware after routing so it can inspect req.user and response.
// SKIP_PATHS and SKIP_METHODS are defined in the middleware to avoid logging
// health checks, metrics, OPTIONS, etc.
app.use(auditMiddleware);

// ── Static Files ──────────────────────────────────────────────────────────────
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "public/uploads")),
);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
