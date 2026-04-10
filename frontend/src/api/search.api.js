import { ENDPOINTS } from "@/config/api.config";
import { get, pickList } from "@/api/client";

const searchService = {
  search: (params) => get(ENDPOINTS.SEARCH.ROOT, { params }),
  autocomplete: (q) =>
    get(ENDPOINTS.SEARCH.AUTOCOMPLETE, {
      params: { q },
      select: (payload) =>
        payload?.suggestions || payload?.results || pickList()(payload),
    }),
  getTrending: () => get(ENDPOINTS.SEARCH.TRENDING),
  getNearby: (params) => get(ENDPOINTS.SEARCH.NEARBY, { params }),
  getFacets: (params) => get(ENDPOINTS.SEARCH.FACETS, { params }),
};

export default searchService;
