'use strict';

const logger = require('../logger/logger');
const { emitToUser, getIO } = require('./socketServer');

const SOCKET_EVENTS = {
  ADMIN: {
    DASHBOARD_UPDATE: 'admin:dashboard.update',
    REPORT_NEW: 'admin:report.new',
    REPORT_RESOLVED: 'admin:report.resolved',
    USER_BANNED: 'admin:user.banned',
    USER_UNBANNED: 'admin:user.unbanned',
    EVENT_APPROVED: 'admin:event.approved',
    EVENT_REJECTED: 'admin:event.rejected',
    PAYMENT_REFUNDED: 'admin:payment.refunded',
    BOOKING_CANCELLED: 'admin:booking.cancelled',
    PROMOTION_CREATED: 'admin:promotion.created',
    PROMOTION_DISABLED: 'admin:promotion.disabled',
    SYSTEM_ALERT: 'admin:system.alert',
    METRICS_UPDATE: 'admin:metrics.update',
  },
  MODERATOR: {
    DASHBOARD_UPDATE: 'moderator:dashboard.update',
    REPORT_NEW: 'moderator:report.new',
    REPORT_RESOLVED: 'moderator:report.resolved',
    EVENT_PENDING: 'moderator:event.pending',
    EVENT_APPROVED: 'moderator:event.approved',
    EVENT_REJECTED: 'moderator:event.rejected',
    USER_SUSPENDED: 'moderator:user.suspended',
    USER_RESTORED: 'moderator:user.restored',
    USER_WARNING: 'moderator:user.warning',
  },
  SUPER_ADMIN: {
    DASHBOARD_UPDATE: 'superadmin:dashboard.update',
    ROLE_CHANGED: 'superadmin:role.changed',
    USER_CREATED: 'superadmin:user.created',
    USER_DELETED: 'superadmin:user.deleted',
    AUDIT_NEW: 'superadmin:audit.new',
    PLATFORM_SETTING_CHANGED: 'superadmin:platform.setting',
    SECURITY_ALERT: 'superadmin:security.alert',
  },
  ORGANIZER: {
    DASHBOARD_UPDATE: 'organizer:dashboard.update',
    BOOKING_NEW: 'organizer:booking.new',
    BOOKING_CANCELLED: 'organizer:booking.cancelled',
    CHECKIN_NEW: 'organizer:checkin.new',
    EVENT_PUBLISHED: 'organizer:event.published',
    EVENT_DRAFT: 'organizer:event.draft',
    EVENT_CANCELLED: 'organizer:event.cancelled',
    REVENUE_UPDATE: 'organizer:revenue.update',
    TICKET_SOLD: 'organizer:ticket.sold',
    TICKET_REFUNDED: 'organizer:ticket.refunded',
    PAYOUT_PROCESSED: 'organizer:payout.processed',
    ANALYTICS_UPDATE: 'organizer:analytics.update',
  },
  USER: {
    BOOKING_CONFIRMED: 'user:booking.confirmed',
    BOOKING_CANCELLED: 'user:booking.cancelled',
    TICKET_VALIDATED: 'user:ticket.validated',
    TICKET_TRANSFERRED: 'user:ticket.transferred',
    PAYMENT_SUCCESS: 'user:payment.success',
    PAYMENT_FAILED: 'user:payment.failed',
    REFUND_PROCESSED: 'user:refund.processed',
    EVENT_UPDATED: 'user:event.updated',
    EVENT_CANCELLED: 'user:event.cancelled',
    SAVED_EVENT_UPDATE: 'user:saved.update',
  },
};

const emitSafe = (userId, event, data) => {
  try {
    if (!getIO()) {
      logger.debug('Socket server not initialized, skipping emit', { event, userId });
      return;
    }
    emitToUser(userId, event, data);
  } catch (err) {
    logger.warn('Failed to emit socket event', { event, err: err.message });
  }
};

