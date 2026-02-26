'use strict';

const rateLimit = require('express-rate-limit');
const authConfig = require('./auth.config');

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    },
  });
};

const globalLimiter = createRateLimiter(authConfig.rateLimiting.global);
const loginLimiter = createRateLimiter({
  ...authConfig.rateLimiting.login,
  skipSuccessfulRequests: true,
});
const forgotPasswordLimiter = createRateLimiter(authConfig.rateLimiting.forgotPassword);
const resendVerificationLimiter = createRateLimiter(authConfig.rateLimiting.resendVerification);

module.exports = {
  globalLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  createRateLimiter,
};
