'use strict';
const flags = {
  enableReviews:        process.env.FF_REVIEWS        !== 'false',
  enableLoyalty:        process.env.FF_LOYALTY        !== 'false',
  enableMessaging:      process.env.FF_MESSAGING      !== 'false',
  enablePayouts:        process.env.FF_PAYOUTS        !== 'false',
  enablePushNotifications: process.env.FF_PUSH_NOTIF !== 'false',
  enableWaitlist:       process.env.FF_WAITLIST       === 'true',
  enablePromotion:      process.env.FF_PROMOTIONS     !== 'false',
};
module.exports = flags;
