'use strict';

const {
  Joi,
  objectId,
  optionalString,
  paginationFields,
} = require('../../common/validations/common.validation');

const capturedMomentListQuerySchema = Joi.object({
  ...paginationFields,
  category: objectId.optional(),
});

const createCapturedMomentSchema = Joi.object({
  categoryId: objectId.optional(),
  title: optionalString(120),
});

const capturedMomentParamsSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  capturedMomentListQuerySchema,
  createCapturedMomentSchema,
  capturedMomentParamsSchema,
};
