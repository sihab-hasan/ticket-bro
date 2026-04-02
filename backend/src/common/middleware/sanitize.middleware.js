'use strict';

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('../../infrastructure/logger/logger');

// ── MongoDB query injection sanitization ──────────────────────────────────────
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`MongoDB injection attempt detected in field: ${key} [${req.ip}]`);
  },
});

// ── XSS protection ────────────────────────────────────────────────────────────
const xssMiddleware = xss();

// ── Combined sanitize middleware ──────────────────────────────────────────────
const sanitizeMiddleware = (req, res, next) => {
  mongoSanitizeMiddleware(req, res, (err) => {
    if (err) return next(err);
    xssMiddleware(req, res, next);
  });
};

// ── Log sanitized data (removes sensitive fields) ─────────────────────────────
const sanitizeLogData = (data) => {
  const sensitive = ['password','token','authorization','cookie','secret','key','otp','cvv','cardNumber'];
  const sanitize  = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    for (const k of Object.keys(obj)) {
      if (sensitive.some(s => k.toLowerCase().includes(s))) {
        out[k] = '[REDACTED]';
      } else if (typeof obj[k] === 'object' && obj[k] !== null) {
        out[k] = sanitize(obj[k]);
      } else {
        out[k] = obj[k];
      }
    }
    return out;
  };
  return sanitize(data);
};

module.exports = { sanitizeMiddleware, sanitizeLogData };
