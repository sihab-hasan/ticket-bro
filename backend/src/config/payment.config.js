'use strict';
module.exports = {
  stripe: {
    secretKey:     process.env.STRIPE_SECRET_KEY    || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET|| '',
    isConfigured:  () => !!process.env.STRIPE_SECRET_KEY,
  },
  paypal: {
    clientId:     process.env.PAYPAL_CLIENT_ID     || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode:         process.env.PAYPAL_MODE          || 'sandbox',
    isConfigured: () => !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  },
};
