import { ENDPOINTS } from "@/config/api.config";
import { del, get, post, put, pickEntity, pickList } from "@/api/client";

const eventTypesService = {
  // Public: active only (cached on backend)
  getAll: (params) => get(ENDPOINTS.EVENT_TYPES.LIST, { params, select: pickList("eventTypes") }),
  // Admin: all including inactive
  getAllAdmin: (params) => get(ENDPOINTS.EVENT_TYPES.ADMIN_LIST, { params, select: pickList("eventTypes") }),
  getBySlug: (slug) => get(ENDPOINTS.EVENT_TYPES.DETAIL(slug), { select: pickEntity("eventType") }),
  create: (data) => post(ENDPOINTS.EVENT_TYPES.CREATE, data, { select: pickEntity("eventType") }),
  update: (slug, data) => put(ENDPOINTS.EVENT_TYPES.UPDATE(slug), data, { select: pickEntity("eventType") }),
  remove: (slug) => del(ENDPOINTS.EVENT_TYPES.DELETE(slug)),
};

export default eventTypesService;
