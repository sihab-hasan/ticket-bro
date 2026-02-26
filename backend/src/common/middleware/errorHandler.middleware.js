'use strict';

const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const env = require('../../config/env');

// ── Error Handler Middleware ──────────────────────────────────────────────────

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { statusCode: StatusCodes.BAD_REQUEST, message };
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for field '${field}': '${value}'. Please use a different value.`;
  return { statusCode: StatusCodes.CONFLICT, message };
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Validation failed',
    errors,
  };
};

const handleJWTError = () => ({
  statusCode: StatusCodes.UNAUTHORIZED,
  message: 'Invalid token. Please login again.',
});

const handleJWTExpiredError = () => ({
  statusCode: StatusCodes.UNAUTHORIZED,
  message: 'Token has expired. Please login again.',
});

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;

  // Handle specific Mongoose/JWT errors
  if (err.name === 'CastError') {
    const { statusCode: sc, message: msg } = handleCastError(err);
    statusCode = sc;
    message = msg;
  } else if (err.code === 11000) {
    const { statusCode: sc, message: msg } = handleDuplicateKeyError(err);
    statusCode = sc;
    message = msg;
  } else if (err.name === 'ValidationError') {
    const { statusCode: sc, message: msg, errors: errs } = handleValidationError(err);
    statusCode = sc;
    message = msg;
    errors = errs;
  } else if (err.name === 'JsonWebTokenError') {
    const { statusCode: sc, message: msg } = handleJWTError();
    statusCode = sc;
    message = msg;
  } else if (err.name === 'TokenExpiredError') {
    const { statusCode: sc, message: msg } = handleJWTExpiredError();
    statusCode = sc;
    message = msg;
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${statusCode}: ${message}`, {
      stack: err.stack,
      body: req.body,
      user: req.user?._id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} — ${statusCode}: ${message}`);
  }

  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (errors) response.errors = errors;

  // Include stack trace only in development
  if (env.isDevelopment() && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

// ── 404 Handler ───────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: StatusCodes.NOT_FOUND,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler, notFound };
