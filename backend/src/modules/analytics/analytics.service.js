'use strict';
const Booking = require('../bookings/booking.model');
const Event   = require('../events/event.model');
const User    = require('../users/user.model');
const logger  = require('../../infrastructure/logger/logger');

const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class AnalyticsService {
  async getOverview(userId) {
    try {
      const organizerId = userId;
      const [totalEvents, totalBookings, revenue, activeEvents] = await Promise.all([
        Event.countDocuments({ organizer: organizerId, deletedAt: null }),
        Booking.countDocuments({ organizer: organizerId, deletedAt: null }),
        Booking.aggregate([{ $match: { organizer: require('mongoose').Types.ObjectId.isValid(organizerId) ? new (require('mongoose').Types.ObjectId)(organizerId) : null, paymentStatus:'paid', deletedAt:null } }, { $group:{_id:null, total:{$sum:'$totalAmount'}} }]),
        Event.countDocuments({ organizer: organizerId, status:'published', deletedAt:null }),
      ]);
      return { totalEvents, totalBookings, totalRevenue: revenue[0]?.total||0, activeEvents };
    } catch { return { totalEvents:0, totalBookings:0, totalRevenue:0, activeEvents:0 }; }
  }

  async getRevenue(userId, query={}) {
    const now = new Date();
    const months = [];
    for (let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth()+1, label: d.toLocaleString('default',{month:'short',year:'numeric'}) });
    }
    // Stub — real impl does per-month aggregation
    return { months: months.map(m => ({ ...m, revenue: 0, bookings: 0 })) };
  }

  async getTicketStats(userId) {
    return { sold: 0, available: 0, cancelled: 0, checkedIn: 0 };
  }

  async getEventStats(userId, query={}) {
    return { events: [] };
  }

  async getEventAnalytics(eventId, userId) {
    return { eventId, views: 0, bookings: 0, revenue: 0, conversionRate: 0 };
  }

  async getAudience(userId) {
    return { totalAttendees: 0, repeatAttendees: 0, demographics: {} };
  }

  // Admin-level platform analytics
  async getPlatformStats() {
    const [users, events, bookings] = await Promise.all([
      User.countDocuments({ deletedAt:null }),
      Event.countDocuments({ deletedAt:null }),
      Booking.countDocuments({ deletedAt:null }),
    ]);
    return { users, events, bookings };
  }
}
module.exports = new AnalyticsService();
