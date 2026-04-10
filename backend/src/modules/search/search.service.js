'use strict';
const Event = require('../events/event.model');
const Category = require('../categories/category.model');
const Subcategory = require('../subcategories/subcategory.model');
const Organizer = require('../organizers/organizer.model');
const logger = require('../../infrastructure/logger/logger');

class SearchService {
  async search({ 
    q = '', 
    category, 
    subcategory,
    location, 
    city,
    startDate, 
    endDate, 
    minPrice, 
    maxPrice, 
    isFree,
    page = 1, 
    limit = 20, 
    sort = '-createdAt',
    tags
  }) {
    const filter = { 
      status: 'published', 
      visibility: { $in: ['public', 'unlisted'] }, 
      deletedAt: null 
    };

    // Text search 
    if (q && q.length >= 2) {
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escapedQ, 'gi');
      filter.$or = [
        { title: re },
        { description: re },
        { shortDescription: re },
        { 'location.name': re },
        { 'location.city': re }
      ];
    }

    // Tags filter - handle both array and comma-separated string
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Category filter
    if (category) {
      try {
        const cat = await Category.findOne({ slug: category }).lean();
        if (cat) filter.category = cat._id;
      } catch (e) {
        logger.warn('Invalid category filter', { category });
      }
    }

    // Subcategory filter
    if (subcategory) {
      try {
        const sub = await Subcategory.findOne({ slug: subcategory }).lean();
        if (sub) filter.subcategory = sub._id;
      } catch (e) {
        logger.warn('Invalid subcategory filter', { subcategory });
      }
    }

