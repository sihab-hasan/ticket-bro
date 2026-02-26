'use strict';

const env = require('./env');

const authConfig = {
  jwt: {
    accessToken: {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      algorithm: 'HS256',
    },
    refreshToken: {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      algorithm: 'HS256',
    },
    emailVerification: {
      secret: env.EMAIL_VERIFICATION_SECRET,
      expiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN,
    },
    passwordReset: {
      secret: env.PASSWORD_RESET_SECRET,
      expiresIn: env.PASSWORD_RESET_EXPIRES_IN,
    },
  },

  password: {
    saltRounds: env.BCRYPT_SALT_ROUNDS,
    minLength: 8,
    maxLength: 128,
    // Regex: at least 1 uppercase, 1 lowercase, 1 number, 1 special char
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    patternMessage:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  },

  oauth: {
    google: {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    facebook: {
      clientID: env.FACEBOOK_APP_ID,
      clientSecret: env.FACEBOOK_APP_SECRET,
      callbackURL: env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'picture'],
    },
  },

  cookie: {
    httpOnly: env.COOKIE_HTTP_ONLY,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },

  rateLimiting: {
    global: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
    },
    login: {
      windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
      max: env.LOGIN_RATE_LIMIT_MAX,
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
    forgotPassword: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: 'Too many password reset requests. Please try again after 1 hour.',
    },
    resendVerification: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: 'Too many verification emails sent. Please try again after 1 hour.',
    },
  },

  session: {
    maxActiveSessions: 5, // max simultaneous refresh tokens per user
  },

  twoFactor: {
    appName: env.TWO_FACTOR_APP_NAME,
    window: 1, // allow 1 step before/after current time window
  },
};

module.exports = authConfig;
