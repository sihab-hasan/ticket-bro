import { ENDPOINTS } from "@/config/api.config";
import { get, pickList, pickPaginated } from "@/api/client";

const pickResults = (payload) => {
  const result = pickPaginated("results")(payload);
  return {
    results: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const searchService = {
  search: (params) => get(ENDPOINTS.SEARCH.ROOT, { params, select: pickResults }),
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