const socketEvents = {
  // Admin events
  emitAdminDashboardUpdate: (adminIds, data) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.DASHBOARD_UPDATE, data));
  },
  emitAdminReportNew: (adminIds, report) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.REPORT_NEW, { report }));
  },
  emitAdminUserBanned: (adminIds, userId, data) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.USER_BANNED, { userId, ...data }));
  },
  emitAdminUserUnbanned: (adminIds, userId, data) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.USER_UNBANNED, { userId, ...data }));
  },
  emitAdminEventApproved: (adminIds, eventId, data) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.EVENT_APPROVED, { eventId, ...data }));
  },
  emitAdminEventRejected: (adminIds, eventId, data) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.EVENT_REJECTED, { eventId, ...data }));
  },
  emitAdminSystemAlert: (adminIds, alert) => {
    adminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.ADMIN.SYSTEM_ALERT, { alert }));
  },

  // Moderator events
  emitModeratorDashboardUpdate: (moderatorIds, data) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.DASHBOARD_UPDATE, data));
  },
  emitModeratorReportNew: (moderatorIds, report) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.REPORT_NEW, { report }));
  },
  emitModeratorReportResolved: (moderatorIds, reportId, data) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.REPORT_RESOLVED, { reportId, ...data }));
  },
  emitModeratorEventPending: (moderatorIds, event) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.EVENT_PENDING, { event }));
  },
  emitModeratorEventApproved: (moderatorIds, eventId) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.EVENT_APPROVED, { eventId }));
  },
  emitModeratorEventRejected: (moderatorIds, eventId, reason) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.EVENT_REJECTED, { eventId, reason }));
  },
  emitModeratorUserSuspended: (moderatorIds, userId, data) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.USER_SUSPENDED, { userId, ...data }));
  },
  emitModeratorUserRestored: (moderatorIds, userId) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.USER_RESTORED, { userId }));
  },
  emitModeratorUserWarning: (moderatorIds, userId, warning) => {
    moderatorIds.forEach(id => emitSafe(id, SOCKET_EVENTS.MODERATOR.USER_WARNING, { userId, warning }));
  },

  // Super Admin events
  emitSuperAdminDashboardUpdate: (superAdminIds, data) => {
    superAdminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.SUPER_ADMIN.DASHBOARD_UPDATE, data));
  },
  emitSuperAdminRoleChanged: (superAdminIds, userId, role) => {
    superAdminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.SUPER_ADMIN.ROLE_CHANGED, { userId, role }));
  },
  emitSuperAdminSecurityAlert: (superAdminIds, alert) => {
    superAdminIds.forEach(id => emitSafe(id, SOCKET_EVENTS.SUPER_ADMIN.SECURITY_ALERT, { alert }));
  },

  // Organizer events
  emitOrganizerDashboardUpdate: (organizerId, data) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.DASHBOARD_UPDATE, data);
  },
  emitOrganizerBookingNew: (organizerId, booking) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.BOOKING_NEW, { booking });
  },
  emitOrganizerBookingCancelled: (organizerId, bookingId, data) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.BOOKING_CANCELLED, { bookingId, ...data });
  },
  emitOrganizerCheckin: (organizerId, data) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.CHECKIN_NEW, data);
  },
  emitOrganizerRevenueUpdate: (organizerId, data) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.REVENUE_UPDATE, data);
  },
  emitOrganizerTicketSold: (organizerId, ticket) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.TICKET_SOLD, { ticket });
  },
  emitOrganizerAnalyticsUpdate: (organizerId, data) => {
    emitSafe(organizerId, SOCKET_EVENTS.ORGANIZER.ANALYTICS_UPDATE, data);
  },

  // User events
  emitUserBookingConfirmed: (userId, booking) => {
    emitSafe(userId, SOCKET_EVENTS.USER.BOOKING_CONFIRMED, { booking });
  },
  emitUserBookingCancelled: (userId, bookingId, data) => {
    emitSafe(userId, SOCKET_EVENTS.USER.BOOKING_CANCELLED, { bookingId, ...data });
  },
  emitUserTicketValidated: (userId, ticket) => {
    emitSafe(userId, SOCKET_EVENTS.USER.TICKET_VALIDATED, { ticket });
  },
  emitUserTicketTransferred: (userId, ticket) => {
    emitSafe(userId, SOCKET_EVENTS.USER.TICKET_TRANSFERRED, { ticket });
  },
  emitUserPaymentSuccess: (userId, payment) => {
    emitSafe(userId, SOCKET_EVENTS.USER.PAYMENT_SUCCESS, { payment });
  },
  emitUserPaymentFailed: (userId, paymentId, reason) => {
    emitSafe(userId, SOCKET_EVENTS.USER.PAYMENT_FAILED, { paymentId, reason });
  },
  emitUserRefundProcessed: (userId, refund) => {
    emitSafe(userId, SOCKET_EVENTS.USER.REFUND_PROCESSED, { refund });
  },
  emitUserEventUpdated: (userId, event) => {
    emitSafe(userId, SOCKET_EVENTS.USER.EVENT_UPDATED, { event });
  },
  emitUserEventCancelled: (userId, eventId, reason) => {
    emitSafe(userId, SOCKET_EVENTS.USER.EVENT_CANCELLED, { eventId, reason });
  },
};

module.exports = { socketEvents, SOCKET_EVENTS };