// src/modules/eventTypes/eventTypes.repository.js
'use strict';
const EventType = require('./eventTypes.model');

class EventTypeRepository {
  _baseQuery({ includeInactive = false, subcategoryId, categoryId } = {}) {
    const filter = { deletedAt: null };
    if (!includeInactive) filter.isActive = true;
    if (subcategoryId) filter.subcategory = subcategoryId;
    if (categoryId)    filter.category    = categoryId;
    return filter;
  }

  async findAll(opts = {}) {
    return EventType.find(this._baseQuery(opts))
      .populate('subcategory', 'name slug')
      .populate('category', 'name slug')
      .sort('name').lean();
  }

  async findBySlug(slug) {
    return EventType.findOne({ slug, deletedAt: null })
      .populate('subcategory', 'name slug')
      .populate('category', 'name slug')
      .exec();
  }

  async create(data) {
    return new EventType(data).save();
  }

  async updateBySlug(slug, data) {
    return EventType.findOneAndUpdate(
      { slug, deletedAt: null },
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    ).populate('subcategory', 'name slug').populate('category', 'name slug').exec();
  }

  async deleteBySlug(slug) {
    return EventType.findOneAndUpdate(
      { slug, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { returnDocument: 'after' },
    ).exec();
  }
}

module.exports = new EventTypeRepository();
