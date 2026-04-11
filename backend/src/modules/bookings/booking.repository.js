'use strict';
const Booking = require('./booking.model');

class BookingRepository {

  async create(data) {
    const booking = new Booking(data);
    return booking.save();
  }

  async findById(id) {
    return Booking.findOne({ _id: id, deletedAt: null })
      .populate('user', 'firstName lastName email phone avatar')
      .populate('event', 'title slug startDate endDate location organizer')
      .populate('payment')
      .exec();
  }

  async findByRef(bookingRef, userId = null) {
    const query = { bookingRef, deletedAt: null };
    if (userId) query.user = userId;
    return Booking.findOne(query)
      .populate('user', 'firstName lastName email phone')
      .populate('event', 'title slug startDate endDate location coverImage organizer')
      .populate('payment')
      .exec();
  }

  async findByUserId({ userId, status, page = 1, limit = 20, sort = '-createdAt' }) {
    const filter = { user: userId, deletedAt: null };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('event', 'title slug startDate endDate location coverImage')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(filter),
    ]);
    return { bookings, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async findByOrganizer({ organizerId, eventId, status, page = 1, limit = 20, sort = '-createdAt' }) {
    const filter = { organizer: organizerId, deletedAt: null };
    if (eventId) filter.event = eventId;
    if (status)  filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'firstName lastName email phone')
        .populate('event', 'title slug startDate endDate')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(filter),
    ]);
    return { bookings, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async findAll({ status, eventId, userId, page = 1, limit = 20, sort = '-createdAt' } = {}) {
    const filter = { deletedAt: null };
    if (status)  filter.status = status;
    if (eventId) filter.event = eventId;
    if (userId)  filter.user  = userId;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('event', 'title slug')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(filter),
    ]);
    return { bookings, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async updateById(id, data) {
    return Booking.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).exec();
  }

  async updateByRef(bookingRef, data) {
    return Booking.findOneAndUpdate({ bookingRef }, { $set: data }, { returnDocument: 'after', runValidators: true }).exec();
  }

  async countByEvent(eventId, status = null) {
    const filter = { event: eventId, deletedAt: null };
    if (status) filter.status = status;
    return Booking.countDocuments(filter);
  }

  async getStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [total, thisMonthCount, byStatus, revenue] = await Promise.all([
      Booking.countDocuments({ deletedAt: null }),
      Booking.countDocuments({ deletedAt: null, createdAt: { $gte: thisMonth } }),
      Booking.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { deletedAt: null, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);
    return {
      total,
      thisMonth: thisMonthCount,
      byStatus: byStatus.reduce((a, r) => ({ ...a, [r._id]: r.count }), {}),
      totalRevenue: revenue[0]?.total || 0,
    };
  }
}

module.exports = new BookingRepository();
