'use strict';

const { Joi, objectId, slug, optionalString, trimmedString } = require('../../common/validations/common.validation');

const categoryBodyFields = {
  name: trimmedString(2, 100),
  description: optionalString(1000),
  isActive: Joi.boolean().optional(),
  parent: Joi.alternatives().try(objectId, Joi.valid(null)).optional(),
};

const createCategorySchema = Joi.object(categoryBodyFields).fork(['name'], (schema) => schema.required());
const updateCategorySchema = Joi.object(categoryBodyFields).min(1);

const categorySlugParamsSchema = Joi.object({
  slug: slug.required(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categorySlugParamsSchema,
};
