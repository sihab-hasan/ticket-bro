'use strict';

const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const adminService = require('./admin.service');

class AdminController {
  getDashboard = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Admin dashboard data.', await adminService.getDashboard());
  });

  getDashboardStats = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Admin dashboard stats.', await adminService.getDashboardStats());
  });

  getSystemHealth = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'System health OK.', await adminService.getSystemHealth());
  });

  getSystemMetrics = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'System metrics.', await adminService.getSystemMetrics());
  });

  getFeatureFlags = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Feature flags.', await adminService.getFeatureFlags());
  });

  updateFeatureFlags = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Feature flags updated.', await adminService.updateFeatureFlags(req.body, req.user));
  });

  getAllUsers = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Users fetched.', await adminService.getUsers(req.query));
  });

  getUserById = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User fetched.', await adminService.getUserById(req.params.id));
  });

  updateUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User updated.', await adminService.updateUser(req.params.id, req.body));
  });

  deleteUser = asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id);
    sendSuccess(res, 'User deleted.');
  });

  banUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User banned.', await adminService.banUser(req.params.id, req.user, req.body.reason));
  });

  unbanUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User unbanned.', await adminService.unbanUser(req.params.id, req.user));
  });

  changeUserRole = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User role updated.', await adminService.changeUserRole(req.params.id, req.body.role, req.user));
  });

  getAllOrganizers = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Organizers fetched.', await adminService.getAllOrganizers(req.query));
  });

  getOrganizerById = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Organizer fetched.', await adminService.getOrganizerById(req.params.id));
  });

  verifyOrganizer = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Organizer verified.', await adminService.verifyOrganizer(req.params.id));
  });

  rejectOrganizer = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Organizer rejected.', await adminService.rejectOrganizer(req.params.id, req.body.reason));
  });

  suspendOrganizer = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Organizer suspended.', await adminService.suspendOrganizer(req.params.id, req.user, req.body.reason));
  });

  getAllBookings = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Bookings fetched.', await adminService.getAllBookings(req.query));
  });

  cancelBooking = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Booking cancelled.', await adminService.cancelBooking(req.params.ref, req.user, req.body.reason));
  });

  refundBooking = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Booking refunded.', await adminService.refundBooking(req.params.ref, req.user, req.body.reason));
  });

  getAllPayments = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Payments fetched.', await adminService.getAllPayments(req.query));
  });

  getPaymentById = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Payment fetched.', await adminService.getPaymentById(req.params.id));
  });

  refundPayment = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Payment refunded.', await adminService.refundPayment(req.params.id, req.body.reason));
  });

  getAllReviews = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Reviews fetched.', await adminService.getAllReviews(req.query));
  });

  deleteReview = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Review deleted.', await adminService.deleteReview(req.params.id));
  });

  flagReview = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Review flagged.', await adminService.flagReview(req.params.id, req.body.flagged !== false));
  });

  getAnalyticsOverview = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Analytics overview.', await adminService.getAnalyticsOverview());
  });

  getRevenueAnalytics = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Revenue analytics.', await adminService.getRevenueAnalytics());
  });

  getUserAnalytics = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'User analytics.', await adminService.getUserAnalytics());
  });

  getEventAnalytics = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Event analytics.', await adminService.getEventAnalytics());
  });

  getOrganizerAnalytics = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Organizer analytics.', await adminService.getOrganizerAnalytics());
  });

  getAllPromotions = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Promotions fetched.', await adminService.getAllPromotions(req.query));
  });

  createPromotion = asyncHandler(async (req, res) => {
    sendCreated(res, 'Promotion created.', await adminService.createPromotion(req.body, req.user));
  });

  updatePromotion = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Promotion updated.', await adminService.updatePromotion(req.params.id, req.body));
  });

  deletePromotion = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Promotion deleted.', await adminService.deletePromotion(req.params.id));
  });

  disablePromotion = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Promotion disabled.', await adminService.disablePromotion(req.params.id));
  });

  getReports = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Reports fetched.', await adminService.getReports(req.query));
  });

  getReportById = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Report fetched.', await adminService.getReportById(req.params.id));
  });

  updateReport = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Report updated.', await adminService.updateReport(req.params.id, req.body));
  });

  getSystemSettings = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'System settings fetched.', await adminService.getSystemSettings());
  });

  updateSystemSettings = asyncHandler(async (req, res) => {
    sendSuccess(res, 'System settings updated.', await adminService.updateSystemSettings(req.body, req.user));
  });

  getSystemLogs = asyncHandler(async (req, res) => {
    sendSuccess(res, 'System logs fetched.', await adminService.getSystemLogs(req.query));
  });

  getSystemSessions = asyncHandler(async (req, res) => {
    sendSuccess(res, 'System sessions fetched.', await adminService.getSystemSessions(req.query));
  });

  revokeSystemSession = asyncHandler(async (req, res) => {
    sendSuccess(res, 'System session revoked.', await adminService.revokeSystemSession(req.params.id));
  });

  clearSystemSessions = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'All active sessions revoked.', await adminService.clearSystemSessions());
  });

  getSecurityAlerts = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Security alerts fetched.', await adminService.getSecurityAlerts());
  });

  getAuditLogs = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Audit logs fetched.', await adminService.getAuditLogs(req.query));
  });

  getPayouts = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Payouts fetched.', await adminService.getPayouts(req.query));
  });

  updatePayout = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Payout updated.', await adminService.updatePayout(req.params.id, req.body, req.user));
  });

  getEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Events fetched.', await adminService.getEvents(req.query));
  });

  getEventById = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event fetched.', await adminService.getEventByIdentifier(req.params.id));
  });

  updateEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event updated.', await adminService.updateEvent(req.params.id, req.body));
  });

  deleteEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event deleted.', await adminService.deleteEvent(req.params.id));
  });
}

module.exports = new AdminController();
