import { ENDPOINTS } from "@/config/api.config";
import { get } from "@/api/client";

const analyticsService = {
  getOverview: (params) => get(ENDPOINTS.ANALYTICS.OVERVIEW, { params }),
  getRevenue: (params) => get(ENDPOINTS.ANALYTICS.REVENUE, { params }),
  getTicketStats: (params) => get(ENDPOINTS.ANALYTICS.TICKETS, { params }),
  getEventStats: (params) => get(ENDPOINTS.ANALYTICS.EVENTS, { params }),
  getEventAnalytics: (id) => get(ENDPOINTS.ANALYTICS.EVENT(id)),
  getAudience: (params) => get(ENDPOINTS.ANALYTICS.AUDIENCE, { params }),
  getAdminOverview: (params) => get(ENDPOINTS.ANALYTICS.ADMIN_OVERVIEW, { params }),
  getAdminRevenue: (params) => get(ENDPOINTS.ANALYTICS.ADMIN_REVENUE, { params }),
  getAdminUsers: (params) => get(ENDPOINTS.ANALYTICS.ADMIN_USERS, { params }),
  getAdminEvents: (params) => get(ENDPOINTS.ANALYTICS.ADMIN_EVENTS, { params }),
  getAdminOrganizers: (params) =>
    get(ENDPOINTS.ANALYTICS.ADMIN_ORGANIZERS, { params }),
};

export default analyticsService;
