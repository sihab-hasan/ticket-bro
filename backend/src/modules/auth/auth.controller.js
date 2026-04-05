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
  validateDisableTwoFactor,
} = require('./auth.validation');
const { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO, ChangePasswordDTO } = require('./dtos/index');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const { BadRequestError } = require('../../common/errors/AppError');
const authConfig = require('../../config/auth.config');
const env = require('../../config/env');

// ── Helpers ───────────────────────────────────────────────────────────────────

const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress,
  userAgent: req.headers['user-agent'] || 'Unknown',
});

/**
 * Set the refresh token as an httpOnly cookie.
 * Path is '/' so the browser sends it to ALL auth endpoints (refresh, logout, etc.)
 * FIX: was '/api/v1/auth/refresh-token' which prevented logout from receiving the cookie.
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    maxAge: authConfig.cookie.maxAge,
    path: '/',  // FIX: scoped to all paths so logout/refresh both receive it
  });
};

/**
 * Clear the refresh token cookie.
 * FIX: attributes MUST match setRefreshTokenCookie exactly; mismatched path/secure
 *      means clearCookie silently fails and the old token stays in the browser.
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    path: '/',
  });
};

const validateOrThrow = (validator, data) => {
  const { isValid, errors, value } = validator(data);
  if (!isValid) {
    throw new BadRequestError('Validation failed', errors);
  }
  return value;
};

/**
 * Strip refreshToken from the response body before sending.
 * The refresh token is already delivered via httpOnly cookie — including it
 * in the JSON body would expose it to JavaScript (XSS risk).
 */
