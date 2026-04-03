'use strict';

const { Joi, objectId, slug, optionalString, trimmedString } = require('../../common/validations/common.validation');

const subcategoryBodyFields = {
  name: trimmedString(2, 100),
  description: optionalString(1000),
  category: objectId.optional(),
  isActive: Joi.boolean().optional(),
};

const createSubcategorySchema = Joi.object(subcategoryBodyFields).fork(['name', 'category'], (schema) => schema.required());
const updateSubcategorySchema = Joi.object(subcategoryBodyFields).min(1);

const subcategorySlugParamsSchema = Joi.object({
  slug: slug.required(),
});

const subcategoryListQuerySchema = Joi.object({
  categoryId: objectId.optional(),
});

module.exports = {
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategorySlugParamsSchema,
  subcategoryListQuerySchema,
};
