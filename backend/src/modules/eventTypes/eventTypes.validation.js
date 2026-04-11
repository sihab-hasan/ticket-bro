// src/modules/eventTypes/eventTypes.validation.js
'use strict';
const { Joi, objectId, slug, optionalString, trimmedString } = require('../../common/validations/common.validation');

const eventTypeBodyFields = {
  name:        trimmedString(2, 100),
  description: optionalString(1000),
  icon:        Joi.string().trim().max(100).optional(),
  subcategory: objectId.optional().allow(null),
  category:    objectId.optional().allow(null),
  isActive:    Joi.boolean().optional(),
};

const createEventTypeSchema = Joi.object(eventTypeBodyFields).fork(['name'], (s) => s.required());
const updateEventTypeSchema = Joi.object(eventTypeBodyFields).min(1);
const eventTypeSlugParamsSchema = Joi.object({ slug: slug.required() });

module.exports = { createEventTypeSchema, updateEventTypeSchema, eventTypeSlugParamsSchema };
