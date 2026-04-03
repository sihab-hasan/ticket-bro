'use strict';
const Event = require('./event.model');

const eventPopulate = [
  { path: 'organizer', select: 'firstName lastName email avatar organizationName' },
  {
    path: 'organizerProfile',
    select: 'displayName slug bio logo coverImage website phone email socialLinks verificationStatus eventCount',
  },
  { path: 'category', select: 'name slug' },
  { path: 'subcategory', select: 'name slug category' },
  { path: 'eventType', select: 'name slug' },
  { path: 'tags', select: 'name slug' },
];

class EventRepository {
  async create(data) { return new Event(data).save(); }

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

  async findAll({ status, category, organizer, page = 1, limit = 20, sort = '-createdAt', search } = {}) {
    const filter = { deletedAt: null };
    if (status)    filter.status   = status;
    if (category)  filter.category = category;
    if (organizer) filter.organizer = organizer;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ title: re }, { description: re }];
    }
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

  async findPublished({ category, organizer, isFeatured, isTrending, excludeId, page = 1, limit = 20, sort = '-createdAt', search, startDate, endDate } = {}) {
    const filter = { status: 'published', visibility: 'public', deletedAt: null };
    if (category) filter.category = category;
    if (organizer) filter.organizer = organizer;
    if (typeof isFeatured === 'boolean') filter.isFeatured = isFeatured;
    if (typeof isTrending === 'boolean') filter.isTrending = isTrending;
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
    return this.findAll({ ...query, organizer: organizerId });
  }

  async updateById(id, data) {
    return Event.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
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
