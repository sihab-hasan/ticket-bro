'use strict';
const Event = require('../events/event.model');
const logger = require('../../infrastructure/logger/logger');

class SearchService {
  async search({ q='', category, location, startDate, endDate, minPrice, maxPrice, page=1, limit=20, sort='-createdAt' }) {
    const filter = { status: 'published', visibility: 'public', deletedAt: null };
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ title: re }, { description: re }, { 'location.city': re }, { tags: re }];
    }
    if (category)  filter.category = category;
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate)   filter.endDate   = { ...filter.endDate, $lte: new Date(endDate) };
    if (minPrice)  filter.minPrice  = { $gte: Number(minPrice) };
    if (maxPrice)  filter.maxPrice  = { ...filter.maxPrice, $lte: Number(maxPrice) };

    const skip = (Number(page)-1)*Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).select('title slug startDate endDate location coverImage minPrice maxPrice currency totalCapacity totalSold').sort(sort).skip(skip).limit(Number(limit)).lean(),
      Event.countDocuments(filter),
    ]);
    return { events, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) };
  }

  async autocomplete(q='') {
    if (!q || q.length < 2) return { suggestions: [] };
    const re = new RegExp(`^${q}`, 'i');
    const events = await Event.find({ title: re, status: 'published', deletedAt: null }).select('title slug').limit(10).lean();
    return { suggestions: events.map(e => ({ title: e.title, slug: e.slug })) };
  }

  async getTrending() {
    const events = await Event.find({ status: 'published', deletedAt: null }).sort({ trendScore: -1, totalSold: -1 }).limit(10).select('title slug startDate coverImage totalSold').lean();
    return { events };
  }

  async getNearby({ lat, lng, radius=30 }) {
    if (!lat || !lng) return { events: [] };
    const events = await Event.find({
      status: 'published', deletedAt: null,
      'location.coordinates': { $near: { $geometry: { type:'Point', coordinates:[Number(lng),Number(lat)] }, $maxDistance: Number(radius)*1000 } },
    }).select('title slug startDate location coverImage').limit(20).lean();
    return { events };
  }

  async getFacets() {
    const [categories, locations] = await Promise.all([
      Event.aggregate([{ $match: { status:'published', deletedAt:null } }, { $group: { _id:'$category', count:{ $sum:1 } } }, { $sort:{ count:-1 } }, { $limit:20 }]),
      Event.aggregate([{ $match: { status:'published', deletedAt:null } }, { $group: { _id:'$location.city', count:{ $sum:1 } } }, { $sort:{ count:-1 } }, { $limit:20 }]),
    ]);
    return { categories, locations };
  }

  async reindex() { return { message: 'Reindex scheduled.' }; }
  async reindexEvent(id) { return { message: `Event ${id} reindexed.` }; }
  async removeFromIndex(id) { return { message: `Event ${id} removed from index.` }; }
}
module.exports = new SearchService();
