"use strict";

/**
 * Carbon Footprint Middleware
 * Tracks data transfer per request and estimates CO2 emissions
 * using the @tgwf/co2 package (Sustainable Web Design model).
 *
 * Usage: app.use(carbonFootprintMiddleware);
 *
 * Each request logs:
 *   - Total bytes transferred (request + response)
 *   - Estimated CO2 emissions in grams
 */

const { co2 } = require("@tgwf/co2");
const logger = require("../../infrastructure/logger/logger");

// Initialize CO2.js with the Sustainable Web Design model
const co2Emission = new co2({ model: "swd" });

// Accumulate session totals in memory (resets on server restart)
let sessionTotalBytes = 0;
let sessionTotalCO2 = 0;

/**
 * Determines whether the server is hosted on a green (renewable energy) host.
 * Set CARBON_GREEN_HOST=true in your .env if your host is verified green
 * on the Green Web Foundation directory: https://www.thegreenwebfoundation.org/
 */
const greenHost = process.env.CARBON_GREEN_HOST === "true";

const carbonFootprintMiddleware = (req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  // ── Calculate request size ───────────────────────────────────────────────
  if (req.body) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.body), "utf8");
  }
  if (req.query && Object.keys(req.query).length > 0) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.query), "utf8");
  }
  if (req.headers) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.headers), "utf8");
  }

  // ── Intercept response to measure outgoing bytes ─────────────────────────
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  res.write = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.byteLength(
        typeof chunk === "string" ? chunk : chunk,
        "utf8"
      );
    }
    return originalWrite(chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.byteLength(
        typeof chunk === "string" ? chunk : chunk,
        "utf8"
      );
    }

    const totalBytes = requestBytes + responseBytes;
    const emissions = co2Emission.perByte(totalBytes, greenHost);

    // Accumulate session totals
    sessionTotalBytes += totalBytes;
    sessionTotalCO2 += emissions;

    // Attach to res.locals so other middleware/routes can access it
    res.locals.carbonFootprint = {
      requestBytes,
      responseBytes,
      totalBytes,
      co2Grams: parseFloat(emissions.toFixed(6)),
      greenHost,
    };

    // Log at debug level to avoid flooding production logs
    logger.debug(
      `[Carbon] ${req.method} ${req.originalUrl} | ` +
        `bytes=${totalBytes} | CO2=${emissions.toFixed(4)}g | ` +
        `session_total=${sessionTotalCO2.toFixed(4)}g`
    );

    return originalEnd(chunk, ...args);
  };

  next();
};

/**
 * GET /api/v1/carbon/stats
 * Returns session-level carbon footprint stats.
 * Mount this route in your routes file if you want a dedicated endpoint.
 */
const getCarbonStats = (req, res) => {
  res.json({
    success: true,
    data: {
      sessionTotalBytes,
      sessionTotalCO2Grams: parseFloat(sessionTotalCO2.toFixed(6)),
      greenHost,
      model: "Sustainable Web Design (SWD)",
      note: "Stats reset when the server restarts.",
    },
  });
};

module.exports = { carbonFootprintMiddleware, getCarbonStats };
