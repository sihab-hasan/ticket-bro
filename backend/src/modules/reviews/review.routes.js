'use strict';
const express = require('express');
const router = express.Router();

const { authenticate } = require('../../common/middleware/auth.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const {
  createReviewSchema,
  reviewIdParamsSchema,
  reviewListQuerySchema,
  updateReviewSchema,
} = require('./review.validation');

let _controller;
const controller = () => {
  if (!_controller) {
    _controller = require('./review.controller');
  }
  return _controller;
};

// Public reads
router.get('/', validateRequest(reviewListQuerySchema, 'query'), (req, res, next) =>
  controller().getReviews(req, res, next));
router.get('/summary', (req, res, next) => controller().getReviewSummary(req, res, next));

// Authenticated user actions
router.post('/', authenticate, validateRequest(createReviewSchema), (req, res, next) =>
  controller().createReview(req, res, next));
router.get('/my', authenticate, (req, res, next) => controller().getMyReview(req, res, next));
router.put('/:id',
  authenticate,
  validateRequest(reviewIdParamsSchema, 'params'),
  validateRequest(updateReviewSchema),
  (req, res, next) => controller().updateReview(req, res, next));
router.delete('/:id',
  authenticate,
  validateRequest(reviewIdParamsSchema, 'params'),
  (req, res, next) => controller().deleteReview(req, res, next));

module.exports = router;
