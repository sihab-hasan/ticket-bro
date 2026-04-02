'use strict';
const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  organizer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  amount:     { type: Number, required: true, min: 0 },
  currency:   { type: String, default: 'USD', uppercase: true },
  status:     { type: String, enum: ['pending','processing','completed','failed','cancelled'], default: 'pending', index: true },
  bankDetails:{ accountNumber: String, routingNumber: String, bankName: String, accountName: String },
  processedAt:{ type: Date },
  processedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:      { type: String, trim: true },
  deletedAt:  { type: Date, default: null },
}, { timestamps: true });

payoutSchema.index({ organizer: 1, createdAt: -1 });
const Payout = mongoose.model('Payout', payoutSchema);
module.exports = Payout;
