'use strict';

const { verifyAccessToken, extractBearerToken } = require('../../common/utils/tokenGenerator');
const authRepository = require('./auth.repository');
const { UnauthorizedError, ForbiddenError } = require('../../common/errors/AppError');
const { ROLES, hasMinimumRole, hasPermission } = require('../../common/constants/roles');
const asyncHandler = require('../../common/utils/asyncHandler');
const logger = require("../../infrastructure/logger/logger");

/**
 * Protect routes — require valid JWT access token
 */
const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token from header or cookie
  let token = extractBearerToken(req.headers.authorization);
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new UnauthorizedError('Access token is required. Please login.');
  }

  // 2. Verify token
  const decoded = verifyAccessToken(token);

  // 3. Find user
  const user = await authRepository.findUserById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError('The user belonging to this token no longer exists.');
  }

  // 4. Check if user is active
  if (!user.isActive) {
    throw new ForbiddenError('Your account has been deactivated. Please contact support.');
  }

  // 5. Check if password was changed after token issued
  if (user.wasPasswordChangedAfter(decoded.iat)) {
    throw new UnauthorizedError('Password was recently changed. Please login again.');
  }

  // 6. Attach user to request
  req.user = user;
  req.tokenPayload = decoded;

  next();
});

/**
 * Optionally authenticate — attach user if token present, don't fail if not
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await authRepository.findUserById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
      req.tokenPayload = decoded;
    }
  } catch {
    // Silently fail for optional auth
  }
  next();
});

/**
 * Restrict to specific roles
 * Usage: restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`);
    }
    next();
  };
};

/**
 * Require minimum role level
 * Usage: requireMinRole(ROLES.MODERATOR)
 */
const requireMinRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }
    if (!hasMinimumRole(req.user.role, minimumRole)) {
      throw new ForbiddenError(`Access denied. Minimum required role: ${minimumRole}`);
    }
    next();
  };
};

/**
 * Require specific permission
 * Usage: requirePermission('manage:roles')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }
    if (!hasPermission(req.user.role, permission)) {
      throw new ForbiddenError(`Access denied. Missing permission: ${permission}`);
    }
    next();
  };
};

/**
 * Require verified email
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required.');
  }
  if (!req.user.isEmailVerified) {
    throw new ForbiddenError('Please verify your email address to access this resource.');
  }
  next();
};

/**
 * Verify refresh token from body or cookie
 */
const extractRefreshToken = (req, res, next) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) {
    throw new UnauthorizedError('Refresh token is required.');
  }
  req.refreshToken = token;
  next();
};

module.exports = {
  protect,
  optionalAuth,
  restrictTo,
  requireMinRole,
  requirePermission,
  requireEmailVerified,
  extractRefreshToken,
};
