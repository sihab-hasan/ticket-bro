const authConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'AuthSystem',
  routes: {
    login:          '/auth/login',
    register:       '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword:  '/auth/reset-password',
    verifyEmail:    '/auth/verify-email',
    otp:            '/auth/otp',
    dashboard:      '/dashboard',
  },
  storage: {
    accessToken:  'auth_access_token',
    refreshToken: 'auth_refresh_token',
    user:         'auth_user',
    theme:        'auth_theme',
  },
};

export default authConfig;