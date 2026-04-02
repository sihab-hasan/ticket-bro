'use strict';
const mongoose = require('mongoose');

// Coupon usage tracking (which users have used which promotions)
const couponUsageSchema = new mongoose.Schema({
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true, index: true },
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  discount:  { type: Number, required: true, min: 0 },
  usedAt:    { type: Date, default: Date.now },
}, { timestamps: false });

couponUsageSchema.index({ promotion: 1, user: 1 }, { unique: true });

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);
module.exports = CouponUsage;
