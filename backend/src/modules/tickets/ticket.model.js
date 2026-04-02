'use strict';
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TICKET_STATUS = Object.freeze({
  ACTIVE:     'active',
  USED:       'used',
  CANCELLED:  'cancelled',
  EXPIRED:    'expired',
  TRANSFERRED:'transferred',
});

const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String, unique: true, index: true,
    default: () => `TK-${uuidv4().replace(/-/g,'').slice(0,12).toUpperCase()}`,
  },
  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  event:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event',   required: true, index: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
  ticketTypeName: { type: String, trim: true },

  price:    { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', uppercase: true },

  seat: { section: String, row: String, number: String },

  attendee: {
    firstName: String,
    lastName:  String,
    email:     String,
    phone:     String,
  },

  status:  { type: String, enum: Object.values(TICKET_STATUS), default: TICKET_STATUS.ACTIVE, index: true },
  qrCode:  { type: String, select: false }, // base64 QR or URL

  usedAt:        { type: Date },
  cancelledAt:   { type: Date },
  transferredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transferredAt: { type: Date },

  deletedAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ticketSchema.index({ booking: 1 });
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ event: 1, status: 1 });

ticketSchema.statics.TICKET_STATUS = TICKET_STATUS;

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
