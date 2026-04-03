// frontend/src/context/AuthContext.jsx
//
// Dual auth system:
//   Modal system  — ?auth=login  → opens AuthModal over current page
//   Page system   — /auth/login  → full-page AuthLayout routes
//
// Both systems use the same Redux store (authSlice) and this hook.

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  registerUser,
  loginUser,
  logoutUser,
  fetchMe,
  verifyTwoFactor,
  clearError,
  clearTwoFactor,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectRequires2FA,
  select2FAEmail,
} from "../store/slices/authSlice";
import { storageUtils } from "../utils/storageUtils";
import {
  canUserAccessPanel,
  getUserAllowedPanels,
  getUserAvailablePanels,
  hasUserPermission,
} from "../utils/access.utils";
import authConfig from "../config/auth.config";
import authService from "../api/auth.api";

// ── Context (read-only — for components that only need state, no router) ──────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Silent re-auth on page reload / new tab.
  // Access token is in-memory so it's gone after reload.
  // localStorage still has the user object → call fetchMe() which will 401,
  // the axios interceptor fires POST /auth/refresh-token (httpOnly cookie sent
  // automatically), gets a new access token, retries GET /auth/me — transparent.
  useEffect(() => {
    const persistedUser = storageUtils.getUser();
    if (persistedUser && !isAuthenticated) {
      dispatch(fetchMe());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
};

// ── Main hook — used by both modal forms and page components ──────────────────
// Requires a Router context (calls useNavigate internally).
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const requires2FA = useSelector(selectRequires2FA);
  const twoFactorEmail = useSelector(select2FAEmail);

  // ── register ────────────────────────────────────────────────────────────────
  const register = async (data) => {
    const result = await dispatch(registerUser(data));
    if (!result.error) {
      navigate(authConfig.routes.verifyEmailNotice);
    }
    return result;
  };

  // ── login ───────────────────────────────────────────────────────────────────
  // FIX: preserves `from` state so ProtectedRoute can redirect back after login.
  // Previously, login always navigated to home, so users landing on a protected
  // page via a direct link would end up on home after signing in.
  const login = async (data) => {
    const result = await dispatch(loginUser(data));
    if (!result.error) {
      if (result.payload?.requiresTwoFactor) {
        // Preserve `from` in the OTP route so we can redirect after 2FA
        navigate(authConfig.routes.otp, { state: location.state });
      } else {
        // Redirect to where the user originally wanted to go
        const from = location.state?.from?.pathname || authConfig.routes.home;
        navigate(from, { replace: true });
      }
    }
    return result;
  };

  // ── loginAndRedirect ────────────────────────────────────────────────────────
  // Explicit redirect-to destination (used by System B page routes).
  const loginAndRedirect = async (data, redirectTo) => {
    const result = await dispatch(loginUser(data));
    if (!result.error) {
      if (result.payload?.requiresTwoFactor) {
        navigate(authConfig.routes.pages.verifyOtp, {
          state: { from: { pathname: redirectTo } },
        });
      } else {
        navigate(redirectTo || authConfig.routes.home, { replace: true });
      }
    }
    return result;
  };

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await dispatch(logoutUser());
    navigate(authConfig.routes.login);
  };

  // ── verify2FA ───────────────────────────────────────────────────────────────
  // Signature: verify2FA(email, otp) — used by OTPVerification modal component
  const verify2FA = async (email, otp) => {
    const result = await dispatch(verifyTwoFactor({ email, otp }));
    if (!result.error) {
      const from = location.state?.from?.pathname || authConfig.routes.home;
      navigate(from, { replace: true });
    }
    return result;
  };

  // ── verifyOTP ───────────────────────────────────────────────────────────────
  // Signature: verifyOTP({ email, otp }) — used by OTPVerificationPage (/auth/verify-otp)
  const verifyOTP = async ({ email, otp }) => verify2FA(email, otp);

  // ── resend2FA ───────────────────────────────────────────────────────────────
  const resend2FA = async (email) => {
    return authService.resendOTP?.(email) ?? Promise.resolve();
  };

  // ── hasRole ─────────────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  // ── hasPermission ───────────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (permission) => hasUserPermission(user, permission),
    [user],
  );

  const canAccessPanel = useCallback(
    (panel) => canUserAccessPanel(user, panel),
    [user],
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    requires2FA,
    twoFactorEmail,

    // Actions
    register,
    login,
    loginAndRedirect,
    logout,
    verify2FA,
    verifyOTP,
    resend2FA,
    hasRole,
    hasPermission,
    canAccessPanel,
    allowedPanels: getUserAllowedPanels(user),
    availablePanels: getUserAvailablePanels(user),
    refreshProfile: () => dispatch(fetchMe()),
    clearError: () => dispatch(clearError()),
    clearTwoFactor: () => dispatch(clearTwoFactor()),
  };
};

// Default export is the hook (for `import useAuth from '@/context/AuthContext'`)
export default useAuth;
