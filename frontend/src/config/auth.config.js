// frontend/src/config/auth.config.js
//
// All auth is query-param modal. No dedicated /auth/* or standalone pages.
//
// Every flow is triggered by ?auth=<type> on whatever URL the user is on.
// The AuthModal component (mounted once in App.jsx) reads this param and
// renders the appropriate panel as an overlay.

const authConfig = {
  apiBaseUrl: '/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'Ticket Bro',

  routes: {
    home:              '/',
    profile:           '/profile',

    // ── All auth flows (modal query-param) ───────────────────────────────────
    login:             '/?auth=login',
    register:          '/?auth=register',
    forgotPassword:    '/?auth=forgot',
    resetPassword:     '/?auth=reset',        // ?token= also appended by backend
    otp:               '/?auth=otp',
    verifyEmailNotice: '/?auth=verify-notice', // shown right after register
    verifyEmail:       '/?auth=verify-email',  // backend email link (?token= appended)
    oauthSuccess:      '/?auth=oauth-success', // OAuth callback (?token= appended)
  },

  storage: {
    accessToken:  'auth_access_token',
    refreshToken: 'auth_refresh_token',
    user:         'auth_user',
    theme:        'auth_theme',
  },

  oauth: {
    google:   { redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI   || 'http://localhost:5173' },
    facebook: { redirectUri: import.meta.env.VITE_FACEBOOK_REDIRECT_URI || 'http://localhost:5173' },
  },
};

export default authConfig;
