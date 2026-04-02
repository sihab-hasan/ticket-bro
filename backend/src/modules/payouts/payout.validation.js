'use strict';
const Joi = require('joi');
const { validateRequest } = require('../../common/middleware/validation.middleware');

// Placeholder validation schemas — extend as needed
const redeemSchema = Joi.object({ points: Joi.number().positive().required() });
const requestPayoutSchema = Joi.object({ amount: Joi.number().positive().required(), bankAccountId: Joi.string().required() });

module.exports = {
  validateRedeem: validateRequest(redeemSchema),
  validateRequestPayout: validateRequest(requestPayoutSchema),
};
