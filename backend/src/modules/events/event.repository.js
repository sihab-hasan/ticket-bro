'use strict';
require('../users/user.model');
require('../organizers/organizer.model');
require('../categories/category.model');
require('../subcategories/subcategory.model');
require('../eventTypes/eventTypes.model');
require('../tags/tag.model');
const Event = require('./event.model');
const eventPopulate = require('./event.populate');

class EventRepository {
  _buildListFilter({ status, category, organizer, managerId, visibility, isFeatured, from, to, search } = {}) {
    const filter = { deletedAt: null };
    const andFilters = [];

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (organizer) filter.organizer = organizer;
    if (visibility) filter.visibility = visibility;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;

    if (managerId) {
      andFilters.push({
        $or: [
          { organizer: managerId },
          { coOrganizers: managerId },
        ],
      });
    }

    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = new Date(from);
      if (to) filter.startDate.$lte = new Date(to);
    }

    if (search) {
      const re = new RegExp(search, 'i');
      andFilters.push({
        $or: [{ title: re }, { shortDescription: re }, { description: re }],
      });
    }

    if (andFilters.length) {
      filter.$and = andFilters;
    }

    return filter;
  }

  _buildUpdateDocument(data = {}) {
    const update = {};
    const set = {};
    const unset = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        unset[key] = 1;
        return;
      }

      set[key] = value;
    });

    if (Object.keys(set).length) {
      update.$set = set;
    }

    if (Object.keys(unset).length) {
      update.$unset = unset;
    }

    return update;
  }

  async create(data) {
    const event = await new Event(data).save();
    return this.findById(event._id);
  }

  async findById(id) {
    return Event.findOne({ _id: id, deletedAt: null })
      .populate(eventPopulate)
      .exec();
  }

  async findBySlug(slug) {
    return Event.findOne({ slug, deletedAt: null })
      .populate(eventPopulate)
      .exec();
  }

  async findAll({ status, category, organizer, managerId, visibility, isFeatured, from, to, page = 1, limit = 20, sort = '-createdAt', search } = {}) {
    const filter = this._buildListFilter({
      status,
      category,
      organizer,
      managerId,
      visibility,
      isFeatured,
      from,
      to,
      search,
    });
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate(eventPopulate)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Event.countDocuments(filter),
    ]);
    return { events, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async findPublished({ category, organizer, isFeatured, isTrending, isFree, ids, excludeId, page = 1, limit = 20, sort = '-createdAt', search, startDate, endDate } = {}) {
    const filter = { status: 'published', visibility: 'public', deletedAt: null };
    if (category) filter.category = category;
    if (organizer) filter.organizer = organizer;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (typeof isTrending === 'boolean') filter.isTrending = isTrending;
    if (typeof isFree === 'boolean') filter.isFree = isFree;
    if (Array.isArray(ids) && ids.length) filter._id = { $in: ids };
    if (excludeId) filter._id = { $ne: excludeId };
    if (search) { const re = new RegExp(search, 'i'); filter.$or = [{ title: re }, { description: re }]; }
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate)   filter.endDate   = { $lte: new Date(endDate) };
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate(eventPopulate)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Event.countDocuments(filter),
    ]);
    return { events, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async findByOrganizer(organizerId, query = {}) {
    return this.findAll({ ...query, managerId: organizerId });
  }

  async updateById(id, data) {
    const update = this._buildUpdateDocument(data);
    const updated = await Event.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select('_id').exec();

    if (!updated) {
      return null;
    }

    return this.findById(updated._id);
  }

  async incrementViewCount(id) {
    return Event.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true }).exec();
  }

  async softDeleteById(id) {
    return Event.findByIdAndUpdate(id, { $set: { deletedAt: new Date(), status: 'cancelled' } }, { new: true }).exec();
  }

  async getStats() {
    const [total, published, draft, cancelled] = await Promise.all([
      Event.countDocuments({ deletedAt: null }),
      Event.countDocuments({ deletedAt: null, status: 'published' }),
      Event.countDocuments({ deletedAt: null, status: 'draft' }),
      Event.countDocuments({ deletedAt: null, status: 'cancelled' }),
    ]);
    return { total, published, draft, cancelled };
  }
}

module.exports = new EventRepository();
