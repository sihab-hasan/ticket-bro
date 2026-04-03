import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  post,
  put,
  pickEntity,
  pickPaginated,
} from "@/api/client";

const pickPromotions = (payload) => {
  const result = pickPaginated("promotions")(payload);
  return {
    promotions: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const promotionsService = {
  validateCode: (code) => post(ENDPOINTS.PROMOTIONS.VALIDATE, { code }),
  create: (data) =>
    post(ENDPOINTS.PROMOTIONS.ORGANIZER_CREATE, data, {
      select: pickEntity("promotion"),
    }),
  getMyPromotions: (params) =>
    get(ENDPOINTS.PROMOTIONS.ORGANIZER_LIST, {
      params,
      select: pickPromotions,
    }),
  update: (id, data) =>
    put(ENDPOINTS.PROMOTIONS.ORGANIZER_DETAIL(id), data, {
      select: pickEntity("promotion"),
    }),
  remove: (id) => del(ENDPOINTS.PROMOTIONS.ORGANIZER_DETAIL(id)),
  getAdminPromotions: (params) =>
    get(ENDPOINTS.PROMOTIONS.ADMIN_LIST, {
      params,
      select: pickPromotions,
    }),
  disableAdminPromotion: (id, data) =>
    put(ENDPOINTS.PROMOTIONS.ADMIN_DISABLE(id), data || {}, {
      select: pickEntity("promotion"),
    }),
};

export default promotionsService;
