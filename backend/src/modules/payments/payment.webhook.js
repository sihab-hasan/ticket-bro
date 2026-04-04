'use strict';
const express = require('express');
const router  = express.Router();
const asyncHandler   = require('../../common/utils/asyncHandler');
const paymentService = require('./payment.service.impl');
const logger = require('../../infrastructure/logger/logger');

// Raw body is already set in app.js for /webhooks prefix
router.post('/stripe', asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const result = await paymentService.handleStripeWebhook(req.body, sig);
  res.json(result);
}));

module.exports = router;
