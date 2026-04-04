// frontend/src/config/auth.config.js
//
// ╔══════════════════════════════════════════════════════════════════╗
// ║  DUAL AUTH SYSTEM                                                ║
// ║                                                                  ║
// ║  System A — AuthModal   (query params, e.g. ?auth=login)        ║
// ║    • Opened by: ProtectedRoute redirect, nav "Sign in" buttons  ║
// ║    • Closes by: deleting ?auth param from URL                   ║
// ║    • Components: AuthModal → LoginForm/RegisterForm/…           ║
// ║                                                                  ║
// ║  System B — AuthLayout  (dedicated routes, e.g. /auth/login)    ║
// ║    • Used by: backend email links, direct navigation            ║
// ║    • Components: AuthLayout → LoginPage/RegisterPage/…          ║
// ║                                                                  ║
// ║  Both systems share the same Redux store (authSlice) and useAuth ║
// ╚══════════════════════════════════════════════════════════════════╝

const defaultWebOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

const authConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'Ticket Bro',

  routes: {
    // ── Shared ────────────────────────────────────────────────────────────────
    home:    '/',
    profile: '/profile',

    // ── System A: Modal routes (query-param) ──────────────────────────────────
    // ProtectedRoute redirects unauthenticated users to routes.login
    // which opens the modal on top of whatever page they were on.
    login:             '/?auth=login',
    register:          '/?auth=register',
    forgotPassword:    '/?auth=forgot',
    resetPassword:     '/?auth=reset',
    verifyEmail:       '/?auth=verify',
    verifyEmailNotice: '/?auth=verify-notice',
    otp:               '/?auth=otp',

    // ── System B: Page routes (/auth/*) ───────────────────────────────────────
    // Used by backend email links and direct navigation.
    // AuthLayout wraps these and redirects authenticated users to home.
    pages: {
      login:          '/auth/login',
      register:       '/auth/register',
      forgotPassword: '/auth/forgot-password',
      resetPassword:  '/auth/reset-password',
      verifyOtp:      '/auth/verify-otp',
      verifyEmail:    '/auth/verify-email',  // ← backend email links point here
      oauthSuccess:   '/auth/oauth-success',
    },
  },

  storage: {
    accessToken:  'auth_access_token',
    refreshToken: 'auth_refresh_token',
    user:         'auth_user',
    theme:        'auth_theme',
  },

  oauth: {
    google: {
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI
        || `${defaultWebOrigin}/auth/oauth-success`,
    },
    facebook: {
      redirectUri: import.meta.env.VITE_FACEBOOK_REDIRECT_URI
        || `${defaultWebOrigin}/auth/oauth-success`,
    },
  },
};

export default authConfig;
