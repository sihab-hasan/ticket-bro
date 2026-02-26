'use strict';

const User = require('../../modules/users/user.model');
const RefreshToken = require('../../infrastructure/tokens/RefreshToken');
const authConfig = require('../../config/auth.config');

class AuthRepository {
  // ── User Operations ─────────────────────────────────────────────────────────

  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findUserByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase(), deletedAt: null });
    if (includePassword) {
      query.select('+password +loginAttempts +lockUntil');
    }
    return query.exec();
  }

  async findUserById(id, includePassword = false) {
    const query = User.findOne({ _id: id, deletedAt: null, isActive: true });
    if (includePassword) {
      query.select('+password +loginAttempts +lockUntil');
    }
    return query.exec();
  }

  async findUserByGoogleId(googleId) {
    return User.findOne({ googleId, deletedAt: null }).exec();
  }

  async findUserByFacebookId(facebookId) {
    return User.findOne({ facebookId, deletedAt: null }).exec();
  }

  async updateUser(id, updates) {
    return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).exec();
  }

  async updateUserByEmail(email, updates) {
    return User.findOneAndUpdate(
      { email: email.toLowerCase(), deletedAt: null },
      updates,
      { new: true, runValidators: true },
    ).exec();
  }

  async softDeleteUser(id) {
    return User.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true }).exec();
  }

  // ── Email Verification ──────────────────────────────────────────────────────

  async findUserByEmailVerificationToken(token) {
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
      deletedAt: null,
    })
      .select('+emailVerificationToken +emailVerificationExpires')
      .exec();
  }

  async setEmailVerificationToken(userId, token, expires) {
    return User.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    }).exec();
  }

  async markEmailAsVerified(userId) {
    return User.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
    }, { new: true }).exec();
  }

  // ── Password Reset ──────────────────────────────────────────────────────────

  async findUserByPasswordResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
      deletedAt: null,
    })
      .select('+passwordResetToken +passwordResetExpires')
      .exec();
  }

  async setPasswordResetToken(email, token, expires) {
    return User.findOneAndUpdate(
      { email: email.toLowerCase(), deletedAt: null },
      { passwordResetToken: token, passwordResetExpires: expires },
      { new: true },
    ).exec();
  }

  async updatePassword(userId, hashedPassword) {
    return User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
      },
      { new: true },
    ).exec();
  }

  // ── Login Tracking ──────────────────────────────────────────────────────────

  async updateLastLogin(userId, { ipAddress, device }) {
    return User.findByIdAndUpdate(
      userId,
      { lastLoginAt: new Date(), lastLoginIp: ipAddress, lastLoginDevice: device },
      { new: true },
    ).exec();
  }

  // ── OTP ─────────────────────────────────────────────────────────────────────

  async setOTP(userId, otp, expires) {
    return User.findByIdAndUpdate(userId, { otp, otpExpires: expires }).exec();
  }

  async findUserByOTP(email, otp) {
    return User.findOne({
      email: email.toLowerCase(),
      otp,
      otpExpires: { $gt: new Date() },
      deletedAt: null,
    })
      .select('+otp +otpExpires')
      .exec();
  }

  async clearOTP(userId) {
    return User.findByIdAndUpdate(userId, { $unset: { otp: 1, otpExpires: 1 } }).exec();
  }

  // ── 2FA ─────────────────────────────────────────────────────────────────────

  async set2FASecret(userId, secret, recoveryCodes) {
    return User.findByIdAndUpdate(
      userId,
      { twoFactorSecret: secret, twoFactorRecoveryCodes: recoveryCodes, isTwoFactorEnabled: true },
      { new: true },
    ).exec();
  }

  async disable2FA(userId) {
    return User.findByIdAndUpdate(
      userId,
      { isTwoFactorEnabled: false, $unset: { twoFactorSecret: 1, twoFactorRecoveryCodes: 1 } },
      { new: true },
    ).exec();
  }

  async getUserWithTwoFactor(userId) {
    return User.findById(userId).select('+twoFactorSecret +twoFactorRecoveryCodes').exec();
  }

  // ── Refresh Tokens ──────────────────────────────────────────────────────────

  async createRefreshToken(data) {
    const token = new RefreshToken(data);
    return token.save();
  }

  async findRefreshToken(token) {
    return RefreshToken.findOne({ token, isRevoked: false }).exec();
  }

  async revokeRefreshToken(token, reason = 'logout') {
    return RefreshToken.findOneAndUpdate(
      { token },
      { isRevoked: true, revokedAt: new Date(), revokedReason: reason },
      { new: true },
    ).exec();
  }

  async revokeAllUserRefreshTokens(userId, reason = 'logout') {
    return RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date(), revokedReason: reason },
    ).exec();
  }

  async getActiveUserSessions(userId) {
    return RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async countActiveUserSessions(userId) {
    return RefreshToken.countDocuments({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).exec();
  }

  async deleteOldestSessionIfLimitExceeded(userId) {
    const count = await this.countActiveUserSessions(userId);
    if (count >= authConfig.session.maxActiveSessions) {
      const oldest = await RefreshToken.findOne({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
        .sort({ createdAt: 1 })
        .exec();

      if (oldest) {
        await oldest.revoke('rotation');
      }
    }
  }
}

module.exports = new AuthRepository();
