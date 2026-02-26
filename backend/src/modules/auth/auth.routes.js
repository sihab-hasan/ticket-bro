'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

const controller = require('./auth.controller');
const { protect, requireEmailVerified } = require('./auth.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  loginLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
} = require('../../config/rateLimit.config');

// ── Public Routes ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 */
router.post('/register', asyncHandler(controller.register));

/**
 * @route   POST /api/v1/auth/login
 */
router.post('/login', loginLimiter, asyncHandler(controller.login));

/**
 * @route   POST /api/v1/auth/refresh-token
 */
router.post('/refresh-token', asyncHandler(controller.refreshToken));

/**
 * @route   POST /api/v1/auth/verify-email/:token
 * @route   POST /api/v1/auth/verify-email  (token in body)
 */
router.get('/verify-email/:token', asyncHandler(controller.verifyEmail));
router.post('/verify-email', asyncHandler(controller.verifyEmail));

/**
 * @route   POST /api/v1/auth/resend-verification
 */
router.post('/resend-verification', resendVerificationLimiter, asyncHandler(controller.resendVerification));

/**
 * @route   POST /api/v1/auth/forgot-password
 */
router.post('/forgot-password', forgotPasswordLimiter, asyncHandler(controller.forgotPassword));

/**
 * @route   POST /api/v1/auth/reset-password
 */
router.post('/reset-password', asyncHandler(controller.resetPassword));

/**
 * @route   POST /api/v1/auth/2fa/verify
 */
router.post('/2fa/verify', loginLimiter, asyncHandler(controller.verifyTwoFactor));

// ── OAuth Routes ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/auth/oauth/google
 */
router.get(
  '/oauth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

/**
 * @route   GET /api/v1/auth/oauth/google/callback
 */
router.get(
  '/oauth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login?error=oauth_failed' }),
  asyncHandler(controller.googleOAuthCallback),
);

/**
 * @route   GET /api/v1/auth/oauth/facebook
 */
router.get(
  '/oauth/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false }),
);

/**
 * @route   GET /api/v1/auth/oauth/facebook/callback
 */
router.get(
  '/oauth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/auth/login?error=oauth_failed' }),
  asyncHandler(controller.facebookOAuthCallback),
);

// ── Protected Routes (require JWT) ───────────────────────────────────────────

/**
 * @route   GET /api/v1/auth/me
 */
router.get('/me', protect, asyncHandler(controller.getMe));

/**
 * @route   POST /api/v1/auth/logout
 */
router.post('/logout', protect, asyncHandler(controller.logout));

/**
 * @route   POST /api/v1/auth/logout-all
 */
router.post('/logout-all', protect, asyncHandler(controller.logoutAll));

/**
 * @route   POST /api/v1/auth/change-password
 */
router.post('/change-password', protect, asyncHandler(controller.changePassword));

/**
 * @route   GET /api/v1/auth/sessions
 */
router.get('/sessions', protect, asyncHandler(controller.getActiveSessions));

/**
 * @route   POST /api/v1/auth/2fa/setup
 */
router.post('/2fa/setup', protect, requireEmailVerified, asyncHandler(controller.setup2FA));

/**
 * @route   POST /api/v1/auth/2fa/enable
 */
router.post('/2fa/enable', protect, asyncHandler(controller.enable2FA));

/**
 * @route   POST /api/v1/auth/2fa/disable
 */
router.post('/2fa/disable', protect, asyncHandler(controller.disable2FA));

module.exports = router;
