import axios from 'axios';
import { storageUtils } from '../utils/storageUtils';
import authConfig from '../config/auth.config';

const api = axios.create({
  baseURL: authConfig.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = storageUtils.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];
const flush = (err, token) => { queue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token)); queue = []; };

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => { orig.headers.Authorization = `Bearer ${token}`; return api(orig); });
      }
      orig._retry = true;
      isRefreshing  = true;
      const rt = storageUtils.getRefreshToken();
      if (!rt) { storageUtils.clearAll(); window.location.href = authConfig.routes.login; return Promise.reject(error); }
      try {
        const res = await axios.post(`${authConfig.apiBaseUrl}/auth/refresh-token`, { refreshToken: rt }, { withCredentials: true });
        const { accessToken, refreshToken } = res.data.data;
        storageUtils.setTokens({ accessToken, refreshToken });
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        flush(null, accessToken);
        orig.headers.Authorization = `Bearer ${accessToken}`;
        return api(orig);
      } catch (e) {
        flush(e, null);
        storageUtils.clearAll();
        window.location.href = authConfig.routes.login;
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;