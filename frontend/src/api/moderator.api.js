import { ENDPOINTS } from "@/config/api.config";
import {
  get,
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

const pickReports = (payload) => {
  const result = pickPaginated("reports")(payload);
  return {
    reports: result.items,
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

const moderatorService = {
  getDashboard: () => get(ENDPOINTS.MODERATOR.DASHBOARD),
  getUsers: (params) =>
    get(ENDPOINTS.MODERATOR.USERS, { params, select: pickUsers }),
  suspendUser: (id, reason) =>
    post(ENDPOINTS.MODERATOR.SUSPEND_USER(id), { reason }, {
      select: pickEntity("user"),
    }),
  unsuspendUser: (id) =>
    post(ENDPOINTS.MODERATOR.UNSUSPEND_USER(id), {}, {
      select: pickEntity("user"),
    }),
  warnUser: (id, warning) =>
    post(ENDPOINTS.MODERATOR.WARN_USER(id), { warning }),
  getReports: (params) =>
    get(ENDPOINTS.MODERATOR.REPORTS, { params, select: pickReports }),
  resolveReport: (id, data) =>
    put(ENDPOINTS.MODERATOR.REPORT_RESOLVE(id), data, {
      select: pickEntity("report"),
    }),
  getPendingEvents: (params) =>
    get(ENDPOINTS.MODERATOR.EVENTS_PENDING, { params, select: pickEvents }),
  approveEvent: (id) =>
    post(ENDPOINTS.MODERATOR.APPROVE_EVENT(id), {}, {
      select: pickEntity("event"),
    }),
  rejectEvent: (id, reason) =>
    post(ENDPOINTS.MODERATOR.REJECT_EVENT(id), { reason }, {
      select: pickEntity("event"),
    }),
};

export default moderatorService;
