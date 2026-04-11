// src/modules/eventTypes/eventTypes.model.js
'use strict';
const mongoose = require('mongoose');

const toSlug = (str) => str.toLowerCase().trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const eventTypeSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String, trim: true, maxlength: 1000 },
  icon:        { type: String, trim: true },
  // Hierarchy: EventType belongs to a Subcategory (which belongs to a Category)
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', default: null },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category',    default: null }, // denormalized for fast queries
  isActive:    { type: Boolean, default: true, index: true },
  deletedAt:   { type: Date, default: null, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

eventTypeSchema.index({ name: 1 });
eventTypeSchema.index({ slug: 1 });
eventTypeSchema.index({ subcategory: 1 });
eventTypeSchema.index({ category: 1 });

eventTypeSchema.pre('save', async function() {
  if (!this.isModified('name') && this.slug) return;
  let base = toSlug(this.name);
  let slug = base;
  let i = 1;
  while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
});

eventTypeSchema.statics.active = function() {
  return this.where({ isActive: true, deletedAt: null });
};

const EventType = mongoose.models.EventType || mongoose.model('EventType', eventTypeSchema);
module.exports = EventType;
