import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  post,
  put,
  pickEntity,
  pickPaginated,
} from "@/api/client";

const pickReviews = (payload) => {
  const result = pickPaginated("reviews")(payload);
  return {
    reviews: result.items,
    pagination: result.pagination,
    total: result.total,
    summary: payload?.summary || null,
  };
};

const reviewsService = {
  getAll: (params) =>
    get(ENDPOINTS.REVIEWS.LIST, { params, select: pickReviews }),
  getSummary: () =>
    get(ENDPOINTS.REVIEWS.SUMMARY, {
      select: (payload) => payload?.summary || payload,
    }),
  create: (data) => post(ENDPOINTS.REVIEWS.CREATE, data, { select: pickEntity("review") }),
  getMyReview: () =>
    get(ENDPOINTS.REVIEWS.MY, {
      select: (payload) => payload?.review ?? null,
    }),
  update: (id, data) =>
    put(ENDPOINTS.REVIEWS.UPDATE(id), data, { select: pickEntity("review") }),
  remove: (id) => del(ENDPOINTS.REVIEWS.DELETE(id)),
};

export default reviewsService;
