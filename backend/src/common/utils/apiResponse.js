'use strict';

const { StatusCodes } = require('http-status-codes');

class ApiResponse {
  constructor(statusCode, success, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

class SuccessResponse extends ApiResponse {
  constructor(message, data = null, meta = null, statusCode = StatusCodes.OK) {
    super(statusCode, true, message, data, meta);
  }
}

class CreatedResponse extends ApiResponse {
  constructor(message, data = null) {
    super(StatusCodes.CREATED, true, message, data);
  }
}

class ErrorResponse extends ApiResponse {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, errors = null) {
    super(statusCode, false, message, null);
    if (errors) this.errors = errors;
  }
}

// Factory helpers
const sendSuccess = (res, message, data = null, statusCode = StatusCodes.OK) => {
  return new SuccessResponse(message, data).send(res);
};

const sendCreated = (res, message, data = null) => {
  return new CreatedResponse(message, data).send(res);
};

const sendError = (res, message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, errors = null) => {
  return new ErrorResponse(message, statusCode, errors).send(res);
};

const sendPaginated = (res, message, data, pagination) => {
  const meta = {
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
  };
  return new SuccessResponse(message, data, meta).send(res);
};

module.exports = {
  ApiResponse,
  SuccessResponse,
  CreatedResponse,
  ErrorResponse,
  sendSuccess,
  sendCreated,
  sendError,
  sendPaginated,
};
