'use strict';
const mongoose = require('mongoose');

// Stores active user sessions (complements the JWT refresh token flow)
const sessionSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token:      { type: String, required: true, unique: true },
  device:     { type: String, trim: true },
  ip:         { type: String, trim: true },
  userAgent:  { type: String, trim: true },
  isActive:   { type: Boolean, default: true, index: true },
  lastSeenAt: { type: Date, default: Date.now },
  expiresAt:  { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

sessionSchema.index({ user: 1, isActive: 1 });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
