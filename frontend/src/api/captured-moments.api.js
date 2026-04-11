import { ENDPOINTS } from "@/config/api.config";
import { get, pickEntity, pickList, post, upload } from "@/api/client";

export const getCapturedMoments = (params, options = {}) =>
  get(ENDPOINTS.CAPTURED_MOMENTS.LIST, {
    params,
    headers: options.headers,
    signal: options.signal,
    select: (payload) => ({
      moments: pickList("moments")(payload),
      pagination: payload?.pagination || null,
    }),
  });

export const uploadCapturedMoments = (files, data = {}) => {
  const form = new FormData();

  files.forEach((file) => form.append("images", file));

  if (data.categoryId) {
    form.append("categoryId", data.categoryId);
  }

  if (data.title) {
    form.append("title", data.title);
  }

  return upload(ENDPOINTS.CAPTURED_MOMENTS.CREATE, form, {
    select: pickList("moments"),
  });
};

export const toggleCapturedMomentReaction = (id) =>
  post(ENDPOINTS.CAPTURED_MOMENTS.REACTION(id), {}, {
    select: (payload) => ({
      moment: pickEntity("moment")(payload),
      reaction: payload?.reaction || null,
    }),
  });

export default {
  getCapturedMoments,
  uploadCapturedMoments,
  toggleCapturedMomentReaction,
};
