'use strict';
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const reviewService   = require('./review.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class ReviewController {
  getEventReviews = asyncHandler(async (req, res) => { sendSuccess(res, 'Reviews fetched.', await reviewService.getEventReviews(req.params.slug, req.query)); });
  getReviewSummary= asyncHandler(async (req, res) => { sendSuccess(res, 'Summary fetched.', await reviewService.getReviewSummary(req.params.slug)); });
  createReview    = asyncHandler(async (req, res) => { sendCreated(res, 'Review created.', { review: await reviewService.createReview(req.body, req.user) }); });
  getMyReviews    = asyncHandler(async (req, res) => { sendSuccess(res, 'Reviews fetched.', await reviewService.getMyReviews(getId(req.user), req.query)); });
  updateReview    = asyncHandler(async (req, res) => { sendSuccess(res, 'Review updated.', { review: await reviewService.updateReview(req.params.id, req.body, req.user) }); });
  deleteReview    = asyncHandler(async (req, res) => { sendSuccess(res, 'Review deleted.', await reviewService.deleteReview(req.params.id, req.user)); });
}
module.exports = new ReviewController();
