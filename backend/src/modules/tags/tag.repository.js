'use strict';
// Tags are embedded in events as string arrays; no separate model needed.
// This repository provides aggregation-based tag queries.
const Event = require('../events/event.model');
class TagRepository {
  async findPopular(limit=50) {
    return Event.aggregate([
      { $match: { status:'published', deletedAt:null, tags: { $exists:true, $ne:[] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Number(limit) },
    ]);
  }
}
module.exports = new TagRepository();
