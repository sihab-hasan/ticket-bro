'use strict';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-test'),
}));

jest.mock('../src/modules/reviews/review.model', () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const Review = require('../src/modules/reviews/review.model');
const adminService = require('../src/modules/admins/admin.service');

describe('admin review moderation actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('soft deletes a review so it drops out of active summaries and lists', async () => {
    Review.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'review-1' }),
    });
    Review.findByIdAndUpdate.mockResolvedValue({ _id: 'review-1' });

    const result = await adminService.deleteReview('review-1');

    expect(Review.findOne).toHaveBeenCalledWith({
      _id: 'review-1',
      deletedAt: null,
    });
    expect(Review.findByIdAndUpdate).toHaveBeenCalledWith('review-1', {
      $set: { deletedAt: expect.any(Date), isPublished: false },
    });
    expect(result).toEqual({ id: 'review-1' });
  });

  it('flags a review for moderation without deleting it', async () => {
    Review.findByIdAndUpdate.mockResolvedValue({
      _id: 'review-2',
      reported: true,
    });

    const result = await adminService.flagReview('review-2', true);

    expect(Review.findByIdAndUpdate).toHaveBeenCalledWith(
      'review-2',
      { $set: { reported: true } },
      { new: true },
    );
    expect(result).toMatchObject({ _id: 'review-2', reported: true });
  });
});
