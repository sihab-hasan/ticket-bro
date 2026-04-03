'use strict';

const {
  normalizeRole,
  ROLE_HIERARCHY,
  getRolePermissions,
  getAllowedPanels,
  getAvailablePanels,
  getDefaultPanel,
  getDefaultPanelPath,
} = require('../constants/roles');

const deriveAccountStatus = (user) => {
  if (!user) {
    return 'inactive';
  }

  if (user.status) {
    return user.status;
  }

  return user.isActive ? 'active' : 'inactive';
};

const buildAccessProfile = (user) => {
  const role = normalizeRole(user?.role);

  return {
    role,
    status: deriveAccountStatus(user),
    hierarchy: ROLE_HIERARCHY[role] || 0,
    permissions: getRolePermissions(role),
    allowedPanels: getAllowedPanels(role),
    availablePanels: getAvailablePanels(role),
    defaultPanel: getDefaultPanel(role),
    defaultPanelPath: getDefaultPanelPath(role),
  };
};

module.exports = {
  buildAccessProfile,
  deriveAccountStatus,
};
