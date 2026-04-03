import api from "@/lib/axios";
import { normalizeApiError } from "./errors";
import { unwrapApiResponse } from "./response";

const runRequest = async (config, options = {}) => {
  const { raw = false, select } = options;

  try {
    const response = await api.request(config);

    if (raw) {
      return response;
    }

    const payload = unwrapApiResponse(response);
    return typeof select === "function" ? select(payload, response) : payload;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const request = (config, options) => runRequest(config, options);

export const get = (url, options = {}) =>
  runRequest(
    {
      method: "get",
      url,
      params: options.params,
      headers: options.headers,
      responseType: options.responseType,
      signal: options.signal,
    },
    options,
  );

export const post = (url, data, options = {}) =>
  runRequest(
    {
      method: "post",
      url,
      data,
      params: options.params,
      headers: options.headers,
      signal: options.signal,
    },
    options,
  );

export const put = (url, data, options = {}) =>
  runRequest(
    {
      method: "put",
      url,
      data,
      params: options.params,
      headers: options.headers,
      signal: options.signal,
    },
    options,
  );

export const patch = (url, data, options = {}) =>
  runRequest(
    {
      method: "patch",
      url,
      data,
      params: options.params,
      headers: options.headers,
      signal: options.signal,
    },
    options,
  );

export const del = (url, options = {}) =>
  runRequest(
    {
      method: "delete",
      url,
      data: options.data,
      params: options.params,
      headers: options.headers,
      signal: options.signal,
    },
    options,
  );

export const upload = (url, data, options = {}) =>
  runRequest(
    {
      method: "post",
      url,
      data,
      params: options.params,
      headers: options.headers,
      signal: options.signal,
    },
    options,
  );

export const download = (url, options = {}) =>
  runRequest(
    {
      method: "get",
      url,
      params: options.params,
      headers: options.headers,
      responseType: "blob",
      signal: options.signal,
    },
    {
      ...options,
      select: (_payload, response) => response.data,
    },
  );

