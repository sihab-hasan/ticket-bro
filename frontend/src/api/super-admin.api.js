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

const pickAdmins = (payload) => {
  const result = pickPaginated("admins")(payload);
  return {
    admins: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickUsers = (payload) => {
  const result = pickPaginated("users")(payload);
  return {
    users: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const pickLogs = (payload) => {
  const result = pickPaginated("logs")(payload);
  return {
    logs: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const superAdminService = {
  getDashboard: () => get(ENDPOINTS.SUPER_ADMIN.DASHBOARD),
  getAdmins: (params) =>
    get(ENDPOINTS.SUPER_ADMIN.ADMINS, { params, select: pickAdmins }),
  getUsers: (params) =>
    get(ENDPOINTS.SUPER_ADMIN.USERS, { params, select: pickUsers }),
  assignAdminRole: (id) =>
    post(ENDPOINTS.SUPER_ADMIN.ASSIGN_ADMIN(id), {}, {
      select: pickEntity("user"),
    }),
  revokeAdminRole: (id) =>
    del(ENDPOINTS.SUPER_ADMIN.REVOKE_ADMIN(id), {
      select: pickEntity("user"),
    }),
  updateUserRole: (id, role) =>
    patch(ENDPOINTS.SUPER_ADMIN.USER_ROLE(id), { role }, {
      select: pickEntity("user"),
    }),
  getSettings: () => get(ENDPOINTS.SUPER_ADMIN.SETTINGS),
  updateSettings: (data) => put(ENDPOINTS.SUPER_ADMIN.SETTINGS, data),
  getAuditLogs: (params) =>
    get(ENDPOINTS.SUPER_ADMIN.AUDIT_LOGS, { params, select: pickLogs }),
  forceLogoutAll: () => post(ENDPOINTS.SUPER_ADMIN.FORCE_LOGOUT_ALL, {}),
  getHealth: () => get(ENDPOINTS.SUPER_ADMIN.HEALTH),
};

export default superAdminService;
