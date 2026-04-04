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
const fs = require("fs");

const env = require("./config/env");
const { globalLimiter } = require("./config/rateLimit.config");
const routes = require("./routes");
const {
  errorHandler,
  notFound,
} = require("./common/middleware/errorHandler.middleware");
const { sanitizeBody } = require("./common/middleware/validation.middleware");
const logger = require("./infrastructure/logger/logger");

require("./modules/auth/strategies/passport");

const app = express();
const API_PREFIX = `${env.API_PREFIX}/${env.API_VERSION}`;
const staticFrontendDir = env.STATIC_FRONTEND_DIR;
const frontendIndexPath = path.join(staticFrontendDir, "index.html");
const hasBuiltFrontend = fs.existsSync(frontendIndexPath);

// ── Trust Proxy ───────────────────────────────────────────────────────────────
app.set("trust proxy", env.isProduction() ? 1 : false);

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: env.isProduction(),
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [env.FRONTEND_URL, env.BACKEND_URL];

      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }

      if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin)) {
        return callback(null, true);
      }

      if (/\.trycloudflare\.com$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }

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
app.use(globalLimiter);

// ── Webhook Raw Body ──────────────────────────────────────────────────────────
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
    frontendBuilt: hasBuiltFrontend,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use(API_PREFIX, routes);

// ── Static Files ──────────────────────────────────────────────────────────────
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "public/uploads")),
);

if (env.SERVE_STATIC_FRONTEND && hasBuiltFrontend) {
  app.use(express.static(staticFrontendDir));

  app.get(/^\/(?!api|uploads|health).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
