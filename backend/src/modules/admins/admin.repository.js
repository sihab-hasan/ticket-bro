'use strict';
const User    = require('../users/user.model');
const Event   = require('../events/event.model');
const Booking = require('../bookings/booking.model');

class AdminRepository {
  async getDashboardCounts() {
    const [users, events, bookings, pendingEvents] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      Event.countDocuments({ deletedAt: null }),
      Booking.countDocuments({ deletedAt: null }),
      Event.countDocuments({ status: 'pending_approval', deletedAt: null }),
    ]);
    return { users, events, bookings, pendingEvents };
  }
  async getRecentUsers(limit=5)    { return User.find({ deletedAt: null }).sort('-createdAt').limit(limit).select('firstName lastName email role createdAt').lean(); }
  async getRecentBookings(limit=5) { return Booking.find({ deletedAt: null }).sort('-createdAt').limit(limit).populate('user','firstName lastName').populate('event','title').lean(); }
}
module.exports = new AdminRepository();
