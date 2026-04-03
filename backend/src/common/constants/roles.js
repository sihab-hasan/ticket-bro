'use strict';

const { ROLE_PERMISSIONS_MAP } = require('./permissions');

const ROLES = Object.freeze({
  USER: 'user',
  ORGANIZER: 'organizer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

const ROLE_ALIASES = Object.freeze({
  superadmin: ROLES.SUPER_ADMIN,
  super_admin: ROLES.SUPER_ADMIN,
});

const PANELS = Object.freeze({
  USER: 'user',
  ORGANIZER: 'organizer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

const PANEL_META = Object.freeze({
  [PANELS.USER]: {
    id: PANELS.USER,
    label: 'User Panel',
    description: 'Bookings, tickets, profile, and payments',
    path: '/profile',
  },
  [PANELS.ORGANIZER]: {
    id: PANELS.ORGANIZER,
    label: 'Organizer Panel',
    description: 'Events, bookings, revenue, and organizer analytics',
    path: '/organizer/dashboard',
  },
  [PANELS.MODERATOR]: {
    id: PANELS.MODERATOR,
    label: 'Moderator Panel',
    description: 'Reports, moderation queue, and trust & safety actions',
    path: '/moderator/dashboard',
  },
  [PANELS.ADMIN]: {
    id: PANELS.ADMIN,
    label: 'Admin Panel',
    description: 'Platform operations, users, payments, and settings',
    path: '/admin/dashboard',
  },
  [PANELS.SUPER_ADMIN]: {
    id: PANELS.SUPER_ADMIN,
    label: 'Super Admin Panel',
    description: 'Governance, roles, audit trail, and system controls',
    path: '/super-admin/dashboard',
  },
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.USER]: 1,
  [ROLES.ORGANIZER]: 2,
  [ROLES.MODERATOR]: 3,
  [ROLES.ADMIN]: 4,
  [ROLES.SUPER_ADMIN]: 5,
});

const ROLE_PANEL_ACCESS = Object.freeze({
  [ROLES.USER]: [PANELS.USER],
  [ROLES.ORGANIZER]: [PANELS.USER, PANELS.ORGANIZER],
  [ROLES.MODERATOR]: [PANELS.USER, PANELS.MODERATOR],
  [ROLES.ADMIN]: [PANELS.USER, PANELS.ORGANIZER, PANELS.MODERATOR, PANELS.ADMIN],
  [ROLES.SUPER_ADMIN]: [
    PANELS.USER,
    PANELS.ORGANIZER,
    PANELS.MODERATOR,
    PANELS.ADMIN,
    PANELS.SUPER_ADMIN,
  ],
});

const DEFAULT_PANEL_BY_ROLE = Object.freeze({
  [ROLES.USER]: PANELS.USER,
  [ROLES.ORGANIZER]: PANELS.ORGANIZER,
  [ROLES.MODERATOR]: PANELS.MODERATOR,
  [ROLES.ADMIN]: PANELS.ADMIN,
  [ROLES.SUPER_ADMIN]: PANELS.SUPER_ADMIN,
});

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  const normalized = String(role).trim().toLowerCase();
  return ROLE_ALIASES[normalized] || normalized;
};

const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS_MAP[normalizedRole] || [];
  return permissions.includes('*') ? ['*'] : [...permissions];
};

const getAllowedPanels = (role) => {
  const normalizedRole = normalizeRole(role);
  return [...(ROLE_PANEL_ACCESS[normalizedRole] || [])];
};

const getPanelMeta = (panelId) => {
  const normalizedPanel = normalizeRole(panelId);
  return PANEL_META[normalizedPanel] || null;
};

const getAvailablePanels = (role) =>
  getAllowedPanels(role)
    .map((panelId) => getPanelMeta(panelId))
    .filter(Boolean);

const getDefaultPanel = (role) => {
  const normalizedRole = normalizeRole(role);
  return DEFAULT_PANEL_BY_ROLE[normalizedRole] || PANELS.USER;
};

const getDefaultPanelPath = (role) => {
  const panelId = getDefaultPanel(role);
  return PANEL_META[panelId]?.path || '/profile';
};

const canAccessPanel = (role, panelId) => {
  return getAllowedPanels(role).includes(normalizeRole(panelId));
};

const hasPermission = (role, requiredPermission) => {
  const permissions = getRolePermissions(role);
  if (!requiredPermission) {
    return false;
  }

  return permissions.includes('*') || permissions.includes(requiredPermission);
};

const hasMinimumRole = (role, minimumRole) => {
  const normalizedRole = normalizeRole(role);
  const normalizedMinimumRole = normalizeRole(minimumRole);

  return (
    (ROLE_HIERARCHY[normalizedRole] || 0) >=
    (ROLE_HIERARCHY[normalizedMinimumRole] || 0)
  );
};

module.exports = {
  ROLES,
  PANELS,
  PANEL_META,
  ROLE_ALIASES,
  ROLE_HIERARCHY,
  ROLE_PANEL_ACCESS,
  DEFAULT_PANEL_BY_ROLE,
  normalizeRole,
  getRolePermissions,
  getAllowedPanels,
  getAvailablePanels,
  getDefaultPanel,
  getDefaultPanelPath,
  getPanelMeta,
  canAccessPanel,
  hasPermission,
  hasMinimumRole,
};
