'use strict';
const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  code:      { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type:      { type: String, enum: ['percentage','fixed'], required: true },
  value:     { type: Number, required: true, min: 0 },
  maxUses:   { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  minAmount: { type: Number, default: 0 },
  maxDiscount:{ type: Number, default: null },
  startDate: { type: Date },
  endDate:   { type: Date },
  isActive:  { type: Boolean, default: true, index: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

promotionSchema.virtual('isExpired').get(function () {
  return this.endDate && this.endDate < new Date();
});
promotionSchema.virtual('isExhausted').get(function () {
  return this.maxUses !== null && this.usedCount >= this.maxUses;
});
promotionSchema.virtual('isValid').get(function () {
  return this.isActive && !this.isExpired && !this.isExhausted;
});

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;
