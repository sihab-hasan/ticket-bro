import { ENDPOINTS } from "@/config/api.config";
import { get, pickEntity, pickList } from "@/api/client";

const tagsService = {
  getAll: (params) => get(ENDPOINTS.TAGS.LIST, { params, select: pickList("tags") }),
  getPopular: () => get(ENDPOINTS.TAGS.POPULAR, { select: pickList("tags") }),
  getBySlug: (slug) =>
    get(ENDPOINTS.TAGS.DETAIL(slug), { select: pickEntity("tag") }),
};

export default tagsService;
