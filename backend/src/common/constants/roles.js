'use strict';

const ROLES = Object.freeze({
  USER: 'user',
  ORGANIZER: 'organizer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.USER]: 1,
  [ROLES.ORGANIZER]: 2,
  [ROLES.MODERATOR]: 3,
  [ROLES.ADMIN]: 4,
  [ROLES.SUPER_ADMIN]: 5,
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.USER]: ['read:own_profile', 'update:own_profile', 'delete:own_account'],
  [ROLES.ORGANIZER]: [
    'read:own_profile',
    'update:own_profile',
    'delete:own_account',
    'create:events',
    'update:own_events',
    'delete:own_events',
  ],
  [ROLES.MODERATOR]: [
    'read:own_profile',
    'update:own_profile',
    'read:all_users',
    'moderate:content',
  ],
  [ROLES.ADMIN]: [
    'read:own_profile',
    'update:own_profile',
    'read:all_users',
    'update:all_users',
    'delete:all_users',
    'manage:roles',
    'moderate:content',
  ],
  [ROLES.SUPER_ADMIN]: ['*'], // All permissions
});

const hasPermission = (userRole, requiredPermission) => {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission) || permissions.includes('*');
};

const hasMinimumRole = (userRole, minimumRole) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minimumRole] || 0);
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  hasPermission,
  hasMinimumRole,
};
