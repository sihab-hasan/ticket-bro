// frontend/src/api/api.js
//
// Single shared axios instance for the entire app.
//
// Token refresh flow:
//   1. Access token in request header from in-memory storageUtils.getAccessToken()
//   2. On 401: POST /auth/refresh-token with empty body + withCredentials:true
//      → browser automatically sends the httpOnly refreshToken cookie
//      → server returns new accessToken in body (refreshToken rotated via cookie)
//   3. New accessToken stored in memory, failed request retried
//   4. On refresh failure: clear local state, redirect to login

import axios from 'axios';
import { storageUtils } from '@/utils/storageUtils';
import authConfig from '@/config/auth.config';

const api = axios.create({
  baseURL: authConfig.apiBaseUrl,
  withCredentials: true,   // REQUIRED: sends httpOnly refresh token cookie automatically
  timeout: 15_000,
});

const isFormDataPayload = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData;

// ── Request interceptor ───────────────────────────────────────────────────────
// Attach in-memory access token if available.
api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  const token = storageUtils.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isFormDataPayload(config.data)) {
    delete config.headers?.["Content-Type"];
    delete config.headers?.["content-type"];
  } else if (
    config.data !== undefined &&
    !config.headers?.["Content-Type"] &&
    !config.headers?.["content-type"]
  ) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// ── Response interceptor — silent token rotation ──────────────────────────────
let isRefreshing = false;
let waitQueue = [];

const flushQueue = (err, token = null) => {
  waitQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token),
  );
  waitQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Only handle 401 errors; avoid infinite retry loops
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // If the refresh-token endpoint itself 401s, session is dead — log out
    if (original.url?.includes('/auth/refresh-token')) {
      storageUtils.clearAll();
      window.location.href = authConfig.routes.login;
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is in flight
    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        waitQueue.push({ resolve, reject }),
      ).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // FIX: empty body — refresh token is sent automatically via httpOnly cookie.
      // Previously this read the token from localStorage (insecure) and sent it
      // in the body, which defeated the purpose of using an httpOnly cookie.
      const res = await axios.post(
        `${authConfig.apiBaseUrl}/auth/refresh-token`,
        {},              // empty body — cookie carries the token
        { withCredentials: true },
      );

      const { accessToken } = res.data.data;
      storageUtils.setAccessToken(accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      flushQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      storageUtils.clearAll();
      window.location.href = authConfig.routes.login;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
