'use strict';
const reviewRepository = require('./review.repository');
const Event = require('../events/event.model');
const { NotFoundError, ForbiddenError, ConflictError } = require('../../common/errors/AppError');

const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class ReviewService {
  async getReviews(query = {}) {
    return reviewRepository.findPublic(query);
  }

  async getReviewSummary() {
    return reviewRepository.getSummary();
  }

  async getMyReview(userId) {
    return reviewRepository.findActiveByUserId(userId);
  }

  async createReview(data, user) {
    const userId = getId(user);
    const existing = await reviewRepository.findActiveByUserId(userId);

    if (existing) {
      throw new ConflictError('You have already submitted a review.');
    }

    if (data.event) {
      const event = await Event.findOne({ _id: data.event, deletedAt: null })
        .select('_id')
        .lean();

      if (!event) {
        throw new NotFoundError('Event not found.');
      }
    }

    try {
      return await reviewRepository.create({
        event: data.event || undefined,
        rating: data.rating,
        title: data.title,
        body: data.body,
        user: userId,
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictError('You have already submitted a review.');
      }

      throw error;
    }
  }

  async updateReview(id, data, user) {
    const review = await reviewRepository.findOne(id);
    if (!review) throw new NotFoundError('Review not found.');
    if (review.user._id.toString() !== getId(user)) throw new ForbiddenError('Access denied.');

    return reviewRepository.updateById(id, {
      rating: data.rating,
      title: data.title,
      body: data.body,
    });
  }

  async deleteReview(id, user) {
    const deleted = await reviewRepository.deleteById(id, getId(user));
    if (!deleted) throw new NotFoundError('Review not found.');
    return { message: 'Review deleted.' };
  }
}

module.exports = new ReviewService();
