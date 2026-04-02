'use strict';
const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['earn','redeem','expire','adjust'], required: true },
  points:      { type: Number, required: true },
  balance:     { type: Number, required: true },
  description: { type: String, trim: true },
  booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  expiresAt:   { type: Date },
}, { _id: true, timestamps: true });

const loyaltySchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  totalPoints:  { type: Number, default: 0, min: 0 },
  tier:         { type: String, enum: ['bronze','silver','gold','platinum'], default: 'bronze' },
  transactions: [loyaltyTransactionSchema],
  lifetimeEarned: { type: Number, default: 0 },
}, { timestamps: true });

loyaltySchema.methods.earn = function(points, description='', bookingId=null) {
  this.totalPoints += points;
  this.lifetimeEarned += points;
  this.transactions.push({ type:'earn', points, balance: this.totalPoints, description, booking: bookingId });
  this.tier = this.lifetimeEarned >= 10000 ? 'platinum' : this.lifetimeEarned >= 5000 ? 'gold' : this.lifetimeEarned >= 1000 ? 'silver' : 'bronze';
};

const Loyalty = mongoose.model('Loyalty', loyaltySchema);
module.exports = Loyalty;
