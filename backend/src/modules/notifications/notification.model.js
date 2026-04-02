'use strict';
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, required: true, trim: true },  // booking_confirmed, event_cancelled, etc.
  title:   { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  data:    { type: mongoose.Schema.Types.Mixed },  // extra context (eventId, bookingRef, etc.)
  isRead:  { type: Boolean, default: false, index: true },
  readAt:  { type: Date },
  link:    { type: String, trim: true },  // deep-link
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
