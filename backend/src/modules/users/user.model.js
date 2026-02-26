'use strict';

const mongoose = require('mongoose');
const { ROLES } = require('../../common/constants/roles');

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ─────────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },

    // ── Authentication ─────────────────────────────────────────────────────────
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: `Role must be one of: ${Object.values(ROLES).join(', ')}`,
      },
      default: ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ── Email Verification ──────────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ── Password Reset ──────────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },

    // ── OAuth ───────────────────────────────────────────────────────────────────
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    facebookId: {
      type: String,
      sparse: true,
      index: true,
    },
    oauthProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },

    // ── Two-Factor Authentication ───────────────────────────────────────────────
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorRecoveryCodes: {
      type: [String],
      select: false,
    },

    // ── OTP ─────────────────────────────────────────────────────────────────────
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },

    // ── Profile ─────────────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    // ── Security Tracking ──────────────────────────────────────────────────────
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
      select: false,
    },
    lastLoginDevice: {
      type: String,
      select: false,
    },

    // ── Soft Delete ─────────────────────────────────────────────────────────────
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// ── Instance Methods ──────────────────────────────────────────────────────────

/**
 * Check if password was changed after a given JWT timestamp
 */
userSchema.methods.wasPasswordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedAt;
  }
  return false;
};

/**
 * Increment login attempts and lock account if threshold exceeded
 */
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  // Reset if previous lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates);
};

/**
 * Reset login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Return safe user object (without sensitive fields)
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.passwordChangedAt;
  delete obj.twoFactorSecret;
  delete obj.twoFactorRecoveryCodes;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.lastLoginIp;
  return obj;
};

// ── Static Methods ────────────────────────────────────────────────────────────

/**
 * Find active (non-deleted) user by email
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), deletedAt: null });
};

/**
 * Find user by ID excluding deleted
 */
userSchema.statics.findActiveById = function (id) {
  return this.findOne({ _id: id, deletedAt: null, isActive: true });
};

// ── Query Middleware ──────────────────────────────────────────────────────────

// ── Query Middleware ──────────────────────────────────────────

// Auto-exclude soft-deleted users from all find queries
userSchema.pre(/^find/, function () {
  const query = this.getQuery();

  // Allow explicitly querying deleted users
  if (query.deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
