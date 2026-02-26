import authConfig from '../config/auth.config';
const { storage } = authConfig;

export const storageUtils = {
  getAccessToken:  () => localStorage.getItem(storage.accessToken),
  setAccessToken:  (t) => localStorage.setItem(storage.accessToken, t),
  getRefreshToken: () => localStorage.getItem(storage.refreshToken),
  setRefreshToken: (t) => localStorage.setItem(storage.refreshToken, t),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(storage.user)); } catch { return null; }
  },
  setUser:   (u) => localStorage.setItem(storage.user, JSON.stringify(u)),
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken)  localStorage.setItem(storage.accessToken, accessToken);
    if (refreshToken) localStorage.setItem(storage.refreshToken, refreshToken);
  },
  clearAll: () => {
    [storage.accessToken, storage.refreshToken, storage.user].forEach((k) => localStorage.removeItem(k));
  },
  isAuthenticated: () => !!localStorage.getItem(storage.accessToken),
};