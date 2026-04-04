'use strict';
const Review = require('./review.model');

const buildSummaryResponse = (summary = {}) => ({
  averageRating: Number(summary.averageRating || 0),
  totalReviews: Number(summary.totalReviews || 0),
  ratingDistribution: [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: Number(summary?.distribution?.[rating] || 0),
  })),
});

class ReviewRepository {
  async create(data) {
    return new Review(data).save();
  }

  async findPublic({ page = 1, limit = 20, sort = '-createdAt', search } = {}) {
    const filter = { isPublished: true, deletedAt: null };

    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ title: re }, { body: re }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName avatar')
        .populate('event', 'title slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findActiveByUserId(userId) {
    return Review.findOne({ user: userId, deletedAt: null })
      .populate('user', 'firstName lastName avatar email')
      .populate('event', 'title slug')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id) {
    return Review.findOne({ _id: id, deletedAt: null })
      .populate('user', 'firstName lastName')
      .exec();
  }

  async updateById(id, data) {
    return Review.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .populate('user', 'firstName lastName avatar')
      .populate('event', 'title slug')
      .exec();
  }

  async deleteById(id, userId) {
    return Review.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      { $set: { deletedAt: new Date(), isPublished: false } },
      { new: true },
    ).exec();
  }

  async getSummary() {
    const result = await Review.aggregate([
      { $match: { isPublished: true, deletedAt: null } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    if (!result.length) {
      return buildSummaryResponse({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const summary = result[0];
    return buildSummaryResponse({
      averageRating: Math.round(summary.average * 10) / 10,
      totalReviews: summary.count,
      distribution: {
        1: summary.r1,
        2: summary.r2,
        3: summary.r3,
        4: summary.r4,
        5: summary.r5,
      },
    });
  }
}

module.exports = new ReviewRepository();
