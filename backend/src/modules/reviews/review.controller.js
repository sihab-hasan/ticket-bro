'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const reviewService = require('./review.service');

const getId = (u) => u?._id || u?.id || u?.userId;

class ReviewController {
  getReviews = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Reviews fetched.', await reviewService.getReviews(req.query));
  });

  getReviewSummary = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Summary fetched.', await reviewService.getReviewSummary());
  });

  createReview = asyncHandler(async (req, res) => {
    sendCreated(res, 'Review submitted.', {
      review: await reviewService.createReview(req.body, req.user),
    });
  });

  getMyReview = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Review fetched.', {
      review: await reviewService.getMyReview(getId(req.user)),
    });
  });

  updateReview = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Review updated.', {
      review: await reviewService.updateReview(req.params.id, req.body, req.user),
    });
  });

  deleteReview = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Review deleted.', await reviewService.deleteReview(req.params.id, req.user));
  });
}

module.exports = new ReviewController();
