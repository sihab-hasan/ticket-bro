'use strict';

const mongoose = require('mongoose');

const capturedMomentSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 120,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
  },
  reactorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPublished: {
    type: Boolean,
    default: true,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

capturedMomentSchema.index({ deletedAt: 1, isPublished: 1, createdAt: -1 });
capturedMomentSchema.index({ category: 1, deletedAt: 1, isPublished: 1, createdAt: -1 });

const CapturedMoment = mongoose.model('CapturedMoment', capturedMomentSchema);

module.exports = CapturedMoment;
