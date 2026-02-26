'use strict';

const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.config');
const { UnauthorizedError } = require('../errors/AppError');

/**
 * Generate JWT Access Token
 * @param {Object} payload - Token payload
 * @returns {string} Signed JWT token
 */
const generateAccessToken = (payload) => {
  const { secret, expiresIn, algorithm } = authConfig.jwt.accessToken;
  return jwt.sign(payload, secret, { expiresIn, algorithm });
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - Token payload
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (payload) => {
  const { secret, expiresIn, algorithm } = authConfig.jwt.refreshToken;
  return jwt.sign(payload, secret, { expiresIn, algorithm });
};

/**
 * Generate Email Verification Token
 * @param {Object} payload - Token payload
 * @returns {string} Signed JWT token
 */
const generateEmailVerificationToken = (payload) => {
  const { secret, expiresIn } = authConfig.jwt.emailVerification;
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate Password Reset Token
 * @param {Object} payload - Token payload
 * @returns {string} Signed JWT token
 */
const generatePasswordResetToken = (payload) => {
  const { secret, expiresIn } = authConfig.jwt.passwordReset;
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify Access Token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded payload
 * @throws {UnauthorizedError}
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.accessToken.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired. Please refresh your token.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid access token.');
    }
    throw new UnauthorizedError('Token verification failed.');
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded payload
 * @throws {UnauthorizedError}
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.refreshToken.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Refresh token has expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid refresh token.');
    }
    throw new UnauthorizedError('Token verification failed.');
  }
};

/**
 * Verify Email Verification Token
 * @param {string} token - Email verification JWT
 * @returns {Object} Decoded payload
 */
const verifyEmailVerificationToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.emailVerification.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Email verification link has expired. Please request a new one.');
    }
    throw new UnauthorizedError('Invalid email verification token.');
  }
};

/**
 * Verify Password Reset Token
 * @param {string} token - Password reset JWT
 * @returns {Object} Decoded payload
 */
const verifyPasswordResetToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.passwordReset.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Password reset link has expired. Please request a new one.');
    }
    throw new UnauthorizedError('Invalid password reset token.');
  }
};

/**
 * Decode a token without verification (for reading expired tokens)
 * @param {string} token
 * @returns {Object|null}
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader
 * @returns {string|null}
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
  decodeToken,
  generateTokenPair,
  extractBearerToken,
};
