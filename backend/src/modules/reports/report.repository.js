'use strict';
const Booking = require('../bookings/booking.model');
const Event   = require('../events/event.model');
const User    = require('../users/user.model');

class ReportRepository {
  async salesReport({ startDate, endDate, organizerId } = {}) {
    const match = { deletedAt: null, paymentStatus: 'paid' };
    if (organizerId) match.organizer = require('mongoose').Types.ObjectId.isValid(organizerId) ? new (require('mongoose').Types.ObjectId)(organizerId) : organizerId;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate)   match.createdAt.$lte = new Date(endDate);
    }
    const [totals] = await Booking.aggregate([
      { $match: match },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 }, discount: { $sum: '$discountAmount' } } },
    ]);
    return totals || { revenue: 0, bookings: 0, discount: 0 };
  }

  async attendeesReport(eventId) {
    return Booking.find({ event: eventId, status: { $in: ['confirmed', 'checked_in'] }, deletedAt: null })
      .populate('user', 'firstName lastName email phone')
      .select('bookingRef status checkedInAt totalAmount items createdAt')
      .lean();
  }
}
module.exports = new ReportRepository();
