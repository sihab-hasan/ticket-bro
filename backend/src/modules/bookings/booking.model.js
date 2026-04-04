'use strict';
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BOOKING_STATUS = Object.freeze({
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  CANCELLED:  'cancelled',
  REFUNDED:   'refunded',
  EXPIRED:    'expired',
  CHECKED_IN: 'checked_in',
});

const attendeeSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName:  { type: String, trim: true },
  email:     { type: String, trim: true, lowercase: true },
  phone:     { type: String, trim: true },
}, { _id: false });

const bookingItemSchema = new mongoose.Schema({
  ticketTypeId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketTypeName: { type: String, required: true, trim: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true, min: 0 },
  totalPrice:  { type: Number, required: true, min: 0 },
  seats:       [{ section: String, row: String, number: String }],
  attendees:   [attendeeSchema],
}, { _id: true });

const bookingSchema = new mongoose.Schema({
  bookingRef: {
    type: String, unique: true, index: true,
    default: () => `BK-${Date.now()}-${uuidv4().slice(0,6).toUpperCase()}`,
  },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  index: true },
  items:     [bookingItemSchema],

  subtotal:    { type: Number, required: true, min: 0 },
  discount:    { type: Number, default: 0, min: 0 },
  tax:         { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency:    { type: String, default: 'USD', uppercase: true, trim: true },

  promoCode:      { type: String, trim: true, uppercase: true },
  promoId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
  discountAmount: { type: Number, default: 0, min: 0 },

  contactName:  { type: String, trim: true },
  contactEmail: { type: String, trim: true, lowercase: true },
  contactPhone: { type: String, trim: true },

  status: {
    type: String, enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING, index: true,
  },

  payment:       { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending', index: true },
  paidAt:        { type: Date },
  expiresAt:     { type: Date, index: true },

  cancelledAt:     { type: Date },
  cancelReason:    { type: String, trim: true },
  cancelledBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refundRequested: { type: Boolean, default: false },
  refundedAt:      { type: Date },
  refundAmount:    { type: Number, default: 0, min: 0 },

  checkedInAt: { type: Date },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  cartId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ event: 1, status: 1 });
bookingSchema.index({ organizer: 1, createdAt: -1 });
bookingSchema.index({ bookingRef: 1, user: 1 });

bookingSchema.virtual('totalTickets').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});
bookingSchema.virtual('isPaid').get(function () { return this.paymentStatus === 'paid'; });
bookingSchema.virtual('isExpired').get(function () {
  return this.status === 'pending' && this.expiresAt ? new Date(this.expiresAt).getTime() < Date.now() : false;
});
bookingSchema.virtual('isCancellable').get(function () {
  return ['pending','confirmed'].includes(this.status);
});

bookingSchema.statics.BOOKING_STATUS = BOOKING_STATUS;

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
