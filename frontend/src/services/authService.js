import api from '../api/authApi';

const authService = {
  register:           (d) => api.post('/auth/register', d),
  login:              (d) => api.post('/auth/login', d),
  logout:             (rt) => api.post('/auth/logout', { refreshToken: rt }),
  logoutAll:          () => api.post('/auth/logout-all'),
  refreshToken:       (t) => api.post('/auth/refresh-token', { refreshToken: t }),
  getMe:              () => api.get('/auth/me'),
  verifyEmail:        (t) => api.post('/auth/verify-email', { token: t }),
  resendVerification: (e) => api.post('/auth/resend-verification', { email: e }),
  forgotPassword:     (e) => api.post('/auth/forgot-password', { email: e }),
  resetPassword:      (d) => api.post('/auth/reset-password', d),
  changePassword:     (d) => api.post('/auth/change-password', d),
  getActiveSessions:  () => api.get('/auth/sessions'),
  setup2FA:           () => api.post('/auth/2fa/setup'),
  enable2FA:          (t) => api.post('/auth/2fa/enable', { token: t }),
  disable2FA:         (p) => api.post('/auth/2fa/disable', { password: p }),
  verifyTwoFactor:    (email, otp) => api.post('/auth/2fa/verify', { email, otp }),
  googleOAuth:        () => { window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/google`; },
  facebookOAuth:      () => { window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/facebook`; },
};

export default authService;