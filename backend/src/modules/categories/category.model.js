// src/categories/category.model.js
'use strict';
const mongoose = require('mongoose');

// ── Helper: safe slugify ─────────────────────────────
const toSlug = (str) => str.toLowerCase().trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

// ── Category Schema ─────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, trim: true, maxlength: 1000 },
  isActive: { type: Boolean, default: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // for nested categories
  deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ── Indexes ───────────────────────────────────────
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

// ── Slug auto-generation ───────────────────────────
categorySchema.pre('save', async function() {
  if (!this.isModified('name') && this.slug) return;

  let base = toSlug(this.name);
  let slug = base;
  let i = 1;

  while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
});

// ── Virtuals ──────────────────────────────────────
categorySchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: '_id',
  foreignField: 'category',
});

// ── Statics ───────────────────────────────────────
categorySchema.statics.active = function() {
  return this.where({ isActive: true, deletedAt: null });
};

// ── Model ─────────────────────────────────────────
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
