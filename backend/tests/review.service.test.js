'use strict';

jest.mock('../src/modules/reviews/review.repository', () => ({
  findActiveByUserId: jest.fn(),
  create: jest.fn(),
  getSummary: jest.fn(),
}));

const reviewRepository = require('../src/modules/reviews/review.repository');
const reviewService = require('../src/modules/reviews/review.service');
const { ConflictError } = require('../src/common/errors/AppError');

describe('review.service.createReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the first app-wide review for a user', async () => {
    reviewRepository.findActiveByUserId.mockResolvedValue(null);
    reviewRepository.create.mockResolvedValue({
      _id: 'review-1',
      user: 'user-1',
      rating: 5,
      title: 'Great app',
      body: 'Easy to use.',
    });

    const result = await reviewService.createReview(
      { rating: 5, title: 'Great app', body: 'Easy to use.' },
      { _id: 'user-1' },
    );

    expect(reviewRepository.findActiveByUserId).toHaveBeenCalledWith('user-1');
    expect(reviewRepository.create).toHaveBeenCalledWith({
      rating: 5,
      title: 'Great app',
      body: 'Easy to use.',
      user: 'user-1',
    });
    expect(result).toMatchObject({
      _id: 'review-1',
      user: 'user-1',
      rating: 5,
    });
  });

  it('rejects a second active review for the same user', async () => {
    reviewRepository.findActiveByUserId.mockResolvedValue({
      _id: 'existing-review',
      user: 'user-1',
    });

    await expect(
      reviewService.createReview(
        { rating: 4, title: 'Again', body: 'Second review.' },
        { _id: 'user-1' },
      ),
    ).rejects.toBeInstanceOf(ConflictError);

    await reviewService
      .createReview(
        { rating: 4, title: 'Again', body: 'Second review.' },
        { _id: 'user-1' },
      )
      .catch((error) => {
        expect(error.message).toBe('You have already submitted a review.');
      });

    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it('maps duplicate key errors to a friendly conflict response', async () => {
    reviewRepository.findActiveByUserId.mockResolvedValue(null);
    reviewRepository.create.mockRejectedValue({ code: 11000 });

    await expect(
      reviewService.createReview(
        { rating: 4, title: 'Race condition', body: 'Second submit.' },
        { _id: 'user-1' },
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
