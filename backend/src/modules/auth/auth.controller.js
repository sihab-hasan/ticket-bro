'use strict';

const authService = require('./auth.service');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateVerifyEmail,
  validateResendVerification,
  validateVerifyOTP,
  validateTwoFactorVerify,
} = require('./auth.validation');
const { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO, ChangePasswordDTO } = require('./dtos/index');
const { sendSuccess, sendCreated, sendError } = require('../../common/utils/apiResponse');
const { BadRequestError } = require('../../common/errors/AppError');
const authConfig = require('../../config/auth.config');
const env = require('../../config/env');

// ── Helpers ───────────────────────────────────────────────────────────────────

const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress,
  userAgent: req.headers['user-agent'] || 'Unknown',
});

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...authConfig.cookie,
    path: '/api/v1/auth/refresh-token',
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
};

const validateOrThrow = (validator, data) => {
  const { isValid, errors, value } = validator(data);
  if (!isValid) {
    throw new BadRequestError('Validation failed', errors);
  }
  return value;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  const validatedData = validateOrThrow(validateRegister, req.body);
  const registerDTO = new RegisterDTO(validatedData);

  const result = await authService.register(registerDTO);

  setRefreshTokenCookie(res, result.tokens.refreshToken);

  return sendCreated(res, 'Registration successful. Please check your email to verify your account.', result);
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
const login = async (req, res) => {
  const validatedData = validateOrThrow(validateLogin, req.body);
  const loginDTO = new LoginDTO(validatedData);
  const meta = getRequestMeta(req);

  const result = await authService.login(loginDTO, meta);

  // If 2FA required, return partial response
  if (result.requiresTwoFactor) {
    return sendSuccess(res, result.message, { requiresTwoFactor: true, email: result.email });
  }

  setRefreshTokenCookie(res, result.tokens.refreshToken);

  return sendSuccess(res, 'Login successful.', result);
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current session
 * @access  Private
 */
const logout = async (req, res) => {
  const refreshToken = req.refreshToken || req.body.refreshToken || req.cookies?.refreshToken;
  await authService.logout(refreshToken);
  clearRefreshTokenCookie(res);
  return sendSuccess(res, 'Logged out successfully.');
};

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
const logoutAll = async (req, res) => {
  await authService.logoutAll(req.user._id.toString());
  clearRefreshTokenCookie(res);
  return sendSuccess(res, 'All sessions terminated successfully.');
};

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access and refresh tokens
 * @access  Public (requires refresh token)
 */
const refreshToken = async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) throw new BadRequestError('Refresh token is required.');

  const meta = getRequestMeta(req);
  const tokens = await authService.refreshTokens(token, meta);

  setRefreshTokenCookie(res, tokens.refreshToken);

  return sendSuccess(res, 'Token refreshed successfully.', tokens);
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await authService.getMe(req.user._id.toString());
  return sendSuccess(res, 'User profile retrieved successfully.', user);
};

/**
 * @route   POST /api/v1/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  const token = req.params.token || req.body.token || req.query.token;
  if (!token) throw new BadRequestError('Verification token is required.');

  const result = await authService.verifyEmail(token);
  return sendSuccess(res, result.message, result.user || null);
};

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
const resendVerification = async (req, res) => {
  const validatedData = validateOrThrow(validateResendVerification, req.body);
  const result = await authService.resendVerificationEmail(validatedData.email);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const validatedData = validateOrThrow(validateForgotPassword, req.body);
  const dto = new ForgotPasswordDTO(validatedData);
  const result = await authService.forgotPassword(dto.email);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  const validatedData = validateOrThrow(validateResetPassword, req.body);
  const dto = new ResetPasswordDTO(validatedData);
  const result = await authService.resetPassword(dto.token, dto.password);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
const changePassword = async (req, res) => {
  const validatedData = validateOrThrow(validateChangePassword, req.body);
  const dto = new ChangePasswordDTO(validatedData);
  const result = await authService.changePassword(
    req.user._id.toString(),
    dto.currentPassword,
    dto.newPassword,
  );
  clearRefreshTokenCookie(res);
  return sendSuccess(res, result.message);
};

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 */
const getActiveSessions = async (req, res) => {
  const sessions = await authService.getActiveSessions(req.user._id.toString());
  return sendSuccess(res, 'Active sessions retrieved.', sessions);
};

/**
 * @route   POST /api/v1/auth/2fa/setup
 * @desc    Setup 2FA — generate QR code and secret
 * @access  Private
 */
const setup2FA = async (req, res) => {
  const result = await authService.setupTwoFactor(req.user._id.toString());
  return sendSuccess(res, result.message, { qrCode: result.qrCode, secret: result.secret });
};

/**
 * @route   POST /api/v1/auth/2fa/enable
 * @desc    Enable 2FA after scanning QR
 * @access  Private
 */
const enable2FA = async (req, res) => {
  const validatedData = validateOrThrow(validateTwoFactorVerify, req.body);
  const result = await authService.enableTwoFactor(req.user._id.toString(), validatedData.token);
  return sendSuccess(res, result.message, { recoveryCodes: result.recoveryCodes });
};

/**
 * @route   POST /api/v1/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
const disable2FA = async (req, res) => {
  const { password } = req.body;
  if (!password) throw new BadRequestError('Password is required to disable 2FA.');
  const result = await authService.disableTwoFactor(req.user._id.toString(), password);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/2fa/verify
 * @desc    Verify OTP after login when 2FA is enabled
 * @access  Public
 */
const verifyTwoFactor = async (req, res) => {
  const validatedData = validateOrThrow(validateVerifyOTP, req.body);
  const meta = getRequestMeta(req);

  const result = await authService.verifyTwoFactorLogin(
    validatedData.email,
    validatedData.otp,
    meta,
  );

  setRefreshTokenCookie(res, result.tokens.refreshToken);

  return sendSuccess(res, 'Two-factor authentication verified. Login successful.', result);
};

/**
 * @route   GET /api/v1/auth/oauth/google/callback
 * @desc    Google OAuth callback
 * @access  OAuth
 */
const googleOAuthCallback = async (req, res) => {
  const meta = getRequestMeta(req);
  const result = await authService.handleOAuthLogin(req.user, 'google', meta);

  setRefreshTokenCookie(res, result.tokens.refreshToken);

  // Redirect to frontend with token
  const redirectUrl = `${env.FRONTEND_URL}/auth/oauth-success?token=${result.tokens.accessToken}`;
  return res.redirect(redirectUrl);
};

/**
 * @route   GET /api/v1/auth/oauth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  OAuth
 */
const facebookOAuthCallback = async (req, res) => {
  const meta = getRequestMeta(req);
  const result = await authService.handleOAuthLogin(req.user, 'facebook', meta);

  setRefreshTokenCookie(res, result.tokens.refreshToken);

  const redirectUrl = `${env.FRONTEND_URL}/auth/oauth-success?token=${result.tokens.accessToken}`;
  return res.redirect(redirectUrl);
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getActiveSessions,
  setup2FA,
  enable2FA,
  disable2FA,
  verifyTwoFactor,
  googleOAuthCallback,
  facebookOAuthCallback,
};
