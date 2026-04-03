'use strict';
const reviewRepository = require('./review.repository');
const { NotFoundError, ForbiddenError, ConflictError } = require('../../common/errors/AppError');
const Event = require('../events/event.model');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class ReviewService {
  async getEventReviews(eventSlug, query={}) {
    const event = await Event.findOne({ slug: eventSlug, deletedAt: null }).select('_id').lean();
    if (!event) throw new NotFoundError('Event not found.');
    return reviewRepository.findByEventId({ eventId: event._id, ...query });
  }
  async getReviewSummary(eventSlug) {
    const event = await Event.findOne({ slug: eventSlug, deletedAt: null }).select('_id').lean();
    if (!event) throw new NotFoundError('Event not found.');
    return { summary: await reviewRepository.getSummary(event._id), eventSlug };
  }
  async createReview(data, user) {
    const existing = await reviewRepository.findByUserAndEvent(getId(user), data.eventId);
    if (existing) throw new ConflictError('You have already reviewed this event.');
    return reviewRepository.create({ ...data, event: data.eventId, user: getId(user) });
  }
  async getMyReviews(userId, query={}) {
    return reviewRepository.findByUserId({ userId, ...query });
  }
  async updateReview(id, data, user) {
    const review = await reviewRepository.findOne(id);
    if (!review) throw new NotFoundError('Review not found.');
    if (review.user._id.toString() !== getId(user)) throw new ForbiddenError('Access denied.');
    return reviewRepository.updateById(id, data);
  }
  async deleteReview(id, user) {
    const deleted = await reviewRepository.deleteById(id, getId(user));
    if (!deleted) throw new NotFoundError('Review not found.');
    return { message: 'Review deleted.' };
  }
}
module.exports = new ReviewService();
