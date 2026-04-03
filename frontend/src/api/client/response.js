export const EMPTY_PAGINATION = {
  page: 1,
  limit: 0,
  total: 0,
  totalPages: 0,
};

export const unwrapApiResponse = (response) =>
  response?.data?.data ?? response?.data ?? null;

export const pickValue = (payload, keys = [], fallback = null) => {
  for (const key of keys) {
    if (payload?.[key] !== undefined) {
      return payload[key];
    }
  }

  return payload ?? fallback;
};

export const pickEntity =
  (...keys) =>
  (payload) =>
    pickValue(payload, keys, null);

export const pickList =
  (key, fallback = []) =>
  (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    const value = key ? payload?.[key] : payload;
    return Array.isArray(value) ? value : fallback;
  };

export const pickPaginated =
  (key) =>
  (payload) => {
    const items = pickList(key)(payload);
    const pagination = {
      ...EMPTY_PAGINATION,
      ...(payload?.pagination || {}),
    };

    if (!pagination.total && typeof payload?.total === "number") {
      pagination.total = payload.total;
    }

    if (!pagination.totalPages && pagination.limit && pagination.total) {
      pagination.totalPages = Math.ceil(pagination.total / pagination.limit);
    }

    return {
      items,
      pagination,
      total: pagination.total,
    };
  };

