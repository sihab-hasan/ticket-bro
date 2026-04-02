'use strict';
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  event:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true, maxlength: 200 },
  body:    { type: String, trim: true, maxlength: 2000 },
  pros:    [{ type: String, trim: true }],
  cons:    [{ type: String, trim: true }],
  isVerified: { type: Boolean, default: false },  // verified attendee
  isPublished:{ type: Boolean, default: true, index: true },
  helpful:    { type: Number, default: 0 },
  reported:   { type: Boolean, default: false },
  deletedAt:  { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

reviewSchema.index({ event: 1, user: 1 }, { unique: true, sparse: true }); // one review per user per event
reviewSchema.index({ event: 1, isPublished: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
