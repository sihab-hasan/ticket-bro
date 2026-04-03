'use strict';

const { Joi, objectId, slug } = require('./common.validation');

const mongoIdParamSchema = (key = 'id') =>
  Joi.object({
    [key]: objectId.required(),
  });

const slugParamSchema = (key = 'slug') =>
  Joi.object({
    [key]: slug.required(),
  });

module.exports = {
  mongoIdParamSchema,
  slugParamSchema,
};
