import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  patch,
  post,
  put,
  pickEntity,
  pickPaginated,
} from "@/api/client";

const pickUsers = (payload) => {
  const result = pickPaginated("users")(payload);
  return {
    users: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickEvents = (payload) => {
  const result = pickPaginated("events")(payload);
  return {
    events: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickBookings = (payload) => {
  const result = pickPaginated("bookings")(payload);
  return {
    bookings: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickPayments = (payload) => {
  const result = pickPaginated("payments")(payload);
  return {
    payments: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickPromotions = (payload) => {
  const result = pickPaginated("promotions")(payload);
  return {
    promotions: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickReviews = (payload) => {
  const result = pickPaginated("reviews")(payload);
  return {
    reviews: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const adminService = {
  getDashboard: () => get(ENDPOINTS.ADMIN.DASHBOARD),
  getDashboardStats: () => get(ENDPOINTS.ADMIN.DASHBOARD_STATS),
  getSystemHealth: () => get(ENDPOINTS.ADMIN.SYSTEM_HEALTH),
  getSystemMetrics: () => get(ENDPOINTS.ADMIN.SYSTEM_METRICS),
  getFeatureFlags: () => get(ENDPOINTS.ADMIN.FEATURE_FLAGS),
  updateFeatureFlags: (data) => put(ENDPOINTS.ADMIN.FEATURE_FLAGS, data),

  getUsers: (params) => get(ENDPOINTS.ADMIN.USERS, { params, select: pickUsers }),
  getUserById: (id) => get(ENDPOINTS.ADMIN.USER(id), { select: pickEntity("user") }),
  updateUser: (id, data) =>
    patch(ENDPOINTS.ADMIN.USER(id), data, { select: pickEntity("user") }),
  deleteUser: (id) => del(ENDPOINTS.ADMIN.USER(id)),
  banUser: (id) => patch(ENDPOINTS.ADMIN.BAN_USER(id), {}, { select: pickEntity("user") }),
  unbanUser: (id) => patch(ENDPOINTS.ADMIN.UNBAN_USER(id), {}, { select: pickEntity("user") }),
  changeUserRole: (id, role) =>
    patch(ENDPOINTS.ADMIN.USER_ROLE(id), { role }, { select: pickEntity("user") }),

  getEvents: (params) => get(ENDPOINTS.ADMIN.EVENTS, { params, select: pickEvents }),
  getEventBySlug: (slug) =>
    get(ENDPOINTS.ADMIN.EVENT(slug), { select: pickEntity("event") }),
  updateEvent: (id, data) =>
    patch(ENDPOINTS.ADMIN.EVENT(id), data, { select: pickEntity("event") }),
  approveEvent: (slug) =>
    patch(ENDPOINTS.ADMIN.EVENT(slug), { status: "published" }, { select: pickEntity("event") }),
  rejectEvent: (slug, data) =>
    patch(
      ENDPOINTS.ADMIN.EVENT(slug),
      { status: "rejected", ...(data || {}) },
      { select: pickEntity("event") },
    ),
  deleteEvent: (slug) => del(ENDPOINTS.ADMIN.EVENT(slug)),

  getBookings: (params) =>
    get(ENDPOINTS.ADMIN.BOOKINGS, { params, select: pickBookings }),
  getBookingById: (id) =>
    get(ENDPOINTS.ADMIN.BOOKING(id), { select: pickEntity("booking") }),
  cancelBooking: (ref, data) => put(ENDPOINTS.ADMIN.BOOKING_CANCEL(ref), data || {}),
  refundBooking: (ref, data) => put(ENDPOINTS.ADMIN.BOOKING_REFUND(ref), data || {}),

  getPayments: (params) =>
    get(ENDPOINTS.ADMIN.PAYMENTS, { params, select: pickPayments }),
  getPaymentById: (id) =>
    get(ENDPOINTS.ADMIN.PAYMENT(id), { select: pickEntity("payment") }),
  refundPayment: (id, data) =>
    post(ENDPOINTS.ADMIN.PAYMENT_REFUND(id), data || {}, { select: pickEntity("payment") }),

  getReviews: (params) =>
    get(ENDPOINTS.ADMIN.REVIEWS, { params, select: pickReviews }),
  flagReview: (id, flagged = true) =>
    put(ENDPOINTS.ADMIN.REVIEW_FLAG(id), { flagged }, {
      select: pickEntity("review"),
    }),
  deleteReview: (id) => del(ENDPOINTS.ADMIN.REVIEW(id)),

  getAnalyticsOverview: (params) =>
    get(ENDPOINTS.ADMIN.ANALYTICS_OVERVIEW, { params }),
  getAnalyticsRevenue: (params) =>
    get(ENDPOINTS.ADMIN.ANALYTICS_REVENUE, { params }),
  getAnalyticsUsers: (params) =>
    get(ENDPOINTS.ADMIN.ANALYTICS_USERS, { params }),
  getAnalyticsEvents: (params) =>
    get(ENDPOINTS.ADMIN.ANALYTICS_EVENTS, { params }),
  getAnalyticsOrganizers: (params) =>
    get(ENDPOINTS.ADMIN.ANALYTICS_ORGANIZERS, { params }),

  getPromotions: (params) =>
    get(ENDPOINTS.ADMIN.PROMOTIONS, { params, select: pickPromotions }),
  createPromotion: (data) =>
    post(ENDPOINTS.ADMIN.PROMOTIONS, data, { select: pickEntity("promotion") }),
  updatePromotion: (id, data) =>
    put(ENDPOINTS.ADMIN.PROMOTIONS + `/${id}`, data, {
      select: pickEntity("promotion"),
    }),
  deletePromotion: (id) => del(ENDPOINTS.ADMIN.PROMOTIONS + `/${id}`),
  disablePromotion: (id, data) =>
    put(ENDPOINTS.ADMIN.PROMOTION_DISABLE(id), data || {}, {
      select: pickEntity("promotion"),
    }),

  getReports: (params) => get(ENDPOINTS.ADMIN.REPORTS, { params }),
  getReportById: (id) => get(ENDPOINTS.ADMIN.REPORT(id)),
  updateReport: (id, data) => patch(ENDPOINTS.ADMIN.REPORT_ACTION(id), data),

  getSystemSettings: () => get(ENDPOINTS.ADMIN.SYSTEM_SETTINGS),
  updateSystemSettings: (data) => put(ENDPOINTS.ADMIN.SYSTEM_SETTINGS, data),
  getSystemLogs: (params) => get(ENDPOINTS.ADMIN.SYSTEM_LOGS, { params }),
  getSystemSessions: (params) =>
    get(ENDPOINTS.ADMIN.SYSTEM_SESSIONS, { params }),
  revokeSystemSession: (id) => del(`${ENDPOINTS.ADMIN.SYSTEM_SESSIONS}/${id}`),
  clearSystemSessions: () => del(ENDPOINTS.ADMIN.SYSTEM_SESSIONS),
  getSecurityAlerts: (params) =>
    get(ENDPOINTS.ADMIN.SYSTEM_SECURITY_ALERTS, { params }),
  getAuditLogs: (params) =>
    get(ENDPOINTS.ADMIN.SYSTEM_AUDIT_LOGS, { params }),
  getPayouts: (params) => get(ENDPOINTS.ADMIN.PAYOUTS, { params }),
  updatePayout: (id, data) => patch(ENDPOINTS.ADMIN.PAYOUT(id), data),
};

export default adminService;
