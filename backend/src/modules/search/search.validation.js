'use strict';

const Joi = require('joi');

const paginationFields = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

const searchQuerySchema = Joi.object({
  ...paginationFields,
  q: Joi.string().allow('').max(200).default(''),
  category: Joi.string().allow('').default(''),
  subcategory: Joi.string().allow('').default(''),
  location: Joi.string().allow('').default(''),
  city: Joi.string().allow('').default(''),
  startDate: Joi.string().allow('').default(''),
  endDate: Joi.string().allow('').default(''),
  minPrice: Joi.any().allow('').default(''),
  maxPrice: Joi.any().allow('').default(''),
  isFree: Joi.any().default(false),
  sort: Joi.string().default('-createdAt'),
  tags: Joi.string().allow('').default(''),
});

const autocompleteQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required(),
  limit: Joi.number().integer().min(1).max(20).default(10),
});

const nearbyQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(1).max(100).default(30),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const facetsQuerySchema = Joi.object({
  category: Joi.string().max(100).allow('').default(''),
});

module.exports = {
  searchQuerySchema,
  autocompleteQuerySchema,
  nearbyQuerySchema,
  facetsQuerySchema,
};
