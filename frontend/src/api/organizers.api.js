import { ENDPOINTS } from "@/config/api.config";
import {
  get,
  post,
  put,
  pickEntity,
  pickPaginated,
} from "@/api/client";

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

const pickPayouts = (payload) => {
  const result = pickPaginated("payouts")(payload);
  return {
    payouts: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const mapDashboard = (payload) => {
  const profile = payload?.profile || null;
  const overview = payload?.overview || {};

  return {
    ...payload,
    profile,
    overview,
    totalEvents: overview.totalEvents || 0,
    totalTicketsSold: overview.totalBookings || 0,
    totalRevenue: overview.totalRevenue || 0,
    activeEvents: overview.activeEvents || 0,
    recentEvents: payload?.recentEvents || [],
    recentBookings: payload?.recentBookings || [],
    avgRating: payload?.avgRating || 0,
    pendingPayout: payload?.pendingPayout || 0,
  };
};

const organizersService = {
  getBySlug: (slug) =>
    get(ENDPOINTS.ORGANIZERS.PROFILE(slug), { select: pickEntity("organizer") }),
  getOrganizerEvents: (slug, params) =>
    get(ENDPOINTS.ORGANIZERS.EVENTS(slug), {
      params,
      select: pickEvents,
    }),
  getProfile: () =>
    get(ENDPOINTS.ORGANIZERS.OWN_PROFILE, {
      select: pickEntity("organizer"),
    }),
  updateProfile: (data) =>
    put(ENDPOINTS.ORGANIZERS.OWN_PROFILE, data, {
      select: pickEntity("organizer"),
    }),
  submitVerification: (data = {}) =>
    post(ENDPOINTS.ORGANIZERS.OWN_VERIFICATION, data),
  getVerification: () => get(ENDPOINTS.ORGANIZERS.OWN_VERIFICATION),
  getDashboard: () =>
    get(ENDPOINTS.ORGANIZERS.DASHBOARD, { select: mapDashboard }),
  getMyEvents: (params) =>
    get(ENDPOINTS.ORGANIZERS.MY_EVENTS, {
      params,
      select: pickEvents,
    }),
  getMyBookings: (params) =>
    get(ENDPOINTS.ORGANIZERS.MY_BOOKINGS, {
      params,
      select: pickBookings,
    }),
  getRevenue: (params) => get(ENDPOINTS.ORGANIZERS.REVENUE, { params }),
  getPayouts: (params) =>
    get(ENDPOINTS.ORGANIZERS.PAYOUTS, {
      params,
      select: pickPayouts,
    }),
  getAnalyticsOverview: (params) =>
    get(ENDPOINTS.ORGANIZERS.ANALYTICS_OVERVIEW, { params }),
  getAnalyticsRevenue: (params) =>
    get(ENDPOINTS.ORGANIZERS.ANALYTICS_REVENUE, { params }),
  getAnalyticsTickets: (params) =>
    get(ENDPOINTS.ORGANIZERS.ANALYTICS_TICKETS, { params }),
  getAnalyticsEvents: (params) =>
    get(ENDPOINTS.ORGANIZERS.ANALYTICS_EVENTS, { params }),
  getAnalyticsEvent: (id) => get(ENDPOINTS.ORGANIZERS.ANALYTICS_EVENT(id)),
  getAnalyticsAudience: (params) =>
    get(ENDPOINTS.ORGANIZERS.ANALYTICS_AUDIENCE, { params }),
};

export default organizersService;
