'use strict';

jest.mock('../src/modules/reviews/review.model', () => ({
  find: jest.fn(),
  updateMany: jest.fn(),
}));

const Review = require('../src/modules/reviews/review.model');
const { migrateReviewsToAppWide } = require('../src/modules/reviews/review.migration');

const mockFindChain = (rows) => {
  const lean = jest.fn().mockResolvedValue(rows);
  const sort = jest.fn().mockReturnValue({ lean });
  const select = jest.fn().mockReturnValue({ sort });
  Review.find.mockReturnValue({ select });
};

describe('review.migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the latest active review per user and archives older ones', async () => {
    mockFindChain([
      { _id: 'review-new', user: 'user-1', createdAt: new Date('2024-02-01') },
      { _id: 'review-old', user: 'user-1', createdAt: new Date('2024-01-01') },
      { _id: 'review-only', user: 'user-2', createdAt: new Date('2024-03-01') },
    ]);
    Review.updateMany.mockResolvedValue({ modifiedCount: 1 });

    const result = await migrateReviewsToAppWide();

    expect(Review.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['review-old'] }, deletedAt: null },
      { $set: { deletedAt: expect.any(Date), isPublished: false } },
    );
    expect(result).toEqual({
      processed: 3,
      kept: 2,
      archived: 1,
    });
  });

  it('is idempotent when each user already has one active review', async () => {
    mockFindChain([
      { _id: 'review-1', user: 'user-1', createdAt: new Date('2024-02-01') },
      { _id: 'review-2', user: 'user-2', createdAt: new Date('2024-03-01') },
    ]);

    const result = await migrateReviewsToAppWide();

    expect(Review.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual({
      processed: 2,
      kept: 2,
      archived: 0,
    });
  });
});
