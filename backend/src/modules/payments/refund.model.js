'use strict';
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  payment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Payment',  required: true, index: true },
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',  required: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
  amount:    { type: Number, required: true, min: 0 },
  currency:  { type: String, default: 'USD', uppercase: true },
  reason:    { type: String, trim: true },
  status:    { type: String, enum: ['pending','approved','rejected','processed'], default: 'pending', index: true },
  gatewayRefundId: { type: String },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:     { type: String, trim: true },
}, { timestamps: true });

refundSchema.index({ payment: 1 });
refundSchema.index({ user: 1, status: 1 });

const Refund = mongoose.model('Refund', refundSchema);
module.exports = Refund;
