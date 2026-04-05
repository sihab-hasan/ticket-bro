"use strict";

// backend/src/modules/auth/auth.service.js
//
// CHANGES FROM ORIGINAL:
//   1. login()  — added email-verified check (step 5) with helpful error message
//   2. login()  — step numbers shifted by 1 after the new check
//   3. Everything else is identical to your original

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const authRepository = require("./auth.repository");
const emailService = require("../../infrastructure/mail/emailService");
const {
  hashPassword,
  comparePassword,
  hashToken,
  generateOTP,
  getOTPExpiry,
  generateRecoveryCodes,
} = require("../../common/utils/encryption");
const {
  generateTokenPair,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
} = require("../../common/utils/tokenGenerator");
const { AuthResponseDTO, UserResponseDTO, TokenDTO } = require("./dtos/index");
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require("../../common/errors/AppError");
const authConfig = require("../../config/auth.config");
const env = require("../../config/env");
const logger = require("../../infrastructure/logger/logger");

class AuthService {
  // ── Register ────────────────────────────────────────────────────────────────

  async register(registerData) {
    const { firstName, lastName, email, password, phone, role } = registerData;

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("An account with this email already exists.");
    }

    const hashedPassword = await hashPassword(password);

    const user = await authRepository.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
      oauthProvider: "local",
    });

    const verificationToken = generateEmailVerificationToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: "email_verification",
    });

    const hashedVerificationToken = hashToken(verificationToken);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await authRepository.setEmailVerificationToken(
      user._id,
      hashedVerificationToken,
      expires,
    );

    const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    await emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl,
    });

    logger.info(`User registered: ${user.email} [${user._id}]`);

    return {
      user: new UserResponseDTO(user),
      requiresEmailVerification: true,
    };
  }

  // ── Login ───────────────────────────────────────────────────────────────────

  async login(loginData, meta = {}) {
    const { email, password } = loginData;
    const { ipAddress, userAgent } = meta;

    // 1. Find user (with password field)
    const user = await authRepository.findUserByEmail(email, true);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 2. Check account is active
    if (!user.isActive) {
      const statusLabel = user.status || 'deactivated';
      throw new ForbiddenError(
        `Your account is ${statusLabel}. Please contact support.`,
      );
    }

    // 3. Check account lock
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      throw new ForbiddenError(
        `Account is temporarily locked. Please try again in ${lockTime} minutes.`,
      );
    }

    // 4. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new UnauthorizedError("Invalid email or password.");
    }

    // ── STEP 5 (NEW): Block login if email is not verified ───────────────────
    if (!user.isEmailVerified) {
      // Resend a fresh verification email so the user isn't stuck
      await this._resendVerificationIfPossible(user);

      throw new ForbiddenError(
        "Please verify your email address before logging in. " +
          "A new verification link has been sent to your inbox.",
      );
    }

    // 6. Check 2FA
    if (user.isTwoFactorEnabled) {
      const otp = generateOTP();
      const otpExpires = getOTPExpiry(10);
      await authRepository.setOTP(user._id, otp, otpExpires);
      await emailService.sendOTPEmail({
        to: user.email,
        firstName: user.firstName,
        otp,
        purpose: "2FA login verification",
      });

      return {
        requiresTwoFactor: true,
        message: "OTP sent to your email. Please verify to complete login.",
        email: user.email,
      };
    }

    // 7. Reset attempts + update last login
    await user.resetLoginAttempts();
    await authRepository.updateLastLogin(user._id, {
      ipAddress,
      device: userAgent,
    });

    // 8. Generate tokens
    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    // 9. Store refresh token (enforce session limit)
    await authRepository.deleteOldestSessionIfLimitExceeded(user._id);
    await this._storeRefreshToken(
      user._id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    // 10. Login alert (production only)
    if (env.isProduction()) {
      await emailService.sendLoginAlertEmail({
        to: user.email,
        firstName: user.firstName,
        ipAddress: ipAddress || "Unknown",
        device: userAgent || "Unknown",
        time: new Date().toUTCString(),
      });
    }

    logger.info(`User logged in: ${user.email} [IP: ${ipAddress}]`);

    return new AuthResponseDTO({
      user,
      tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn },
    });
  }

  // ── Verify 2FA OTP ──────────────────────────────────────────────────────────

  async verifyTwoFactorLogin(email, otp, meta = {}) {
    const { ipAddress, userAgent } = meta;

    const user = await authRepository.findUserByOTP(email, otp);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired OTP.");
    }

    if (!user.isActive) {
      const statusLabel = user.status || 'deactivated';
      throw new ForbiddenError(
        `Your account is ${statusLabel}. Please contact support.`,
      );
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError("Please verify your email address before logging in.");
    }

    await authRepository.clearOTP(user._id);
    await user.resetLoginAttempts();
    await authRepository.updateLastLogin(user._id, {
      ipAddress,
      device: userAgent,
    });

    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    await authRepository.deleteOldestSessionIfLimitExceeded(user._id);
    await this._storeRefreshToken(
      user._id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    logger.info(`User 2FA verified and logged in: ${user.email}`);

    return new AuthResponseDTO({
      user,
      tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn },
    });
  }

  // ── Logout ──────────────────────────────────────────────────────────────────

  async logout(refreshToken) {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken, "logout");
    }
    return { message: "Logged out successfully." };
  }

  async logoutAll(userId) {
    await authRepository.revokeAllUserRefreshTokens(userId, "logout");
    return { message: "All sessions terminated successfully." };
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────

  async refreshTokens(refreshToken, meta = {}) {
    const { ipAddress, userAgent } = meta;

    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await authRepository.findRefreshToken(refreshToken);
    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedError(
        "Invalid or expired refresh token. Please login again.",
      );
    }

    const user = await authRepository.findUserById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User not found.");
    }

    if (user.wasPasswordChangedAfter(decoded.iat)) {
      await authRepository.revokeRefreshToken(refreshToken, "password_change");
      throw new UnauthorizedError(
        "Password was recently changed. Please login again.",
      );
    }

    await authRepository.revokeRefreshToken(refreshToken, "rotation");

    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    await this._storeRefreshToken(
      user._id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    storedToken.lastUsedAt = new Date();
    await storedToken.save();

    return new TokenDTO({
      ...tokens,
      expiresIn: authConfig.jwt.accessToken.expiresIn,
    });
  }

  // ── Email Verification ──────────────────────────────────────────────────────

  async verifyEmail(token) {
    verifyEmailVerificationToken(token);

    const hashedToken = hashToken(token);
    const user =
      await authRepository.findUserByEmailVerificationToken(hashedToken);

    if (!user) {
      throw new BadRequestError(
        "Invalid or expired verification link. Please request a new one.",
      );
    }

    if (user.isEmailVerified) {
      return { message: "Email is already verified." };
    }

    const updatedUser = await authRepository.markEmailAsVerified(user._id);

    // Send welcome email now that the address is confirmed
    const browseUrl = `${env.FRONTEND_URL}/browse`;
    await emailService.sendWelcomeEmail({
      to: updatedUser.email,
      firstName: updatedUser.firstName,
      browseUrl,
    }).catch((err) =>
      logger.warn(`Failed to send welcome email for ${updatedUser.email}: ${err.message}`)
    );

    logger.info(`Email verified for user: ${user.email}`);

    return {
      message: "Email verified successfully.",
      user: new UserResponseDTO(updatedUser),
    };
  }

  async resendVerificationEmail(email) {
    const GENERIC_MSG =
      "If an account with this email exists, a new verification link has been sent.";

    const user = await authRepository.findUserByEmail(email);

    // Always return the generic message for not-found, already-verified,
    // or inactive accounts — avoids leaking account existence.
    if (!user || user.isEmailVerified || !user.isActive) {
      return { message: GENERIC_MSG };
    }

    const verificationToken = generateEmailVerificationToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: "email_verification",
    });

    const hashedToken = hashToken(verificationToken);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await authRepository.setEmailVerificationToken(
      user._id,
      hashedToken,
      expires,
    );

    const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

    // Non-blocking — a mail failure should not surface a 500 to the user
    emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl,
    }).catch((err) =>
      logger.warn(`Failed to resend verification email to ${user.email}: ${err.message}`)
    );

    logger.info(`Verification email resent to: ${user.email}`);

    return { message: GENERIC_MSG };
  }

  // ── Forgot Password ─────────────────────────────────────────────────────────

  async forgotPassword(email) {
    const genericMessage =
      "If an account with this email exists, a password reset link has been sent.";

    const user = await authRepository.findUserByEmail(email);
    if (!user || !user.isActive) return { message: genericMessage };

    const resetToken = generatePasswordResetToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: "password_reset",
    });
    const hashedToken = hashToken(resetToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
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
    verifyPasswordResetToken(token);

    const hashedToken = hashToken(token);
    const user = await authRepository.findUserByPasswordResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError(
        "Invalid or expired password reset link. Please request a new one.",
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepository.updatePassword(user._id, hashedPassword);
    await authRepository.revokeAllUserRefreshTokens(
      user._id,
      "password_change",
    );

    await emailService.sendPasswordChangedEmail({
      to: user.email,
      firstName: user.firstName,
    });

    logger.info(`Password reset successful for: ${user.email}`);
    return {
      message:
        "Password has been reset successfully. Please login with your new password.",
    };
  }

  // ── Change Password ─────────────────────────────────────────────────────────

  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserById(userId, true);
    if (!user) throw new NotFoundError("User not found.");

    const isCurrentValid = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestError(
        "New password must be different from your current password.",
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, hashedPassword);
    await authRepository.revokeAllUserRefreshTokens(userId, "password_change");

    await emailService.sendPasswordChangedEmail({
      to: user.email,
      firstName: user.firstName,
    });

    logger.info(`Password changed for user: ${user.email}`);
    return { message: "Password changed successfully. Please login again." };
  }

  // ── Get Me ──────────────────────────────────────────────────────────────────

  async getMe(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User not found.");
    return new UserResponseDTO(user);
  }

  // ── Active Sessions ─────────────────────────────────────────────────────────

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

  // ── 2FA ──────────────────────────────────────────────────────────────────────

  async setupTwoFactor(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError("User not found.");

    const secret = speakeasy.generateSecret({
      name: `${authConfig.twoFactor.appName} (${user.email})`,
      length: 20,
    });

    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    await authRepository.updateUser(userId, { twoFactorSecret: secret.base32 });

    return {
      secret: secret.base32,
      qrCode: qrCodeDataURL,
      message:
        "Scan the QR code with your authenticator app, then verify to enable 2FA.",
    };
  }

  async enableTwoFactor(userId, token) {
    const user = await authRepository.getUserWithTwoFactor(userId);
    if (!user) throw new NotFoundError("User not found.");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: authConfig.twoFactor.window,
    });

    if (!isValid)
      throw new BadRequestError("Invalid 2FA token. Please try again.");

    const recoveryCodes = generateRecoveryCodes(8);
    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map((c) => hashPassword(c)),
    );
    await authRepository.set2FASecret(
      userId,
      user.twoFactorSecret,
      hashedRecoveryCodes,
    );

    return { message: "2FA enabled successfully.", recoveryCodes };
  }

  async disableTwoFactor(userId, password) {
    const user = await authRepository.findUserById(userId, true);
    if (!user) throw new NotFoundError("User not found.");

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new UnauthorizedError("Password is incorrect.");

    await authRepository.disable2FA(userId);
    return { message: "2FA disabled successfully." };
  }

  // ── OAuth ─────────────────────────────────────────────────────────────────

  async handleOAuthLogin(profile, provider, meta = {}) {
    const { ipAddress, userAgent } = meta;
    const email = profile.emails?.[0]?.value;
    const providerId = profile.id;

    let user;
    if (provider === "google") {
      user = await authRepository.findUserByGoogleId(providerId);
    } else if (provider === "facebook") {
      user = await authRepository.findUserByFacebookId(providerId);
    }

    if (!user && email) {
      user = await authRepository.findUserByEmail(email);
      if (user) {
        const updateData = {
          oauthProvider: provider,
          isEmailVerified: true,
        };
        if (provider === "google") updateData.googleId = providerId;
        if (provider === "facebook") updateData.facebookId = providerId;
        if (!user.avatar && profile.photos?.[0]?.value) {
          updateData.avatar = profile.photos[0].value;
        }
        user = await authRepository.updateUser(user._id, updateData);
      }
    }

    if (!user) {
      if (!email) {
        throw new BadRequestError(
          `Your ${provider} account did not provide an email address. Please use a different sign-in method.`,
        );
      }

      const firstName =
        profile.name?.givenName || profile.displayName?.split(" ")[0] || "User";
      const lastName =
        profile.name?.familyName || profile.displayName?.split(" ")[1] || "";
      const avatar = profile.photos?.[0]?.value || null;

      const createData = {
        firstName,
        lastName,
        email,
        isEmailVerified: true, // OAuth providers already verified the email
        oauthProvider: provider,
        avatar,
      };
      if (provider === "google") createData.googleId = providerId;
      if (provider === "facebook") createData.facebookId = providerId;

      user = await authRepository.createUser(createData);
    }

    if (!user.isActive) {
      throw new ForbiddenError("Your account has been deactivated.");
    }

    await authRepository.updateLastLogin(user._id, {
      ipAddress,
      device: userAgent,
    });

    const tokenPayload = this._buildTokenPayload(user);
    const tokens = generateTokenPair(tokenPayload);

    await authRepository.deleteOldestSessionIfLimitExceeded(user._id);
    await this._storeRefreshToken(
      user._id,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    logger.info(`OAuth login [${provider}]: ${user.email}`);

    return new AuthResponseDTO({
      user,
      tokens: { ...tokens, expiresIn: authConfig.jwt.accessToken.expiresIn },
    });
  }

  // ── Revoke Single Session ────────────────────────────────────────────────

  async revokeSession(userId, sessionId) {
    const session = await authRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found.');
    }
    // Ownership check — users can only revoke their own sessions
    if (session.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to revoke this session.');
    }
    await session.revoke('manual_revoke');
    logger.info(`Session ${sessionId} revoked by user ${userId}`);
    return { message: 'Session revoked successfully.' };
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  _buildTokenPayload(user) {
    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async _storeRefreshToken(userId, token, ipAddress, userAgent) {
    const expiresAt = new Date(Date.now() + authConfig.cookie.maxAge);
    return authRepository.createRefreshToken({
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    });
  }

  // Silently resend a fresh verification link — used when unverified user tries to login.
  // Wrapped in try/catch so a mail failure never blocks the login error response.
  async _resendVerificationIfPossible(user) {
    try {
      const verificationToken = generateEmailVerificationToken({
        userId: user._id.toString(),
        email: user.email,
        purpose: "email_verification",
      });

      const hashedToken = hashToken(verificationToken);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await authRepository.setEmailVerificationToken(
        user._id,
        hashedToken,
        expires,
      );

      const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
      await emailService.sendVerificationEmail({
        to: user.email,
        firstName: user.firstName,
        verificationUrl,
      });

      logger.info(`Resent verification email on login attempt: ${user.email}`);
    } catch (err) {
      logger.warn(
        `Failed to resend verification email for ${user.email}: ${err.message}`,
      );
    }
  }
}

module.exports = new AuthService();
