'use strict';
const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  event:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType' },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quantity:   { type: Number, default: 1, min: 1 },
  status:     { type: String, enum: ['waiting','notified','booked','expired'], default: 'waiting', index: true },
  position:   { type: Number },
  notifiedAt: { type: Date },
  expiresAt:  { type: Date },
}, { timestamps: true });

waitlistSchema.index({ event: 1, ticketType: 1, status: 1, createdAt: 1 });
waitlistSchema.index({ user: 1, status: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);
module.exports = Waitlist;
