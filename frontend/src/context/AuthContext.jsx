// frontend/src/context/AuthContext.jsx
//
// Single auth system: Modal-based (?auth=login etc.)
// All auth flows open the AuthModal overlay on top of the current page.

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

// ── Main hook ─────────────────────────────────────────────────────────────────
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
  const login = async (data) => {
    const result = await dispatch(loginUser(data));
    if (!result.error) {
      if (result.payload?.requiresTwoFactor) {
        navigate(authConfig.routes.otp, { state: location.state });
      } else {
        const from = location.state?.from?.pathname || authConfig.routes.home;
        navigate(from, { replace: true });
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
  const verify2FA = async (email, otp) => {
    const result = await dispatch(verifyTwoFactor({ email, otp }));
    if (!result.error) {
      const from = location.state?.from?.pathname || authConfig.routes.home;
      navigate(from, { replace: true });
    }
    return result;
  };

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
    user,
    isAuthenticated,
    isLoading,
    error,
    requires2FA,
    twoFactorEmail,
    register,
    login,
    logout,
    verify2FA,
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

export default useAuth;
