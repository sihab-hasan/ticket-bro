// ============================================================
//  API ERROR CLASS
//  src/common/errors/ApiError.js
// ============================================================

const { AppError } = require("./AppError");

class ApiError extends AppError {
  constructor(message, statusCode = 500, errorCode = "API_ERROR") {
    super(message, statusCode, errorCode);
  }

  static badRequest(message = "Bad request", errorCode = "BAD_REQUEST") {
    return new ApiError(message, 400, errorCode);
  }

  static unauthorized(message = "Unauthorized", errorCode = "UNAUTHORIZED") {
    return new ApiError(message, 401, errorCode);
  }

  static forbidden(message = "Forbidden", errorCode = "FORBIDDEN") {
    return new ApiError(message, 403, errorCode);
  }

  static notFound(message = "Resource not found", errorCode = "NOT_FOUND") {
    return new ApiError(message, 404, errorCode);
  }

  static methodNotAllowed(
    message = "Method not allowed",
    errorCode = "METHOD_NOT_ALLOWED",
  ) {
    return new ApiError(message, 405, errorCode);
  }

  static conflict(message = "Resource conflict", errorCode = "CONFLICT") {
    return new ApiError(message, 409, errorCode);
  }

  static unprocessableEntity(
    message = "Unprocessable entity",
    errorCode = "UNPROCESSABLE_ENTITY",
  ) {
    return new ApiError(message, 422, errorCode);
  }

  static tooManyRequests(
    message = "Too many requests",
    errorCode = "TOO_MANY_REQUESTS",
  ) {
    return new ApiError(message, 429, errorCode);
  }

  static internal(
    message = "Internal server error",
    errorCode = "INTERNAL_ERROR",
  ) {
    return new ApiError(message, 500, errorCode);
  }

  static serviceUnavailable(
    message = "Service unavailable",
    errorCode = "SERVICE_UNAVAILABLE",
  ) {
    return new ApiError(message, 503, errorCode);
  }

  static gatewayTimeout(
    message = "Gateway timeout",
    errorCode = "GATEWAY_TIMEOUT",
  ) {
    return new ApiError(message, 504, errorCode);
  }
}

module.exports = ApiError;
