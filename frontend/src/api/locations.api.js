import { ENDPOINTS } from "@/config/api.config";
import { get, pickEntity, pickList } from "@/api/client";

const locationsService = {
  getAll: (params) => get(ENDPOINTS.LOCATIONS.LIST, { params, select: pickList("locations") }),
  getCities: (params) => get(ENDPOINTS.LOCATIONS.CITIES, { params, select: pickList("cities") }),
  getCountries: () => get(ENDPOINTS.LOCATIONS.COUNTRIES, { select: pickList("countries") }),
  getBySlug: (slug) =>
    get(ENDPOINTS.LOCATIONS.DETAIL(slug), { select: pickEntity("location") }),
};

export default locationsService;
