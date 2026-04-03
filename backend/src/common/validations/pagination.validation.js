'use strict';

const { Joi, optionalString, paginationFields } = require('./common.validation');

const paginationQuerySchema = Joi.object({
  ...paginationFields,
});

const pagedSearchQuerySchema = Joi.object({
  ...paginationFields,
  search: optionalString(150),
});

module.exports = {
  paginationQuerySchema,
  pagedSearchQuerySchema,
};
