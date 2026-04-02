'use strict';
const Review = require('./review.model');

class ReviewRepository {
  async create(data) { return new Review(data).save(); }

  async findByEvent({ eventSlug, page = 1, limit = 20, sort = '-createdAt' }) {
    // event lookup by slug handled in service
    const filter = { isPublished: true, deletedAt: null };
    const skip = (Number(page)-1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('user','firstName lastName avatar').sort(sort).skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(filter),
    ]);
    return { reviews, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }

  async findByEventId({ eventId, page=1, limit=20, sort='-createdAt' }) {
    const filter = { event: eventId, isPublished: true, deletedAt: null };
    const skip = (Number(page)-1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('user','firstName lastName avatar').sort(sort).skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(filter),
    ]);
    return { reviews, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }

  async findByUserId({ userId, page=1, limit=20 }) {
    const filter = { user: userId, deletedAt: null };
    const skip = (Number(page)-1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('event','title slug coverImage').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(filter),
    ]);
    return { reviews, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total/Number(limit)) } };
  }

  async findOne(id) { return Review.findOne({ _id: id, deletedAt: null }).populate('user','firstName lastName').exec(); }

  async findByUserAndEvent(userId, eventId) {
    return Review.findOne({ user: userId, event: eventId, deletedAt: null }).exec();
  }

  async updateById(id, data) {
    return Review.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async deleteById(id, userId) {
    return Review.findOneAndUpdate({ _id: id, user: userId }, { $set: { deletedAt: new Date() } }, { new: true }).exec();
  }

  async getSummary(eventId) {
    const result = await Review.aggregate([
      { $match: { event: new (require('mongoose').Types.ObjectId)(eventId), isPublished: true, deletedAt: null } },
      { $group: {
        _id: null,
        average: { $avg: '$rating' },
        count:   { $sum: 1 },
        r1: { $sum: { $cond: [{ $eq: ['$rating',1] }, 1, 0] } },
        r2: { $sum: { $cond: [{ $eq: ['$rating',2] }, 1, 0] } },
        r3: { $sum: { $cond: [{ $eq: ['$rating',3] }, 1, 0] } },
        r4: { $sum: { $cond: [{ $eq: ['$rating',4] }, 1, 0] } },
        r5: { $sum: { $cond: [{ $eq: ['$rating',5] }, 1, 0] } },
      }},
    ]);
    if (!result.length) return { average: 0, count: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } };
    const r = result[0];
    return { average: Math.round(r.average * 10) / 10, count: r.count, distribution: {1:r.r1,2:r.r2,3:r.r3,4:r.r4,5:r.r5} };
  }
}
module.exports = new ReviewRepository();
