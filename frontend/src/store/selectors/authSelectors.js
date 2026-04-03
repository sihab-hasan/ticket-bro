// frontend/src/store/selectors/authSelectors.js
//
// Memoised selectors for auth state. Import these instead of accessing
// state.auth.* directly so components don't break if the slice shape changes.

import {
  canUserAccessPanel,
  getUserAllowedPanels,
  getUserPermissions,
  hasUserPermission,
} from "@/utils/access.utils";

// ── Raw selectors ─────────────────────────────────────────────────────────────
export const selectAuth            = (state) => state.auth;
export const selectUser            = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading       = (state) => state.auth.isLoading;
export const selectAuthError       = (state) => state.auth.error;
export const selectRequires2FA     = (state) => state.auth.requiresTwoFactor;
export const select2FAEmail        = (state) => state.auth.twoFactorEmail;
// "loading" | "authenticated" | "guest"
export const selectAuthStatus      = (state) => state.auth.authStatus;

// ── Derived selectors ─────────────────────────────────────────────────────────

/** True if user is logged in AND email is verified */
export const selectIsVerifiedUser = (state) => {
  const user = state.auth.user;
  return state.auth.isAuthenticated && !!user?.isEmailVerified;
};

/** True if the user has 2FA enabled */
export const selectHas2FAEnabled = (state) => !!state.auth.user?.isTwoFactorEnabled;

/** The user's role string, or null */
export const selectUserRole = (state) => state.auth.user?.role ?? null;

/** True if the user has any of the given role strings */
export const selectHasRole = (...roles) => (state) => {
  const role = state.auth.user?.role;
  return role ? roles.includes(role) : false;
};

/** User's display name */
export const selectUserFullName = (state) => {
  const u = state.auth.user;
  if (!u) return '';
  return u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
};

/** User's avatar URL or null */
export const selectUserAvatar = (state) => state.auth.user?.avatar ?? null;

export const selectUserPermissions = (state) =>
  getUserPermissions(state.auth.user);

export const selectAllowedPanels = (state) =>
  getUserAllowedPanels(state.auth.user);

export const selectHasPermission = (permission) => (state) =>
  hasUserPermission(state.auth.user, permission);

export const selectCanAccessPanel = (panel) => (state) =>
  canUserAccessPanel(state.auth.user, panel);

/** True if user is admin or super_admin */
export const selectIsAdmin = (state) => {
  return canUserAccessPanel(state.auth.user, 'admin');
};

/** True if user is organizer, admin, or super_admin */
export const selectIsOrganizer = (state) => {
  return canUserAccessPanel(state.auth.user, 'organizer');
};

/** True if user is super_admin */
export const selectIsSuperAdmin = (state) =>
  canUserAccessPanel(state.auth.user, 'super_admin');
