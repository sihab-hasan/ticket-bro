'use strict';

const {
  Joi,
  objectId,
  optionalString,
  trimmedString,
} = require('../../common/validations/common.validation');

const addItemSchema = Joi.object({
  eventId: objectId.required(),
  ticketTypeId: objectId.required(),
  quantity: Joi.number().integer().min(1).max(10).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required(),
});

const cartItemParamsSchema = Joi.object({
  itemId: objectId.required(),
});

const promoSchema = Joi.object({
  code: trimmedString(2, 50).uppercase().required(),
});

const attendeeSchema = Joi.object({
  firstName: optionalString(100),
  lastName: optionalString(100),
  email: Joi.string().trim().email().max(255).allow('').optional(),
  phone: optionalString(30),
});

const checkoutSchema = Joi.object({
  contact: Joi.object({
    firstName: trimmedString(1, 100).required(),
    lastName: optionalString(100),
    email: Joi.string().trim().email().max(255).required(),
    phone: optionalString(30),
  }).required(),
  attendees: Joi.array().items(attendeeSchema).max(50).default([]),
  notes: optionalString(1000),
});

module.exports = {
  addItemSchema,
  updateItemSchema,
  cartItemParamsSchema,
  promoSchema,
  checkoutSchema,
};
