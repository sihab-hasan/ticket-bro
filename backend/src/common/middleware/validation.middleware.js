'use strict';

const { BadRequestError } = require('../errors/AppError');

/**
 * Generic Joi validation middleware
 * @param {Object} schema - Joi schema
 * @param {'body'|'query'|'params'} source - Where to validate
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      throw new BadRequestError('Validation failed', errors);
    }

    req[source] = value; // Replace with sanitized value
    next();
  };
};

/**
 * Sanitize request body - remove null/undefined fields
 */
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === null || req.body[key] === undefined) {
        delete req.body[key];
      }
    });
  }
  next();
};

module.exports = { validateRequest, sanitizeBody };
