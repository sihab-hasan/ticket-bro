'use strict';

let stripe = null;

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripe) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  return stripe;
};

const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

const createPaymentIntent = async (params) => {
  const client = getStripeClient();
  if (!client) return null;
  return client.paymentIntents.create(params);
};

const retrievePaymentIntent = async (paymentIntentId) => {
  const client = getStripeClient();
  if (!client) return null;
  return client.paymentIntents.retrieve(paymentIntentId);
};

const refundPaymentIntent = async ({ paymentIntentId, amount, reason = 'requested_by_customer' }) => {
  const client = getStripeClient();
  if (!client) return null;

  const payload = {
    payment_intent: paymentIntentId,
    reason,
  };

  if (amount) {
    payload.amount = Math.round(Number(amount) * 100);
  }

  return client.refunds.create(payload);
};

const constructWebhookEvent = (rawBody, signature, webhookSecret) => {
  const client = getStripeClient();
  if (!client || !webhookSecret) return null;
  return client.webhooks.constructEvent(rawBody, signature, webhookSecret);
};

const detachPaymentMethod = async (methodId) => {
  const client = getStripeClient();
  if (!client) return null;
  return client.paymentMethods.detach(methodId);
};

module.exports = {
  getStripeClient,
  isStripeConfigured,
  createPaymentIntent,
  retrievePaymentIntent,
  refundPaymentIntent,
  constructWebhookEvent,
  detachPaymentMethod,
};
