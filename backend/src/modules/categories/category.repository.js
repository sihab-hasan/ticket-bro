'use strict';
const Category = require('./category.model');

class CategoryRepository {
  // Public (active only) — used by browse/events pages
  async findAll()                { return Category.find({ isActive: true, deletedAt: null }).sort('name').lean(); }
  // Admin — includes inactive so super-admin can see & restore
  async findAllAdmin()           { return Category.find({ deletedAt: null }).sort('name').lean(); }
  async findById(id)             { return Category.findOne({ _id: id, deletedAt: null }).exec(); }
  async findBySlug(s)            { return Category.findOne({ slug: s, deletedAt: null }).exec(); }
  async create(data)             { return new Category(data).save(); }
  async updateById(id, data)     { return Category.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).exec(); }
  async updateBySlug(slug, data) {
    return Category.findOneAndUpdate(
      { slug, deletedAt: null },
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    ).exec();
  }
  async deleteById(id) {
    return Category.findByIdAndUpdate(id, { $set: { deletedAt: new Date(), isActive: false } }, { returnDocument: 'after' }).exec();
  }
  async deleteBySlug(slug) {
    return Category.findOneAndUpdate(
      { slug, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { returnDocument: 'after' },
    ).exec();
  }
}

module.exports = new CategoryRepository();
