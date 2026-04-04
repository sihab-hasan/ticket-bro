'use strict';
const Booking = require('../bookings/booking.model');
const Event   = require('../events/event.model');
const User    = require('../users/user.model');
const logger  = require('../../infrastructure/logger/logger');

const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class AnalyticsService {
  async getOverview(userId, query = {}) {
    /**
     * Compute overall statistics for the organizer. If an eventId is provided
     * in the query, metrics will be restricted to that specific event.
     */
    try {
      const organizerId = userId;
      const eventFilter = {};
      if (query.eventId) {
        // Ensure the event belongs to the organizer to prevent leaking data
        eventFilter._id = query.eventId;
        eventFilter.organizer = organizerId;
      } else {
        eventFilter.organizer = organizerId;
      }
      // Count total events and active (published) events
      const [events, activeEvents] = await Promise.all([
        Event.find({ ...eventFilter, deletedAt: null }).select('_id status'),
        Event.countDocuments({ ...eventFilter, status: 'published', deletedAt: null }),
      ]);
      const eventIds = events.map((e) => e._id);
      const totalEvents = events.length;
      // Aggregate bookings for these events
      let totalBookings = 0;
      let totalRevenue = 0;
      if (eventIds.length > 0) {
        const match = {
          organizer: require('mongoose').Types.ObjectId.isValid(organizerId) ? new (require('mongoose').Types.ObjectId)(organizerId) : null,
          paymentStatus: 'paid',
          deletedAt: null,
        };
        if (eventFilter._id) {
          match.event = events[0]._id;
        }
        const agg = await Booking.aggregate([
          { $match: match },
          { $group: { _id: null, bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        ]);
        totalBookings = agg[0]?.bookings || 0;
        totalRevenue = agg[0]?.revenue || 0;
      }
      return { totalEvents, totalBookings, totalRevenue, activeEvents };
    } catch {
      return { totalEvents: 0, totalBookings: 0, totalRevenue: 0, activeEvents: 0 };
    }
  }

  async getRevenue(userId, query={}) {
    /**
     * Return revenue breakdown for the last 6 months for the given organizer.
     * Each entry contains a label (e.g. "Jan 2026"), the year/month and the
     * aggregated revenue and number of bookings. Only bookings with
     * paymentStatus equal to 'paid' and not soft‑deleted are counted.
     */
    const now = new Date();
    const results = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const label = start.toLocaleString('default', { month: 'short', year: 'numeric' });
      // Aggregate bookings for the organizer within the current month
      const match = {
        organizer: require('mongoose').Types.ObjectId.isValid(userId) ? new (require('mongoose').Types.ObjectId)(userId) : null,
        paymentStatus: 'paid',
        createdAt: { $gte: start, $lt: end },
        deletedAt: null,
      };
      const agg = await Booking.aggregate([
        { $match: match },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
      ]);
      const revenue = agg[0]?.revenue || 0;
      const bookings = agg[0]?.bookings || 0;
      results.push({ year: start.getFullYear(), month: start.getMonth() + 1, label, revenue, bookings });
    }
    return { months: results };
  }

  async getTicketStats(userId) {
    /**
     * Compute ticket statistics for all events owned by the organizer.
     * sold      – total number of tickets sold across all ticket types
     * available – total number of tickets still available (quantity − sold − reserved)
     * cancelled – number of tickets with status 'cancelled'
     * checkedIn – number of tickets with status 'used'
     */
    // Fetch all event IDs for the organizer
    const events = await Event.find({ organizer: userId, deletedAt: null }).select('_id');
    const eventIds = events.map((e) => e._id);
    if (eventIds.length === 0) return { sold: 0, available: 0, cancelled: 0, checkedIn: 0 };
    // Aggregate ticket statuses
    const ticketStatuses = await require('../tickets/ticket.model').aggregate([
      { $match: { event: { $in: eventIds }, deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = ticketStatuses.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
    // Compute available and sold counts from TicketType records
    const TicketType = require('../tickets/ticketType.model');
    const ticketTypes = await TicketType.find({ event: { $in: eventIds }, deletedAt: null }).select('quantity sold reserved');
    let soldCount = 0;
    let availableCount = 0;
    ticketTypes.forEach((tt) => {
      const qty     = Number(tt.quantity || 0);
      const sold    = Number(tt.sold || 0);
      const reserved= Number(tt.reserved || 0);
      soldCount     += sold;
      // available per type = quantity - sold - reserved
      availableCount += Math.max(qty - sold - reserved, 0);
    });
    return {
      sold: soldCount,
      available: availableCount,
      cancelled: statusMap.cancelled || 0,
      checkedIn: statusMap.used || 0,
    };
  }

  async getEventStats(userId, query={}) {
    /**
     * Return aggregated statistics for each event owned by the organizer. Each
     * entry includes the event id, title, status, total tickets sold and total
     * revenue collected (paid bookings). Optional filters: eventId to get
     * stats for a specific event.
     */
    // Build event filter
    const filter = { organizer: userId, deletedAt: null };
    if (query.eventId) {
      filter._id = query.eventId;
    }
    const events = await Event.find(filter).select('title status slug startDate endDate').lean();
    if (events.length === 0) return { events: [] };
    const eventIds = events.map((e) => e._id);
    // Aggregate bookings by event
    const bookings = await Booking.aggregate([
      { $match: { organizer: require('mongoose').Types.ObjectId.isValid(userId) ? new (require('mongoose').Types.ObjectId)(userId) : null, paymentStatus: 'paid', deletedAt: null } },
      { $unwind: '$items' },
      { $group: { _id: '$event', tickets: { $sum: '$items.quantity' }, revenue: { $sum: '$totalAmount' } } },
    ]);
    const bookingMap = new Map(bookings.map((b) => [String(b._id), b]));
    const results = events.map((e) => {
      const stats = bookingMap.get(String(e._id)) || {};
      return {
        eventId: e._id,
        title: e.title,
        slug: e.slug,
        status: e.status,
        startDate: e.startDate,
        endDate: e.endDate,
        totalTickets: stats.tickets || 0,
        totalRevenue: stats.revenue || 0,
      };
    });
    return { events: results };
  }

  async getEventAnalytics(eventId, userId) {
    /**
     * Return analytics for a specific event: number of views, bookings,
     * revenue and conversion rate. Conversion rate is calculated as
     * bookings / views (percentage). Only considers paid bookings.
     */
    const event = await Event.findOne({ _id: eventId, organizer: userId, deletedAt: null }).lean();
    if (!event) {
      return { eventId, views: 0, bookings: 0, revenue: 0, conversionRate: 0 };
    }
    // Views come from event.viewCount
    const views = Number(event.viewCount || 0);
    // Aggregate bookings for this event
    const agg = await Booking.aggregate([
      { $match: { event: event._id, organizer: require('mongoose').Types.ObjectId.isValid(userId) ? new (require('mongoose').Types.ObjectId)(userId) : null, paymentStatus: 'paid', deletedAt: null } },
      { $group: { _id: null, bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);
    const bookingsCount = agg[0]?.bookings || 0;
    const revenue = agg[0]?.revenue || 0;
    const conversionRate = views > 0 ? (bookingsCount / views) * 100 : 0;
    return { eventId: String(event._id), views, bookings: bookingsCount, revenue, conversionRate };
  }

  async getAudience(userId) {
    /**
     * Compute audience statistics for the organizer's events.
     * totalAttendees – number of unique users who have booked any event
     * repeatAttendees – number of users who have booked more than once
     * demographics – currently returns an empty object; can be extended
     *               to include demographic distribution such as age or location.
     */
    // Get list of user IDs from bookings of organizer events
    const attendees = await Booking.aggregate([
      { $match: { organizer: require('mongoose').Types.ObjectId.isValid(userId) ? new (require('mongoose').Types.ObjectId)(userId) : null, deletedAt: null, paymentStatus: 'paid' } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    let totalAttendees = 0;
    let repeatAttendees = 0;
    attendees.forEach((a) => {
      totalAttendees += 1;
      if (a.count > 1) repeatAttendees += 1;
    });
    // Demographics stub: could compute distribution by gender, location, etc.
    return { totalAttendees, repeatAttendees, demographics: {} };
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
