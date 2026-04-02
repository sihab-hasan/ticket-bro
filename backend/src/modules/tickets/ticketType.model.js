'use strict';
const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  name:  { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  type:  { type: String, enum: ['general','vip','early_bird','group','backstage','online'], default: 'general' },
  price: { type: Number, required: true, min: 0 },
  quantity:     { type: Number, required: true, min: 0 },
  sold:         { type: Number, default: 0, min: 0 },
  reserved:     { type: Number, default: 0, min: 0 },
  maxPerOrder:  { type: Number, default: 10 },
  minPerOrder:  { type: Number, default: 1 },
  salesStart:   { type: Date },
  salesEnd:     { type: Date },
  isActive:     { type: Boolean, default: true, index: true },
  benefits:     [{ type: String, trim: true }],
  color:        { type: String, trim: true },
  sortOrder:    { type: Number, default: 0 },
  deletedAt:    { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ticketTypeSchema.index({ event: 1, isActive: 1 });

ticketTypeSchema.virtual('available').get(function () {
  return Math.max(0, this.quantity - this.sold - this.reserved);
});
ticketTypeSchema.virtual('isSoldOut').get(function () {
  return this.available === 0;
});
ticketTypeSchema.virtual('isFree').get(function () {
  return this.price === 0;
});

const TicketType = mongoose.model('TicketType', ticketTypeSchema);
module.exports = TicketType;
