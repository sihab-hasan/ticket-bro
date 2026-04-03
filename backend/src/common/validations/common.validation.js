'use strict';

const Joi = require('joi');

const objectId = Joi.string()
  .trim()
  .hex()
  .length(24)
  .messages({
    'string.hex': 'Must be a valid MongoDB ObjectId.',
    'string.length': 'Must be a valid MongoDB ObjectId.',
  });

const slug = Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .min(2)
  .max(150)
  .messages({
    'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens.',
  });

const trimmedString = (min = 1, max = 255) =>
  Joi.string().trim().min(min).max(max);

const optionalString = (max = 255) =>
  Joi.string().trim().max(max).empty('');

const optionalUrl = Joi.string()
  .trim()
  .uri({ scheme: ['http', 'https'] })
  .max(2048)
  .empty('');

const fileOrUrl = Joi.string()
  .trim()
  .max(2048)
  .empty('');

const isoDate = Joi.date().iso();

const currencyCode = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]{3}$/)
  .messages({
    'string.pattern.base': 'Currency must be a valid 3-letter ISO code.',
  });

const paginationFields = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().trim().max(100).optional(),
};

module.exports = {
  Joi,
  objectId,
  slug,
  trimmedString,
  optionalString,
  optionalUrl,
  fileOrUrl,
  isoDate,
  currencyCode,
  paginationFields,
};
