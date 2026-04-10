'use strict';
const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  email: {
    bookingConfirmed: { type: Boolean, default: true },
    bookingCancelled: { type: Boolean, default: true },
    paymentSuccess: { type: Boolean, default: true },
    refundProcessed: { type: Boolean, default: true },
    eventUpdated: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
  },
  push: {
    bookingReminder: { type: Boolean, default: true },
    newEvents: { type: Boolean, default: false },
  },
  sms: {
    bookingConfirmed: { type: Boolean, default: false },
    eventReminder: { type: Boolean, default: false },
  },
  soundEnabled: { type: Boolean, default: true },
  doNotDisturb: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' },
    endTime: { type: String, default: '08:00' },
  },
  pushSubscriptions: [{
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    expirationTime: { type: Date },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
module.exports = NotificationPreferences;