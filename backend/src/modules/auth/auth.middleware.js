'use strict';

const { verifyAccessToken, extractBearerToken } = require('../../common/utils/tokenGenerator');
const authRepository = require('./auth.repository');
const { UnauthorizedError, ForbiddenError } = require('../../common/errors/AppError');
const {
  ROLES,
  normalizeRole,
  hasMinimumRole,
  hasPermission,
} = require('../../common/constants/roles');
const asyncHandler = require('../../common/utils/asyncHandler');

/**
 * protect — require valid JWT access token
 * Reads from Authorization header (Bearer) or accessToken cookie.
 * Also checks:
 *   - user still exists in DB
 *   - account is active
 *   - password hasn't changed since token was issued
 */
const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token
  let token = extractBearerToken(req.headers.authorization);
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) {
    throw new UnauthorizedError('Access token is required. Please login.');
  }

  // 2. Verify token (also checks type === 'access')
  const decoded = verifyAccessToken(token);

  // 3. User must still exist
  const user = await authRepository.findUserById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError('The user belonging to this token no longer exists.');
  }

  // 4. Account must be active
  if (!user.isActive) {
    throw new ForbiddenError('Your account has been deactivated. Please contact support.');
  }

  // 5. Password must not have changed after token was issued
  if (user.wasPasswordChangedAfter(decoded.iat)) {
    throw new UnauthorizedError('Password was recently changed. Please login again.');
  }

  // 6. Attach to request
  req.user = user;
  req.tokenPayload = decoded;
  next();
});

/**
 * optionalAuth — attach user if token present, silently skip if not
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
    // Silently fail — this is intentional for optional auth
  }
  next();
});

/**
 * restrictTo — require one of the given roles
 * Usage: restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN)
 */
const restrictTo = (...roles) => {
  const allowedRoles = roles.flat().map((role) => normalizeRole(role));

  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError('Authentication required.');
    const userRole = normalizeRole(req.user.role);

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }
    next();
  };
};

/**
 * requireMinRole — require at least a given role level
 * Usage: requireMinRole(ROLES.MODERATOR)
 */
const requireMinRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError('Authentication required.');
    if (!hasMinimumRole(req.user.role, minimumRole)) {
      throw new ForbiddenError(`Access denied. Minimum required role: ${minimumRole}`);
    }
    next();
  };
};

/**
 * requirePermission — require a specific permission string
 * Usage: requirePermission('manage:roles')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError('Authentication required.');
    if (!hasPermission(req.user.role, permission)) {
      throw new ForbiddenError(`Access denied. Missing permission: ${permission}`);
    }
    next();
  };
};

/**
 * requireEmailVerified — user must have verified their email
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) throw new UnauthorizedError('Authentication required.');
  if (!req.user.isEmailVerified) {
    throw new ForbiddenError('Please verify your email address to access this resource.');
  }
  next();
};

/**
 * extractRefreshToken — reads refresh token from cookie (preferred) or body
 */
const extractRefreshToken = (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
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
