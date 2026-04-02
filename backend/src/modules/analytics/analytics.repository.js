'use strict';
const Booking = require('../bookings/booking.model');
const Event   = require('../events/event.model');

class AnalyticsRepository {
  async getRevenueByPeriod(organizerId, startDate, endDate) {
    const ObjectId = require('mongoose').Types.ObjectId;
    const match = { deletedAt: null, paymentStatus: 'paid', organizer: new ObjectId(organizerId) };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate)   match.createdAt.$lte = new Date(endDate);
    }
    return Booking.aggregate([
      { $match: match },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue:  { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
        tickets:  { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.quantity'] } } } },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }

  async getTopEvents(organizerId, limit=5) {
    const ObjectId = require('mongoose').Types.ObjectId;
    return Booking.aggregate([
      { $match: { organizer: new ObjectId(organizerId), paymentStatus: 'paid', deletedAt: null } },
      { $group: { _id: '$event', revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { eventId: '$_id', title: '$event.title', slug: '$event.slug', revenue: 1, bookings: 1 } },
    ]);
  }
}
module.exports = new AnalyticsRepository();
