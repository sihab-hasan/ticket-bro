import { PANEL_META, PANELS } from "@/config/panels.config";

const ROLE_FALLBACK_PANELS = {
  user: [PANELS.USER],
  organizer: [PANELS.USER, PANELS.ORGANIZER],
  moderator: [PANELS.USER, PANELS.MODERATOR],
  admin: [PANELS.USER, PANELS.ORGANIZER, PANELS.MODERATOR, PANELS.ADMIN],
  super_admin: [
    PANELS.USER,
    PANELS.ORGANIZER,
    PANELS.MODERATOR,
    PANELS.ADMIN,
    PANELS.SUPER_ADMIN,
  ],
};

export const normalizePanel = (panel) =>
  panel ? String(panel).trim().toLowerCase() : null;

export const getUserPermissions = (user) => {
  const permissions = user?.permissions || user?.access?.permissions || [];
  return Array.isArray(permissions) ? permissions : [];
};

export const getUserAllowedPanels = (user) => {
  const explicitPanels =
    user?.allowedPanels || user?.access?.allowedPanels || null;

  if (Array.isArray(explicitPanels) && explicitPanels.length) {
    return explicitPanels.map((panel) => normalizePanel(panel)).filter(Boolean);
  }

  return ROLE_FALLBACK_PANELS[user?.role] || [PANELS.USER];
};

export const getUserAvailablePanels = (user) => {
  const explicitPanels =
    user?.availablePanels || user?.access?.availablePanels || null;

  if (Array.isArray(explicitPanels) && explicitPanels.length) {
    return explicitPanels;
  }

  return getUserAllowedPanels(user)
    .map((panelId) => PANEL_META[panelId])
    .filter(Boolean);
};

export const hasUserPermission = (user, permission) => {
  const permissions = getUserPermissions(user);
  return permissions.includes("*") || permissions.includes(permission);
};

export const canUserAccessPanel = (user, panel) => {
  const allowedPanels = getUserAllowedPanels(user);
  return allowedPanels.includes(normalizePanel(panel));
};

export const getUserDefaultPanelPath = (user) =>
  user?.defaultPanelPath || user?.access?.defaultPanelPath || PANEL_META.user.path;

export { PANELS, PANEL_META };
