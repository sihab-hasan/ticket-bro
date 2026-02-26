"use strict";

const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { Strategy: LocalStrategy } = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const authConfig = require("../../../config/auth.config");
const authRepository = require("../../auth/auth.repository");
const { comparePassword } = require("../../../common/utils/encryption");
const logger = require("../../../infrastructure/logger/logger");

// ── JWT Strategy ──────────────────────────────────────────────────────────────
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.jwt.accessToken.secret,
      algorithms: [authConfig.jwt.accessToken.algorithm],
      passReqToCallback: true,
    },
    async (req, payload, done) => {
      try {
        const user = await authRepository.findUserById(payload.userId);
        if (!user || !user.isActive) {
          return done(null, false, { message: "User not found or inactive." });
        }
        if (user.wasPasswordChangedAfter(payload.iat)) {
          return done(null, false, {
            message: "Password changed. Please login again.",
          });
        }
        return done(null, user);
      } catch (error) {
        logger.error(`JWT Strategy error: ${error.message}`);
        return done(error, false);
      }
    },
  ),
);

// ── Local Strategy (email + password) ────────────────────────────────────────
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await authRepository.findUserByEmail(email, true);
        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }
        if (!user.isActive) {
          return done(null, false, { message: "Account deactivated." });
        }
        if (user.isLocked) {
          return done(null, false, { message: "Account temporarily locked." });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
          await user.incrementLoginAttempts();
          return done(null, false, { message: "Invalid email or password." });
        }
        return done(null, user);
      } catch (error) {
        logger.error(`Local Strategy error: ${error.message}`);
        return done(error, false);
      }
    },
  ),
);

// ── Google OAuth Strategy ─────────────────────────────────────────────────────
if (authConfig.oauth.google.clientID) {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: authConfig.oauth.google.clientID,
        clientSecret: authConfig.oauth.google.clientSecret,
        callbackURL: authConfig.oauth.google.callbackURL,
        scope: authConfig.oauth.google.scope,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Pass raw profile to controller - service handles creation/linking
          return done(null, profile);
        } catch (error) {
          logger.error(`Google Strategy error: ${error.message}`);
          return done(error, false);
        }
      },
    ),
  );
}

// ── Facebook OAuth Strategy ───────────────────────────────────────────────────
if (authConfig.oauth.facebook.clientID) {
  passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: authConfig.oauth.facebook.clientID,
        clientSecret: authConfig.oauth.facebook.clientSecret,
        callbackURL: authConfig.oauth.facebook.callbackURL,
        profileFields: authConfig.oauth.facebook.profileFields,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          return done(null, profile);
        } catch (error) {
          logger.error(`Facebook Strategy error: ${error.message}`);
          return done(error, false);
        }
      },
    ),
  );
}

module.exports = passport;
