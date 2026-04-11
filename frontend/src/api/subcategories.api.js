import { ENDPOINTS } from "@/config/api.config";
import { del, get, post, put, pickEntity, pickList } from "@/api/client";

const subcategoriesService = {
  // Public: active only (cached on backend)
  getAll: (params) => get(ENDPOINTS.SUBCATEGORIES.LIST, { params, select: pickList("subcategories") }),
  // Admin: all including inactive
  getAllAdmin: (params) => get(ENDPOINTS.SUBCATEGORIES.ADMIN_LIST, { params, select: pickList("subcategories") }),
  getBySlug: (slug) => get(ENDPOINTS.SUBCATEGORIES.DETAIL(slug), { select: pickEntity("subcategory") }),
  create: (data) => post(ENDPOINTS.SUBCATEGORIES.CREATE, data, { select: pickEntity("subcategory") }),
  update: (slug, data) => put(ENDPOINTS.SUBCATEGORIES.UPDATE(slug), data, { select: pickEntity("subcategory") }),
  remove: (slug) => del(ENDPOINTS.SUBCATEGORIES.DELETE(slug)),
};

export default subcategoriesService;
