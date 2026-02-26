// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  registerUser, loginUser, logoutUser, fetchMe, verifyTwoFactor,
  clearError, clearTwoFactor,
  selectUser, selectIsAuthenticated, selectIsLoading, selectAuthError,
  selectRequires2FA, select2FAEmail,
} from '../store/slices/authSlice';
import { storageUtils } from '../utils/storageUtils';
import authConfig from '../config/auth.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch        = useDispatch();
  const user            = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading       = useSelector(selectIsLoading);

  useEffect(() => {
    const token = storageUtils.getAccessToken();
    if (token && !user) dispatch(fetchMe());
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
};

// ── Main hook ─────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const user           = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading      = useSelector(selectIsLoading);
  const error          = useSelector(selectAuthError);
  const requires2FA    = useSelector(selectRequires2FA);
  const twoFactorEmail = useSelector(select2FAEmail);

  const register = async (data) => {
    const r = await dispatch(registerUser(data));
    if (!r.error) navigate(authConfig.routes.dashboard);
    return r;
  };

  const login = async (data) => {
    const r = await dispatch(loginUser(data));
    if (!r.error) {
      if (r.payload?.requiresTwoFactor) navigate(authConfig.routes.otp);
      else navigate(authConfig.routes.dashboard);
    }
    return r;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate(authConfig.routes.login);
  };

  const verify2FA = async (email, otp) => {
    const r = await dispatch(verifyTwoFactor({ email, otp }));
    if (!r.error) navigate(authConfig.routes.dashboard);
    return r;
  };

  return {
    user, isAuthenticated, isLoading, error, requires2FA, twoFactorEmail,
    register, login, logout, verify2FA,
    refreshProfile: () => dispatch(fetchMe()),
    clearError:     () => dispatch(clearError()),
    clearTwoFactor: () => dispatch(clearTwoFactor()),
  };
};

// ✅ Keep default export for any files already using: import useAuth from '...'
export default useAuth;