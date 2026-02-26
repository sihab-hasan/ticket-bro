'use strict';

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const authRepository = require('./auth.repository');
const emailService = require('../../infrastructure/mail/emailService');
const { hashPassword, comparePassword, generateSecureToken, hashToken, generateOTP, getOTPExpiry } = require('../../common/utils/encryption');
const {
  generateTokenPair,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
} = require('../../common/utils/tokenGenerator');
const { AuthResponseDTO, UserResponseDTO, TokenDTO } = require('./dtos/index');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require('../../common/errors/AppError');
const authConfig = require('../../config/auth.config');
const env = require('../../config/env');
const logger = require("../../infrastructure/logger/logger");

class AuthService {
  // ── Register ────────────────────────────────────────────────────────────────

  async register(registerData) {
    const { firstName, lastName, email, password, phone, role } = registerData;

    // 1. Check existing user
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists.');
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(password);

    // 3. Create user
    const user = await authRepository.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
      oauthProvider: 'local',
    });

    // 4. Generate email verification token (JWT)
    const verificationToken = generateEmailVerificationToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: 'email_verification',
    });

    // 5. Store hashed token in DB
    const hashedVerificationToken = hashToken(verificationToken);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await authRepository.setEmailVerificationToken(user._id, hashedVerificationToken, expires);

    // 6. Send welcome email
    const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    await emailService.sendWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl,
    });

    // 7. Generate tokens
    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    // 8. Store refresh token
    await this._storeRefreshToken(user._id, tokens.refreshToken, null, null);

    logger.info(`User registered: ${user.email} [${user._id}]`);

    return new AuthResponseDTO({ user, tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn } });
  }

  // ── Login ───────────────────────────────────────────────────────────────────

  async login(loginData, meta = {}) {
    const { email, password } = loginData;
    const { ipAddress, userAgent } = meta;

    // 1. Find user with password
    const user = await authRepository.findUserByEmail(email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 2. Check if account is active
    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact support.');
    }

    // 3. Check account lock
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      throw new ForbiddenError(`Account is temporarily locked. Please try again in ${lockTime} minutes.`);
    }

    // 4. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 5. Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      // Generate and send OTP, return partial response
      const otp = generateOTP();
      const otpExpires = getOTPExpiry(10);
      await authRepository.setOTP(user._id, otp, otpExpires);
      await emailService.sendOTPEmail({
        to: user.email,
        firstName: user.firstName,
        otp,
        purpose: '2FA login verification',
      });

      return {
        requiresTwoFactor: true,
        message: 'OTP sent to your email. Please verify to complete login.',
        email: user.email,
      };
    }

    // 6. Reset login attempts and update last login
    await user.resetLoginAttempts();
    await authRepository.updateLastLogin(user._id, { ipAddress, device: userAgent });

    // 7. Generate tokens
    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    // 8. Store refresh token (enforce session limit)
    await authRepository.deleteOldestSessionIfLimitExceeded(user._id);
    await this._storeRefreshToken(user._id, tokens.refreshToken, ipAddress, userAgent);

    // 9. Send login alert (optional - in production only)
    if (env.isProduction()) {
      await emailService.sendLoginAlertEmail({
        to: user.email,
        firstName: user.firstName,
        ipAddress: ipAddress || 'Unknown',
        device: userAgent || 'Unknown',
        time: new Date().toUTCString(),
      });
    }

    logger.info(`User logged in: ${user.email} [IP: ${ipAddress}]`);

    return new AuthResponseDTO({ user, tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn } });
  }

  // ── Verify 2FA OTP ──────────────────────────────────────────────────────────

  async verifyTwoFactorLogin(email, otp, meta = {}) {
    const { ipAddress, userAgent } = meta;

    const user = await authRepository.findUserByOTP(email, otp);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired OTP.');
    }

    await authRepository.clearOTP(user._id);
    await user.resetLoginAttempts();
    await authRepository.updateLastLogin(user._id, { ipAddress, device: userAgent });

    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    await authRepository.deleteOldestSessionIfLimitExceeded(user._id);
    await this._storeRefreshToken(user._id, tokens.refreshToken, ipAddress, userAgent);

    logger.info(`User 2FA verified and logged in: ${user.email}`);

    return new AuthResponseDTO({ user, tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn } });
  }

  // ── Logout ──────────────────────────────────────────────────────────────────

  async logout(refreshToken) {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken, 'logout');
    }
    logger.info('User logged out');
    return { message: 'Logged out successfully.' };
  }

  async logoutAll(userId) {
    await authRepository.revokeAllUserRefreshTokens(userId, 'logout');
    logger.info(`All sessions revoked for user: ${userId}`);
    return { message: 'All sessions terminated successfully.' };
  }

  // ── Refresh Token ────────────────────────────────────────────────────────────

  async refreshTokens(refreshToken, meta = {}) {
    const { ipAddress, userAgent } = meta;

    // 1. Verify JWT
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Find token in DB
    const storedToken = await authRepository.findRefreshToken(refreshToken);
    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedError('Invalid or expired refresh token. Please login again.');
    }

    // 3. Get user
    const user = await authRepository.findUserById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    // 4. Check if password was changed after token issued
    if (user.wasPasswordChangedAfter(decoded.iat)) {
      await authRepository.revokeRefreshToken(refreshToken, 'password_change');
      throw new UnauthorizedError('Password was recently changed. Please login again.');
    }

    // 5. Revoke old refresh token (rotation)
    await authRepository.revokeRefreshToken(refreshToken, 'rotation');

    // 6. Generate new token pair
    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    // 7. Store new refresh token
    await this._storeRefreshToken(user._id, tokens.refreshToken, ipAddress, userAgent);

    // 8. Update last used
    storedToken.lastUsedAt = new Date();
    await storedToken.save();

    return new TokenDTO({ ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn });
  }

  // ── Email Verification ──────────────────────────────────────────────────────

  async verifyEmail(token) {
    // 1. Verify JWT
    const decoded = verifyEmailVerificationToken(token);

    // 2. Hash and look up in DB
    const hashedToken = hashToken(token);
    const user = await authRepository.findUserByEmailVerificationToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Invalid or expired verification link. Please request a new one.');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified.' };
    }

    // 3. Mark as verified
    const updatedUser = await authRepository.markEmailAsVerified(user._id);

    logger.info(`Email verified for user: ${user.email}`);

    return { message: 'Email verified successfully.', user: new UserResponseDTO(updatedUser) };
  }

  async resendVerificationEmail(email) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      // Security: don't reveal whether email exists
      return { message: 'If an account with this email exists, a verification email has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('This email address is already verified.');
    }

    const verificationToken = generateEmailVerificationToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: 'email_verification',
    });

    const hashedToken = hashToken(verificationToken);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await authRepository.setEmailVerificationToken(user._id, hashedToken, expires);

    const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    await emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl,
    });

    return { message: 'If an account with this email exists, a verification email has been sent.' };
  }

  // ── Forgot Password ─────────────────────────────────────────────────────────

  async forgotPassword(email) {
    const user = await authRepository.findUserByEmail(email);

    // Security: always return same message
    const genericMessage = 'If an account with this email exists, a password reset link has been sent.';

    if (!user) return { message: genericMessage };

    if (!user.isActive) return { message: genericMessage };

    const resetToken = generatePasswordResetToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: 'password_reset',
    });

    const hashedToken = hashToken(resetToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await authRepository.setPasswordResetToken(email, hashedToken, expires);

    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    });

    logger.info(`Password reset requested for: ${email}`);

    return { message: genericMessage };
  }

  // ── Reset Password ──────────────────────────────────────────────────────────

  async resetPassword(token, newPassword) {
    // 1. Verify JWT
    verifyPasswordResetToken(token);

    // 2. Hash and find in DB
    const hashedToken = hashToken(token);
    const user = await authRepository.findUserByPasswordResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset link. Please request a new one.');
    }

    // 3. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update password and revoke all sessions
    await authRepository.updatePassword(user._id, hashedPassword);
    await authRepository.revokeAllUserRefreshTokens(user._id, 'password_change');

    // 5. Send confirmation email
    await emailService.sendPasswordChangedEmail({
      to: user.email,
      firstName: user.firstName,
    });

    logger.info(`Password reset successful for: ${user.email}`);

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }

  // ── Change Password ─────────────────────────────────────────────────────────

  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserById(userId, true);
    if (!user) throw new NotFoundError('User not found.');

    // Verify current password
    const isCurrentValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    // Ensure new password differs from current
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestError('New password must be different from your current password.');
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, hashedPassword);
    await authRepository.revokeAllUserRefreshTokens(userId, 'password_change');

    await emailService.sendPasswordChangedEmail({
      to: user.email,
      firstName: user.firstName,
    });

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully. Please login again.' };
  }

  // ── Get Me ──────────────────────────────────────────────────────────────────

  async getMe(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found.');
    return new UserResponseDTO(user);
  }

  // ── Active Sessions ──────────────────────────────────────────────────────────

  async getActiveSessions(userId) {
    const sessions = await authRepository.getActiveUserSessions(userId);
    return sessions.map((s) => ({
      id: s._id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      expiresAt: s.expiresAt,
    }));
  }

  // ── 2FA Setup ────────────────────────────────────────────────────────────────

  async setupTwoFactor(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const secret = speakeasy.generateSecret({
      name: `${authConfig.twoFactor.appName} (${user.email})`,
      length: 20,
    });

    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () =>
      generateSecureToken(4).toUpperCase().match(/.{1,4}/g).join('-')
    );

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (not enabled until verified)
    await authRepository.updateUser(userId, { twoFactorSecret: secret.base32 });

    return {
      secret: secret.base32,
      qrCode: qrCodeDataURL,
      recoveryCodes,
      message: 'Scan the QR code with your authenticator app, then verify to enable 2FA.',
    };
  }

  async enableTwoFactor(userId, token) {
    const user = await authRepository.getUserWithTwoFactor(userId);
    if (!user) throw new NotFoundError('User not found.');

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: authConfig.twoFactor.window,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid 2FA token. Please try again.');
    }

    const recoveryCodes = Array.from({ length: 8 }, () =>
      generateSecureToken(4).toUpperCase().match(/.{1,4}/g).join('-')
    );

    const hashedRecoveryCodes = await Promise.all(recoveryCodes.map((c) => hashPassword(c)));
    await authRepository.set2FASecret(userId, user.twoFactorSecret, hashedRecoveryCodes);

    return { message: '2FA enabled successfully.', recoveryCodes };
  }

  async disableTwoFactor(userId, password) {
    const user = await authRepository.findUserById(userId, true);
    if (!user) throw new NotFoundError('User not found.');

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new UnauthorizedError('Password is incorrect.');

    await authRepository.disable2FA(userId);
    return { message: '2FA disabled successfully.' };
  }

  // ── OAuth ────────────────────────────────────────────────────────────────────

  async handleOAuthLogin(profile, provider, meta = {}) {
    const { ipAddress, userAgent } = meta;
    const email = profile.emails?.[0]?.value;
    const providerId = profile.id;

    // 1. Find existing user by provider ID
    let user;
    if (provider === 'google') {
      user = await authRepository.findUserByGoogleId(providerId);
    } else if (provider === 'facebook') {
      user = await authRepository.findUserByFacebookId(providerId);
    }

    // 2. If not found by provider ID, try by email
    if (!user && email) {
      user = await authRepository.findUserByEmail(email);
      if (user) {
        // Link provider to existing account
        const updateData = { oauthProvider: provider };
        if (provider === 'google') updateData.googleId = providerId;
        if (provider === 'facebook') updateData.facebookId = providerId;
        user = await authRepository.updateUser(user._id, updateData);
      }
    }

    // 3. Create new user if not found
    if (!user) {
      const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      const lastName = profile.name?.familyName || profile.displayName?.split(' ')[1] || '';
      const avatar = profile.photos?.[0]?.value || null;

      const createData = {
        firstName,
        lastName,
        email,
        isEmailVerified: true, // OAuth = email already verified
        oauthProvider: provider,
        avatar,
      };
      if (provider === 'google') createData.googleId = providerId;
      if (provider === 'facebook') createData.facebookId = providerId;

      user = await authRepository.createUser(createData);
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated.');
    }

    await authRepository.updateLastLogin(user._id, { ipAddress, device: userAgent });

    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    await authRepository.deleteOldestSessionIfLimitExceeded(user._id);
    await this._storeRefreshToken(user._id, tokens.refreshToken, ipAddress, userAgent);

    logger.info(`OAuth login [${provider}]: ${user.email}`);

    return new AuthResponseDTO({ user, tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn } });
  }

  // ── Private Helpers ──────────────────────────────────────────────────────────

  _buildTokenPayload(user) {
    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async _storeRefreshToken(userId, token, ipAddress, userAgent) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return authRepository.createRefreshToken({
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    });
  }
}

module.exports = new AuthService();
