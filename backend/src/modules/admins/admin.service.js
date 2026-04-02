'use strict';
const adminRepository = require('./admin.repository');
const userService     = require('../users/user.service');
const eventService    = require('../events/event.service');
const analyticsService= require('../analytics/analytics.service');

class AdminService {
  async getDashboard() {
    const [counts, recentUsers, recentBookings, platform] = await Promise.all([
      adminRepository.getDashboardCounts(),
      adminRepository.getRecentUsers(),
      adminRepository.getRecentBookings(),
      analyticsService.getPlatformStats(),
    ]);
    return { counts, recentUsers, recentBookings, platform };
  }
  async getUsers(query)           { return userService.getAllUsers(query); }
  async updateUser(id, data)      { return userService.adminUpdateUser(id, data); }
  async setUserActive(id, active) { return userService.setUserActive(id, active); }
  async deleteUser(id)            { return userService.hardDeleteUser(id); }
  async changeUserRole(id, role)  { return userService.changeRole(id, role); }
  async getUserStats()            { return userService.getUserStats(); }
  async getEvents(query)          { return eventService.getAllEventsAdmin(query); }
  async approveEvent(id)          { return eventService.approveEvent(id); }
  async rejectEvent(id, reason)   { return eventService.rejectEvent(id, reason); }
  async featureEvent(id, featured){ return eventService.featureEvent(id, featured); }
  async getEventStats()           { return eventService.getStats(); }
}
module.exports = new AdminService();
