'use strict';

require('dotenv').config();
const path = require('node:path');

// ── Required env vars — app crashes at startup if any are missing ─────────────
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_VERIFICATION_SECRET',
  'PASSWORD_RESET_SECRET',
  'MONGODB_URI',
];

const _isDev = () => (process.env.NODE_ENV || 'development') === 'development';
const _isProd = () => (process.env.NODE_ENV || 'development') === 'production';
const _isTest = () => (process.env.NODE_ENV || 'development') === 'test';

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[STARTUP] Missing required environment variables:\n  ${missing.join('\n  ')}\nCopy .env.example to .env and fill in the values.`
    );
  }
};

if (!_isTest()) {
  validateEnv();
}

const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_VERSION: process.env.API_VERSION || 'v1',
  API_PREFIX: process.env.API_PREFIX || '/api',

  // Database
  MONGODB_URI:
    _isTest()
      ? process.env.MONGODB_URI_TEST || process.env.MONGODB_URI
      : process.env.MONGODB_URI,

  // JWT — NO fallbacks. App refuses to start without real secrets.
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET,
  EMAIL_VERIFICATION_EXPIRES_IN: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
  PASSWORD_RESET_SECRET: process.env.PASSWORD_RESET_SECRET,
  PASSWORD_RESET_EXPIRES_IN: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Ticket Bro',
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:5000/api/v1/auth/oauth/google/callback',

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
  FACEBOOK_CALLBACK_URL:
    process.env.FACEBOOK_CALLBACK_URL ||
    'http://localhost:5000/api/v1/auth/oauth/facebook/callback',

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  SERVE_STATIC_FRONTEND: process.env.SERVE_STATIC_FRONTEND === 'false' ? false : _isProd(),
  STATIC_FRONTEND_DIR: process.env.STATIC_FRONTEND_DIR || path.join(process.cwd(), 'public/app'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  LOGIN_RATE_LIMIT_MAX: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 5,
  LOGIN_RATE_LIMIT_WINDOW_MS: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, 10) || 900000,

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'logs',

  // 2FA
  TWO_FACTOR_APP_NAME: process.env.TWO_FACTOR_APP_NAME || 'Ticket Bro',

  // Cookie — SECURE is forced true in production; developer opt-in for dev HTTPS
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret',
  COOKIE_SECURE: _isProd() ? true : process.env.COOKIE_SECURE === 'true',
  COOKIE_HTTP_ONLY: process.env.COOKIE_HTTP_ONLY !== 'false',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || (_isProd() ? 'none' : 'lax'),

  // Helpers
  isDevelopment: _isDev,
  isProduction: _isProd,
  isTest: _isTest,
};

module.exports = env;