const sanitiseTokenResponse = (result) => {
  if (result && result.tokens) {
    const { refreshToken: _dropped, ...safeTokens } = result.tokens;
    return { ...result, tokens: safeTokens };
  }
  return result;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 */
const register = async (req, res) => {
  const validatedData = validateOrThrow(validateRegister, req.body);
  const registerDTO = new RegisterDTO(validatedData);

  const result = await authService.register(registerDTO);

  if (result.tokens?.refreshToken) {
    setRefreshTokenCookie(res, result.tokens.refreshToken);
  }

  return sendCreated(
    res,
    'Registration successful. Please check your email to verify your account.',
    sanitiseTokenResponse(result),
  );
};

/**
 * @route   POST /api/v1/auth/login
 */
const login = async (req, res) => {
  const validatedData = validateOrThrow(validateLogin, req.body);
  const loginDTO = new LoginDTO(validatedData);
  const meta = getRequestMeta(req);

  const result = await authService.login(loginDTO, meta);

  if (result.requiresTwoFactor) {
    return sendSuccess(res, result.message, { requiresTwoFactor: true, email: result.email });
  }

  setRefreshTokenCookie(res, result.tokens.refreshToken);

  return sendSuccess(res, 'Login successful.', sanitiseTokenResponse(result));
};

/**
 * @route   POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.refreshToken;
  await authService.logout(refreshToken);
  clearRefreshTokenCookie(res);
  return sendSuccess(res, 'Logged out successfully.');
};

/**
 * @route   POST /api/v1/auth/logout-all
 */
const logoutAll = async (req, res) => {
  await authService.logoutAll(req.user._id.toString());
  clearRefreshTokenCookie(res);
  return sendSuccess(res, 'All sessions terminated successfully.');
};

/**
 * @route   POST /api/v1/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new BadRequestError('Refresh token is required.');

  const meta = getRequestMeta(req);
  const tokens = await authService.refreshTokens(token, meta);

  setRefreshTokenCookie(res, tokens.refreshToken);

  return sendSuccess(res, 'Token refreshed successfully.', {
    accessToken: tokens.accessToken,
    tokenType: 'Bearer',
    expiresIn: tokens.expiresIn,
  });
};

/**
 * @route   GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  const user = await authService.getMe(req.user._id.toString());
  return sendSuccess(res, 'User profile retrieved successfully.', user);
};

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @route   POST /api/v1/auth/verify-email
 */
const verifyEmail = async (req, res) => {
  const validatedData = validateOrThrow(validateVerifyEmail, {
    token: req.params.token || req.body.token || req.query.token,
  });

  const result = await authService.verifyEmail(validatedData.token);
  return sendSuccess(res, result.message, result.user || null);
};

/**
 * @route   POST /api/v1/auth/resend-verification
 */
const resendVerification = async (req, res) => {
  const validatedData = validateOrThrow(validateResendVerification, req.body);
  const result = await authService.resendVerificationEmail(validatedData.email);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  const validatedData = validateOrThrow(validateForgotPassword, req.body);
  const dto = new ForgotPasswordDTO(validatedData);
  const result = await authService.forgotPassword(dto.email);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res) => {
  const validatedData = validateOrThrow(validateResetPassword, req.body);
  const dto = new ResetPasswordDTO(validatedData);
  const result = await authService.resetPassword(dto.token, dto.password);
  // FIX: clear cookie on reset — all existing sessions are revoked server-side
  clearRefreshTokenCookie(res);
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/change-password
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
 */
const getActiveSessions = async (req, res) => {
  const sessions = await authService.getActiveSessions(req.user._id.toString());
  return sendSuccess(res, 'Active sessions retrieved.', sessions);
};

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 */
const revokeSession = async (req, res) => {
  const { sessionId } = req.params;
  await authService.revokeSession(req.user._id.toString(), sessionId);
  return sendSuccess(res, 'Session revoked successfully.');
};

/**
 * @route   POST /api/v1/auth/2fa/setup
 */
const setup2FA = async (req, res) => {
  const result = await authService.setupTwoFactor(req.user._id.toString());
  return sendSuccess(res, result.message, { qrCode: result.qrCode, secret: result.secret });
};

/**
 * @route   POST /api/v1/auth/2fa/enable
 */
const enable2FA = async (req, res) => {
  const validatedData = validateOrThrow(validateTwoFactorVerify, req.body);
  const result = await authService.enableTwoFactor(req.user._id.toString(), validatedData.token);
  return sendSuccess(res, result.message, { recoveryCodes: result.recoveryCodes });
};

/**
 * @route   POST /api/v1/auth/2fa/disable
 */
const disable2FA = async (req, res) => {
  const validatedData = validateOrThrow(validateDisableTwoFactor, req.body);
  const result = await authService.disableTwoFactor(
    req.user._id.toString(),
    validatedData.password,
  );
  return sendSuccess(res, result.message);
};

/**
 * @route   POST /api/v1/auth/2fa/verify
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

  return sendSuccess(
    res,
    'Two-factor authentication verified. Login successful.',
    sanitiseTokenResponse(result),
  );
};

/**
 * @route   GET /api/v1/auth/oauth/google/callback
 */
const googleOAuthCallback = async (req, res) => {
  try {
    const meta = getRequestMeta(req);
    const result = await authService.handleOAuthLogin(req.user, 'google', meta);

    setRefreshTokenCookie(res, result.tokens.refreshToken);

    return res.redirect(`${env.FRONTEND_URL}/?auth=oauth-success`);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.redirect(`${env.FRONTEND_URL}/?auth=login&error=oauth_failed`);
  }
};

/**
 * @route   GET /api/v1/auth/oauth/facebook/callback
 */
const facebookOAuthCallback = async (req, res) => {
  try {
    const meta = getRequestMeta(req);
    const result = await authService.handleOAuthLogin(req.user, 'facebook', meta);

    setRefreshTokenCookie(res, result.tokens.refreshToken);

    return res.redirect(`${env.FRONTEND_URL}/?auth=oauth-success`);
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.redirect(`${env.FRONTEND_URL}/?auth=login&error=oauth_failed`);
  }
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
  revokeSession,
  setup2FA,
  enable2FA,
  disable2FA,
  verifyTwoFactor,
  googleOAuthCallback,
  facebookOAuthCallback,
};
