import { ENDPOINTS } from "@/config/api.config";
import { del, get, post, put, pickEntity, pickList } from "@/api/client";

const subcategoriesService = {
  getAll: (params) => get(ENDPOINTS.SUBCATEGORIES.LIST, { params, select: pickList("subcategories") }),
  getBySlug: (slug) =>
    get(ENDPOINTS.SUBCATEGORIES.DETAIL(slug), { select: pickEntity("subcategory") }),
  create: (data) =>
    post(ENDPOINTS.SUBCATEGORIES.CREATE, data, { select: pickEntity("subcategory") }),
  update: (slug, data) =>
    put(ENDPOINTS.SUBCATEGORIES.UPDATE(slug), data, { select: pickEntity("subcategory") }),
  remove: (slug) => del(ENDPOINTS.SUBCATEGORIES.DELETE(slug)),
};

export default subcategoriesService;
