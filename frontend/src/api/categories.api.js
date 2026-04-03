import { ENDPOINTS } from "@/config/api.config";
import { del, get, post, put, pickEntity, pickList } from "@/api/client";

const categoriesService = {
  getAll: (params) => get(ENDPOINTS.CATEGORIES.LIST, { params, select: pickList("categories") }),
  getBySlug: (slug) =>
    get(ENDPOINTS.CATEGORIES.DETAIL(slug), { select: pickEntity("category") }),
  getSubcategories: (slug) =>
    get(ENDPOINTS.CATEGORIES.SUBS(slug), { select: pickList("subcategories") }),
  create: (data) => post(ENDPOINTS.CATEGORIES.CREATE, data, { select: pickEntity("category") }),
  update: (slug, data) =>
    put(ENDPOINTS.CATEGORIES.UPDATE(slug), data, { select: pickEntity("category") }),
  remove: (slug) => del(ENDPOINTS.CATEGORIES.DELETE(slug)),
};

export default categoriesService;
