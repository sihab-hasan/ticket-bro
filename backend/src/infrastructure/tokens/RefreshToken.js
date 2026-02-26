'use strict';

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    deviceInfo: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedReason: {
      type: String,
      enum: ['logout', 'password_change', 'manual_revoke', 'rotation', 'security'],
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index - auto delete
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ token: 1, isRevoked: 1 });

// ── Instance Methods ──────────────────────────────────────────────────────────

refreshTokenSchema.methods.revoke = async function (reason = 'manual_revoke') {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isValid = function () {
  return !this.isRevoked && !this.isExpired();
};

// ── Static Methods ────────────────────────────────────────────────────────────

/**
 * Revoke all refresh tokens for a user
 */
refreshTokenSchema.statics.revokeAllForUser = async function (userId, reason = 'manual_revoke') {
  return this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true, revokedAt: new Date(), revokedReason: reason },
  );
};

/**
 * Get all active sessions for a user
 */
refreshTokenSchema.statics.getActiveSessionsForUser = function (userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

/**
 * Count active sessions for a user
 */
refreshTokenSchema.statics.countActiveSessions = function (userId) {
  return this.countDocuments({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
