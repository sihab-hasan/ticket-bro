'use strict';

const express = require('express');
const router = express.Router();

const {
  authenticate,
  optionalAuth,
} = require('../../common/middleware/auth.middleware');
const { cache } = require('../../common/middleware/cache.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const uploadMiddleware = require('../users/upload.middleware');
const capturedMomentController = require('./capturedMoment.controller');
const {
  capturedMomentListQuerySchema,
  createCapturedMomentSchema,
  capturedMomentParamsSchema,
} = require('./capturedMoment.validation');

router.get(
  '/',
  validateRequest(capturedMomentListQuerySchema, 'query'),
  optionalAuth,
  cache('2m'),
  (req, res, next) => capturedMomentController.listMoments(req, res, next),
);

router.post(
  '/',
  authenticate,
  uploadMiddleware.capturedMomentImages,
  validateRequest(createCapturedMomentSchema),
  (req, res, next) => capturedMomentController.createMoments(req, res, next),
);

router.post(
  '/:id/reaction',
  authenticate,
  validateRequest(capturedMomentParamsSchema, 'params'),
  (req, res, next) => capturedMomentController.toggleReaction(req, res, next),
);

module.exports = router;
