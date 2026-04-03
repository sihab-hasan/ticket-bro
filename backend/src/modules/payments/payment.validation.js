'use strict';

const { Joi, currencyCode, objectId, optionalString, paginationFields, trimmedString } = require('../../common/validations/common.validation');

const createPaymentIntentSchema = Joi.object({
  bookingRef: trimmedString(3, 100).required(),
  currency: currencyCode.optional(),
});

const verifyPaymentSchema = Joi.object({
  paymentIntentId: trimmedString(3, 255).required(),
  bookingRef: trimmedString(3, 100).optional(),
});

const refundRequestSchema = Joi.object({
  reason: optionalString(500),
});

const paymentsQuerySchema = Joi.object({
  ...paginationFields,
});

const paymentIdParamsSchema = Joi.object({
  id: objectId.required(),
});

const paymentMethodParamsSchema = Joi.object({
  id: trimmedString(1, 255).required(),
});

module.exports = {
  createPaymentIntentSchema,
  verifyPaymentSchema,
  refundRequestSchema,
  paymentsQuerySchema,
  paymentIdParamsSchema,
  paymentMethodParamsSchema,
};
