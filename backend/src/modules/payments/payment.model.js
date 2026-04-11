'use strict';
const mongoose = require('mongoose');

const PAYMENT_STATUS = Object.freeze({
  PENDING:   'pending',
  PROCESSING:'processing',
  SUCCEEDED: 'succeeded',
  FAILED:    'failed',
  REFUNDED:  'refunded',
  CANCELLED: 'cancelled',
});

const PAYMENT_GATEWAY = Object.freeze({
  STRIPE:   'stripe',
  PAYPAL:   'paypal',
  RAZORPAY: 'razorpay',
  MANUAL:   'manual',
});

const paymentSchema = new mongoose.Schema({
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event',   index: true },

  amount:    { type: Number, required: true, min: 0 },
  currency:  { type: String, default: 'USD', uppercase: true, trim: true },
  tax:       { type: Number, default: 0, min: 0 },
  discount:  { type: Number, default: 0, min: 0 },

  status:    { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING, index: true },
  gateway:   { type: String, enum: Object.values(PAYMENT_GATEWAY), default: PAYMENT_GATEWAY.STRIPE },

  // Gateway-specific fields
  gatewayPaymentId:  { type: String, sparse: true },  // Stripe payment_intent / PayPal order id
  gatewayCustomerId: { type: String },
  clientSecret:      { type: String, select: false },
  gatewayResponse:   { type: mongoose.Schema.Types.Mixed, select: false },

  // Refund
  refundId:     { type: String },
  refundAmount: { type: Number, default: 0, min: 0 },
  refundReason: { type: String, trim: true },
  refundedAt:   { type: Date },

  // Metadata
  paymentMethod: {
    type: { type: String },  // card, bank_transfer, wallet
    last4: String,
    brand: String,
    expMonth: Number,
    expYear:  Number,
  },

  failureCode:    { type: String },
  failureMessage: { type: String },

  paidAt:     { type: Date },
  expiresAt:  { type: Date },
  deletedAt:  { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });

paymentSchema.statics.PAYMENT_STATUS  = PAYMENT_STATUS;
paymentSchema.statics.PAYMENT_GATEWAY = PAYMENT_GATEWAY;

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