    // Location/city filter
    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }
    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    // Date filters
    if (startDate) {
      filter.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filter.endDate = { $lte: new Date(endDate) };
    }

    // Price filters
    if (minPrice !== undefined && minPrice !== '') {
      filter.minPrice = { $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.maxPrice = { ...filter.maxPrice, $lte: Number(maxPrice) };
    }
    if (isFree === true || isFree === 'true') {
      filter.isFree = true;
    }

    // Tags filter - handle comma-separated string or array
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : String(tags).split(',').filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Sort mapping
    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      'createdAt': { createdAt: 1 },
      '-startDate': { startDate: 1 },
      'startDate': { startDate: -1 },
      '-totalSold': { totalSold: -1 },
      '-minPrice': { minPrice: -1 },
      'minPrice': { minPrice: 1 },
      '-averageRating': { averageRating: -1 },
    };
    
    const finalSort = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    
    const [events, total] = await Promise.all([
      Event.find(filter)
        .select('title slug startDate endDate location coverImage minPrice maxPrice currency totalCapacity totalSold category averageRating tags shortDescription')
        .populate('category', 'name slug')
        .populate('organizer', 'displayName')
        .sort(finalSort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Event.countDocuments(filter),
    ]);

    return { 
      events, 
      total, 
      page: Number(page), 
      limit: Number(limit), 
      totalPages: Math.ceil(total / Number(limit)) 
    };
  }

  async autocomplete(q = '', limit = 10) {
    if (!q || q.length < 2) return { suggestions: [] };

    const re = new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    
    const [events, categories, organizers] = await Promise.all([
      Event.find({ 
        title: re, 
        status: 'published', 
        deletedAt: null 
      })
        .select('title slug startDate location')
        .limit(limit)
        .lean(),
      Category.find({ name: re, deletedAt: null })
        .select('name slug')
        .limit(5)
        .lean(),
      Organizer.find({ 
        displayName: re, 
        deletedAt: null,
        verificationStatus: 'verified'
      })
        .select('displayName slug logo')
        .limit(5)
        .lean()
    ]);

    const suggestions = [
      ...events.map(e => ({ 
        type: 'event', 
        title: e.title, 
        slug: e.slug,
        subtitle: e.location?.city || 'Event'
      })),
      ...categories.map(c => ({ 
        type: 'category', 
        title: c.name, 
        slug: c.slug,
        subtitle: 'Category'
      })),
      ...organizers.map(o => ({ 
        type: 'organizer', 
        title: o.displayName, 
        slug: o.slug,
        subtitle: 'Organizer'
      }))
    ];

    return { suggestions: suggestions.slice(0, limit) };
  }

  async getTrending(limit = 10) {
    const events = await Event.find({ 
      status: 'published', 
      deletedAt: null,
      startDate: { $gte: new Date() }
    })
      .sort({ trendScore: -1, totalSold: -1, viewCount: -1 })
      .limit(limit)
      .select('title slug startDate location coverImage minPrice maxPrice totalSold averageRating')
      .lean();
    return { events };
  }

  async getNearby({ lat, lng, radius = 30 }) {
    if (!lat || !lng) return { events: [] };
    
    try {
      const latNum = Number(lat);
      const lngNum = Number(lng);
      
      const events = await Event.find({
        status: 'published',
        deletedAt: null,
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [lngNum, latNum] },
            $maxDistance: Number(radius) * 1000
          }
        }
      })
        .select('title slug startDate location coverImage minPrice maxPrice')
        .limit(20)
        .lean();

      const eventsWithDistance = events.map(e => ({
        ...e,
        distance: e.location?.coordinates 
          ? this.calcDistance(latNum, lngNum, e.location.coordinates[1], e.location.coordinates[0])
          : null
      }));
      
      return { events: eventsWithDistance };
    } catch (e) {
      logger.error('Geospatial search error', { error: e.message });
      return { events: [] };
    }
  }

  calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getFacets() {
    const today = new Date();
    
    const [categories, cities, priceRanges, dateRanges] = await Promise.all([
      Event.aggregate([
        { $match: { status: 'published', deletedAt: null } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      Event.aggregate([
        { $match: { status: 'published', deletedAt: null, 'location.city': { $exists: true, $ne: '' } } },
        { $group: { _id: '$location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      Event.aggregate([
        { $match: { status: 'published', deletedAt: null } },
        { $group: { _id: { $cond: ['$isFree', 'free', { $cond: [{ $lte: ['$minPrice', 500] }, '0-500', { $cond: [{ $lte: ['$minPrice', 1000] }, '500-1000', '1000+'] }] }] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Event.aggregate([
        { $match: { status: 'published', deletedAt: null, startDate: { $gte: today } } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: [{ $subtract: ['$startDate', today] }, 7 * 24 * 60 * 60 * 1000] }, then: 'this-week' },
                  { case: { $lte: [{ $subtract: ['$startDate', today] }, 30 * 24 * 60 * 60 * 1000] }, then: 'this-month' },
                  { case: { $lte: [{ $subtract: ['$startDate', today] }, 90 * 24 * 60 * 60 * 1000] }, then: 'this-quarter' }
                ],
                default: 'later'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Populate category names
    const categoryIds = categories.filter(c => c._id).map(c => c._id);
    const categoryDocs = await Category.find({ _id: { $in: categoryIds } }).select('name slug').lean();
    const categoryMap = new Map(categoryDocs.map(c => [c._id.toString(), c]));
    
    const populatedCategories = categories.map(c => ({
      ...c,
      name: categoryMap.get(c._id?.toString())?.name || 'Unknown',
      slug: categoryMap.get(c._id?.toString())?.slug || ''
    })).filter(c => c.name !== 'Unknown');

    return { 
      categories: populatedCategories, 
      cities: cities.map(c => ({ name: c._id, count: c.count })),
      priceRanges: priceRanges.map(p => ({ label: p._id, count: p.count })),
      dateRanges: dateRanges.map(d => ({ label: d._id, count: d.count }))
    };
  }

  async reindex() {
    logger.info('Full search reindex triggered');
    return { message: 'Reindex scheduled.', success: true };
  }

  async reindexEvent(id) {
    logger.info('Reindexing event', { eventId: id });
    return { message: `Event ${id} reindexed.`, success: true };
  }

  async removeFromIndex(id) {
    logger.info('Removing event from index', { eventId: id });
    return { message: `Event ${id} removed from index.`, success: true };
  }
}

module.exports = new SearchService();
