'use strict';
const Subcategory = require('./subcategory.model');

class SubcategoryRepository {
  // Public: active only
  async findAll({ categoryId } = {}) {
    const filter = { isActive: true, deletedAt: null };
    if (categoryId) filter.category = categoryId;
    return Subcategory.find(filter).populate('category', 'name slug').sort('name').lean();
  }

  // Admin: all non-deleted
  async findAllAdmin({ categoryId } = {}) {
    const filter = { deletedAt: null };
    if (categoryId) filter.category = categoryId;
    return Subcategory.find(filter).populate('category', 'name slug').sort('name').lean();
  }

  async findBySlug(slug) {
    return Subcategory.findOne({ slug, deletedAt: null }).populate('category', 'name slug').exec();
  }

  async create(data) {
    return new Subcategory(data).save();
  }

  async updateBySlug(slug, data) {
    return Subcategory.findOneAndUpdate(
      { slug, deletedAt: null },
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    ).populate('category', 'name slug').exec();
  }

  async deleteBySlug(slug) {
    return Subcategory.findOneAndUpdate(
      { slug, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { returnDocument: 'after' },
    ).exec();
  }
}

module.exports = new SubcategoryRepository();
