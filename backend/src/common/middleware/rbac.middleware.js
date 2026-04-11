// ============================================================
//  RBAC MIDDLEWARE
//  src/common/middleware/rbac.middleware.js
// ============================================================

const ApiError = require("../errors/ApiError");
const { ROLES, ROLE_HIERARCHY } = require("../constants/roles");
const {
  PERMISSIONS,
  ROLE_PERMISSIONS_MAP,
} = require("../constants/permissions");
const logger = require("../../infrastructure/logger/logger");

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} requiredRoles - Required role(s)
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
const rbacMiddleware = (requiredRoles, options = {}) => {
  return (req, res, next) => {
    try {
      // Check if user exists
      if (!req.user) {
        throw ApiError.unauthorized(
          "User not authenticated",
          "AUTH_TOKEN_MISSING",
        );
      }

      const userRole = req.user.role;
      const requiredRolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      // Check if user has required role
      const hasRequiredRole = requiredRolesArray.some((role) => {
        // Direct role match
        if (role === userRole) return true;

        // Check hierarchy if enabled
        if (options.checkHierarchy) {
          const userHierarchy = ROLE_HIERARCHY[userRole] || 0;
          const requiredHierarchy = ROLE_HIERARCHY[role] || 0;
          if (userHierarchy >= requiredHierarchy) return true;
        }

        return false;
      });

      if (!hasRequiredRole) {
        logger.warn(
          `Access denied: User ${req.user._id} with role ${userRole} attempted to access resource requiring roles: ${requiredRolesArray.join(", ")}`,
        );
        throw ApiError.forbidden(
          "Insufficient permissions",
          "AUTHZ_INSUFFICIENT_PERMISSIONS",
        );
      }

      // Check specific permissions if provided
      if (options.permissions && options.permissions.length > 0) {
        const userPermissions = ROLE_PERMISSIONS_MAP[userRole] || [];
        const hasAllPermissions = options.permissions.every((permission) =>
          userPermissions.includes(permission),
        );

        if (!hasAllPermissions) {
          throw ApiError.forbidden(
            "Missing required permissions",
            "AUTHZ_MISSING_PERMISSIONS",
          );
        }
      }

      // Check resource ownership if required
      if (options.checkOwnership) {
        const resourceUserId =
          req.params.userId || req.body.userId || req.query.userId;
        if (resourceUserId && resourceUserId !== req.user._id.toString()) {
          // Allow if user has admin role
          if (![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole)) {
            throw ApiError.forbidden(
              "Cannot access another user's resource",
              "AUTHZ_RESOURCE_OWNER_MISMATCH",
            );
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has specific permission(s)
 * @param {string|string[]} requiredPermissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const permissionMiddleware = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized(
          "User not authenticated",
          "AUTH_TOKEN_MISSING",
        );
      }

      const userRole = req.user.role;
      const userPermissions = ROLE_PERMISSIONS_MAP[userRole] || [];
      const requiredPermissionsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasAllPermissions = requiredPermissionsArray.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        logger.warn(
          `Permission denied: User ${req.user._id} missing required permissions: ${requiredPermissionsArray.join(", ")}`,
        );
        throw ApiError.forbidden(
          "Insufficient permissions",
          "AUTHZ_INSUFFICIENT_PERMISSIONS",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is the owner of a resource or has admin privileges
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 * @returns {Function} Express middleware
 */
const ownershipMiddleware = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized(
          "User not authenticated",
          "AUTH_TOKEN_MISSING",
        );
      }

      const ownerId = await getResourceOwnerId(req);
      const userRole = req.user.role;

      // Allow if user is owner or has admin/superadmin role
      if (
        ownerId === req.user._id.toString() ||
        [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole)
      ) {
        return next();
      }

      throw ApiError.forbidden(
        "You do not own this resource",
        "AUTHZ_RESOURCE_OWNER_MISMATCH",
      );
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize: rbacMiddleware,
  rbacMiddleware,
  permissionMiddleware,
  ownershipMiddleware,
};
