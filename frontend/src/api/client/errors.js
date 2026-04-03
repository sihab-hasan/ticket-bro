import axios from "axios";

export class ApiClientError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.details = options.details ?? null;
    this.cause = options.cause ?? null;
  }
}

export const normalizeApiError = (error) => {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data;
    const message =
      payload?.message ||
      payload?.error?.message ||
      error.message ||
      "Request failed";

    return new ApiClientError(message, {
      status: error.response?.status,
      code: payload?.code || error.code || null,
      details: payload?.errors || payload?.details || null,
      cause: error,
    });
  }

  return new ApiClientError(error?.message || "Unexpected error", {
    cause: error,
  });
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong",
) => {
  const normalized = normalizeApiError(error);
  return normalized.message || fallback;
};

