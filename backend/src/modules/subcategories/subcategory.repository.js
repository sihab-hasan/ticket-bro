'use strict';
const mongoose = require('mongoose');

// Subcategory is stored inline in category or as separate model
// Using a lightweight inline schema here
const subcategorySchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  category:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
  deletedAt:  { type: Date, default: null },
}, { timestamps: true });

const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);

class SubcategoryRepository {
  async findAll(categoryId)    { return Subcategory.find({ category: categoryId, isActive: true, deletedAt: null }).sort('sortOrder').lean(); }
  async create(data)           { return new Subcategory(data).save(); }
  async updateById(id, data)   { return Subcategory.findByIdAndUpdate(id, { $set: data }, { new: true }).exec(); }
  async deleteById(id)         { return Subcategory.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec(); }
}
module.exports = new SubcategoryRepository();
