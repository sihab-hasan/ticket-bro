'use strict';
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  payment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  type:     { type: String, enum: ['charge','refund','payout','fee','adjustment'], required: true },
  amount:   { type: Number, required: true },
  currency: { type: String, default: 'USD', uppercase: true },
  status:   { type: String, enum: ['pending','completed','failed'], default: 'pending' },
  gateway:  { type: String, trim: true },
  gatewayTransactionId: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

transactionSchema.index({ payment: 1 });
transactionSchema.index({ user: 1, type: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
