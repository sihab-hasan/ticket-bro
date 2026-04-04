'use strict';

const Review = require('./review.model');

async function migrateReviewsToAppWide() {
  const activeReviews = await Review.find({ deletedAt: null })
    .select('_id user createdAt')
    .sort({ user: 1, createdAt: -1, _id: -1 })
    .lean();

  const seenUsers = new Set();
  const archiveIds = [];

  for (const review of activeReviews) {
    const userId = String(review.user);
    if (seenUsers.has(userId)) {
      archiveIds.push(review._id);
      continue;
    }

    seenUsers.add(userId);
  }

  if (archiveIds.length) {
    await Review.updateMany(
      { _id: { $in: archiveIds }, deletedAt: null },
      { $set: { deletedAt: new Date(), isPublished: false } },
    );
  }

  return {
    processed: activeReviews.length,
    kept: seenUsers.size,
    archived: archiveIds.length,
  };
}

module.exports = { migrateReviewsToAppWide };
