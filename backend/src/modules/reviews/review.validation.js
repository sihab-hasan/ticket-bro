'use strict';

const {
  Joi,
  objectId,
  optionalString,
  paginationFields,
  trimmedString,
} = require('../../common/validations/common.validation');
const { mongoIdParamSchema } = require('../../common/validations/id.validation');

const booleanQuery = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid('true', 'false'),
);

const reviewListQuerySchema = Joi.object({
  ...paginationFields,
  sort: Joi.string()
    .valid('-createdAt', 'createdAt', '-rating', 'rating')
    .default('-createdAt'),
  search: optionalString(200),
});

const createReviewSchema = Joi.object({
  event: objectId.optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: optionalString(200),
  body: trimmedString(1, 2000).required(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  title: optionalString(200),
  body: trimmedString(1, 2000).optional(),
}).min(1);

const reviewIdParamsSchema = mongoIdParamSchema('id');

const adminReviewListQuerySchema = Joi.object({
  ...paginationFields,
  sort: Joi.string()
    .valid('-createdAt', 'createdAt', '-rating', 'rating')
    .default('-createdAt'),
  search: optionalString(200),
  reported: booleanQuery.optional(),
});

const adminReviewFlagSchema = Joi.object({
  flagged: Joi.boolean().optional().default(true),
});

module.exports = {
  adminReviewFlagSchema,
  adminReviewListQuerySchema,
  createReviewSchema,
  reviewIdParamsSchema,
  reviewListQuerySchema,
  updateReviewSchema,
};
