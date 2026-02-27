const authConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'TicketBro',
  routes: {
    login:          '?auth=login',        // Login modal
    register:       '?auth=register',     // Register modal
    forgotPassword: '?auth=forgot',       // Forgot password modal
    resetPassword:  '?auth=reset',        // Reset password modal
    verifyEmail:    '?auth=verify',       // Verify email modal
    otp:            '?auth=otp',          // OTP modal
    dashboard:      '/dashboard',         // Dashboard stays as normal route
  },
  storage: {
    accessToken:  'auth_access_token',
    refreshToken: 'auth_refresh_token',
    user:         'auth_user',
    theme:        'auth_theme',
  },
};

export default authConfig;