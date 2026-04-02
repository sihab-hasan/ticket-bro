'use strict';
const Event = require('../events/event.model');

class SearchRepository {
  async fullTextSearch(q, filters = {}, page = 1, limit = 20) {
    const filter = { status: 'published', visibility: 'public', deletedAt: null, ...filters };
    if (q) filter.$text = { $search: q };
    const skip = (Number(page)-1)*Number(limit);
    const projection = q ? { score: { $meta: 'textScore' } } : {};
    const sortOpt    = q ? { score: { $meta: 'textScore' } } : { startDate: 1 };
    const [events, total] = await Promise.all([
      Event.find(filter, projection).sort(sortOpt).skip(skip).limit(Number(limit)).lean(),
      Event.countDocuments(filter),
    ]);
    return { events, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }
}
module.exports = new SearchRepository();
