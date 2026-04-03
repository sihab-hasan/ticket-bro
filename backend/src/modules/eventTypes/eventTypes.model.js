// src/eventTypes/eventType.model.js
'use strict';
const mongoose = require('mongoose');

// ── Helper: safe slugify ─────────────────────────────
const toSlug = (str) => str.toLowerCase().trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

// ── EventType Schema ───────────────────────────────
const eventTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  slug: { type: String, unique: true, lowercase: true, index: true },
  description: { type: String, trim: true, maxlength: 1000 },
  isActive: { type: Boolean, default: true, index: true },
  deletedAt: { type: Date, default: null, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ───────────────────────────────────────
eventTypeSchema.index({ name: 1 });
eventTypeSchema.index({ slug: 1 });

// ── Slug auto-generation ───────────────────────────
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

// ── Statics ───────────────────────────────────────
eventTypeSchema.statics.active = function() {
  return this.where({ isActive: true, deletedAt: null });
};

// ── Model ─────────────────────────────────────────
const EventType = mongoose.model('EventType', eventTypeSchema);
module.exports = EventType;
