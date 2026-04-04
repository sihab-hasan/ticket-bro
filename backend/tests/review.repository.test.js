'use strict';

jest.mock('../src/modules/reviews/review.model', () => ({
  aggregate: jest.fn(),
}));

const Review = require('../src/modules/reviews/review.model');
const reviewRepository = require('../src/modules/reviews/review.repository');

describe('review.repository.getSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates only published, non-deleted reviews into the app summary', async () => {
    Review.aggregate.mockResolvedValue([
      {
        average: 4.25,
        count: 4,
        r1: 0,
        r2: 1,
        r3: 0,
        r4: 1,
        r5: 2,
      },
    ]);

    const result = await reviewRepository.getSummary();

    expect(Review.aggregate).toHaveBeenCalledWith([
      { $match: { isPublished: true, deletedAt: null } },
      expect.any(Object),
    ]);
    expect(result).toEqual({
      averageRating: 4.3,
      totalReviews: 4,
      ratingDistribution: [
        { rating: 5, count: 2 },
        { rating: 4, count: 1 },
        { rating: 3, count: 0 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 },
      ],
    });
  });

  it('returns zeroed summary data when no active reviews exist', async () => {
    Review.aggregate.mockResolvedValue([]);

    const result = await reviewRepository.getSummary();

    expect(result).toEqual({
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
    });
  });
});
