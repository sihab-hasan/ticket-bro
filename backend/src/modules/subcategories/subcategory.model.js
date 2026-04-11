// src/subcategories/subcategory.model.js
'use strict';
const mongoose = require('mongoose');

// ── Helper: safe slugify ─────────────────────────────
const toSlug = (str) => str.toLowerCase().trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

// ── Subcategory Schema ──────────────────────────────
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  slug: { type: String, unique: true, lowercase: true },          // unique already creates index; removed index:true duplicate
  description: { type: String, trim: true, maxlength: 1000 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // removed index:true; declared below
  isActive: { type: Boolean, default: true, index: true },
  deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ── Indexes ───────────────────────────────────────
subcategorySchema.index({ name: 1 });
subcategorySchema.index({ slug: 1 });          // compound queries; unique above covers lookups
subcategorySchema.index({ category: 1 });

// ── Slug auto-generation ───────────────────────────
subcategorySchema.pre('save', async function() {
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
subcategorySchema.statics.active = function() {
  return this.where({ isActive: true, deletedAt: null });
};

// ── Model ─────────────────────────────────────────
const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory;
