'use strict';

const { Joi } = require('../../common/validations/common.validation');

const reverseLocationQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

module.exports = {
  reverseLocationQuerySchema,
};
