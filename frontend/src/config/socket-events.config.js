// Socket event constants for real-time panel updates

export const SOCKET_EVENTS = {
  // Common events
  NOTIFICATION: "notification.created",
  
  // Messaging
  MESSAGE_NEW: "messaging.message.created",
  CONVERSATION_READ: "messaging.conversation.read",
  MESSAGE_TYPING: "user:typing",
  
  // Admin panel events
  ADMIN: {
    DASHBOARD_UPDATE: "admin:dashboard.update",
    REPORT_NEW: "admin:report.new",
    REPORT_RESOLVED: "admin:report.resolved",
    USER_BANNED: "admin:user.banned",
    USER_UNBANNED: "admin:user.unbanned",
    EVENT_APPROVED: "admin:event.approved",
    EVENT_REJECTED: "admin:event.rejected",
    PAYMENT_REFUNDED: "admin:payment.refunded",
    BOOKING_CANCELLED: "admin:booking.cancelled",
    PROMOTION_CREATED: "admin:promotion.created",
    PROMOTION_DISABLED: "admin:promotion.disabled",
    SYSTEM_ALERT: "admin:system.alert",
    METRICS_UPDATE: "admin:metrics.update",
  },

  // Moderator panel events  
  MODERATOR: {
    DASHBOARD_UPDATE: "moderator:dashboard.update",
    REPORT_NEW: "moderator:report.new",
    REPORT_RESOLVED: "moderator:report.resolved",
    EVENT_PENDING: "moderator:event.pending",
    EVENT_APPROVED: "moderator:event.approved",
    EVENT_REJECTED: "moderator:event.rejected",
    USER_SUSPENDED: "moderator:user.suspended",
    USER_RESTORED: "moderator:user.restored",
    USER_WARNING: "moderator:user.warning",
  },

  // Super Admin panel events
  SUPER_ADMIN: {
    DASHBOARD_UPDATE: "superadmin:dashboard.update",
    ROLE_CHANGED: "superadmin:role.changed",
    USER_CREATED: "superadmin:user.created",
    USER_DELETED: "superadmin:user.deleted",
    AUDIT_NEW: "superadmin:audit.new",
    PLATFORM_SETTING_CHANGED: "superadmin:platform.setting",
    SECURITY_ALERT: "superadmin:security.alert",
  },

  // Organizer panel events
  ORGANIZER: {
    DASHBOARD_UPDATE: "organizer:dashboard.update",
    BOOKING_NEW: "organizer:booking.new",
    BOOKING_CANCELLED: "organizer:booking.cancelled",
    CHECKIN_NEW: "organizer:checkin.new",
    EVENT_PUBLISHED: "organizer:event.published",
    EVENT_DRAFT: "organizer:event.draft",
    EVENT_CANCELLED: "organizer:event.cancelled",
    REVENUE_UPDATE: "organizer:revenue.update",
    TICKET_SOLD: "organizer:ticket.sold",
    TICKET_REFUNDED: "organizer:ticket.refunded",
    PAYOUT_PROCESSED: "organizer:payout.processed",
    ANALYTICS_UPDATE: "organizer:analytics.update",
  },

  // User panel events
  USER: {
    BOOKING_CONFIRMED: "user:booking.confirmed",
    BOOKING_CANCELLED: "user:booking.cancelled",
    TICKET_VALIDATED: "user:ticket.validated",
    TICKET_TRANSFERRED: "user:ticket.transferred",
    PAYMENT_SUCCESS: "user:payment.success",
    PAYMENT_FAILED: "user:payment.failed",
    REFUND_PROCESSED: "user:refund.processed",
    EVENT_UPDATED: "user:event.updated",
    EVENT_CANCELLED: "user:event.cancelled",
    SAVED_EVENT_UPDATE: "user:saved.update",
  },
};

export const PANEL_EVENT_GROUPS = {
  admin: Object.values(SOCKET_EVENTS.ADMIN),
  moderator: Object.values(SOCKET_EVENTS.MODERATOR),
  super_admin: Object.values(SOCKET_EVENTS.SUPER_ADMIN),
  organizer: Object.values(SOCKET_EVENTS.ORGANIZER),
  user: Object.values(SOCKET_EVENTS.USER),
};

export default {
  SOCKET_EVENTS,
  PANEL_EVENT_GROUPS,
};