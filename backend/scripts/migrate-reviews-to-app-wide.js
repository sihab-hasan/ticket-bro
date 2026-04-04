'use strict';

const { connectDB, disconnectDB } = require('../src/config/db.config');
const Review = require('../src/modules/reviews/review.model');
const { migrateReviewsToAppWide } = require('../src/modules/reviews/review.migration');

const run = async () => {
  try {
    await connectDB();
    const result = await migrateReviewsToAppWide();
    await Review.syncIndexes();
    console.log('App-wide review migration complete.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('App-wide review migration failed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
