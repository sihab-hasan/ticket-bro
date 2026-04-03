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
  getByEvent: (slug, params) =>
    get(ENDPOINTS.REVIEWS.EVENT(slug), { params, select: pickReviews }),
  getSummary: (slug) =>
    get(ENDPOINTS.REVIEWS.SUMMARY(slug), {
      select: (payload) => payload?.summary || payload,
    }),
  create: (data) => post(ENDPOINTS.REVIEWS.CREATE, data, { select: pickEntity("review") }),
  getMyReviews: (params) =>
    get(ENDPOINTS.REVIEWS.MY, { params, select: pickReviews }),
  update: (id, data) =>
    put(ENDPOINTS.REVIEWS.UPDATE(id), data, { select: pickEntity("review") }),
  remove: (id) => del(ENDPOINTS.REVIEWS.DELETE(id)),
};

export default reviewsService;
