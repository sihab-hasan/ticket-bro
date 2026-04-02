'use strict';
const paymentRepository = require('./payment.repository');
const bookingService    = require('../bookings/booking.service');
const { NotFoundError, BadRequestError } = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const env    = require('../../config/env');

const getId = (u) => u?.id || u?._id?.toString() || u?.userId;

// ── Stripe helper (graceful fallback if not configured) ─────────────────────
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }
} catch { /* stripe not installed */ }

class PaymentService {

  // Create a Stripe PaymentIntent (or stub if Stripe not configured)
  async createPaymentIntent({ bookingRef, userId, currency = 'USD' }) {
    const booking = await bookingService.getBookingByRef(bookingRef, { _id: userId, role: 'user' });
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.paymentStatus === 'paid') throw new BadRequestError('Booking already paid.');

    const amountCents = Math.round(booking.totalAmount * 100);

    let clientSecret = `pi_stub_${Date.now()}_secret_stub`;
    let gatewayPaymentId = `pi_stub_${Date.now()}`;

    if (stripe) {
      const intent = await stripe.paymentIntents.create({
        amount:   amountCents,
        currency: currency.toLowerCase(),
        metadata: { bookingRef, userId: userId.toString() },
      });
      clientSecret       = intent.client_secret;
      gatewayPaymentId   = intent.id;
    }

    const payment = await paymentRepository.create({
      booking:         booking._id,
      user:            userId,
      event:           booking.event?._id || booking.event,
      amount:          booking.totalAmount,
      currency,
      status:          'pending',
      gateway:         'stripe',
      gatewayPaymentId,
      clientSecret,
    });

    logger.info(`PaymentIntent created: ${gatewayPaymentId} for booking ${bookingRef}`);
    return { clientSecret, paymentId: payment._id, gatewayPaymentId };
  }

  async verifyPayment({ paymentIntentId, bookingRef }) {
    let succeeded = true; // stub default

    if (stripe && paymentIntentId && !paymentIntentId.startsWith('pi_stub')) {
      try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        succeeded = intent.status === 'succeeded';
      } catch (err) {
        logger.error(`Stripe verify failed: ${err.message}`);
        throw new BadRequestError('Payment verification failed.');
      }
    }

    if (succeeded) {
      const payment = await paymentRepository.findByGatewayId(paymentIntentId);
      if (payment) {
        await paymentRepository.updateById(payment._id, { status: 'succeeded', paidAt: new Date() });
      }
      if (bookingRef) {
        await bookingService.confirmBooking(bookingRef);
      }
    }

    return { status: succeeded ? 'succeeded' : 'failed' };
  }

  async getMyPayments(userId, query = {}) {
    return paymentRepository.findByUserId({ userId, ...query });
  }

  async getPaymentById(id, userId) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Payment not found.');
    if (payment.user._id.toString() !== userId.toString()) throw new NotFoundError('Payment not found.');
    return payment;
  }

  async requestRefund(paymentId, userId, reason = '') {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found.');
    if (payment.user._id.toString() !== userId.toString()) throw new NotFoundError('Payment not found.');
    if (payment.status !== 'succeeded') throw new BadRequestError('Only succeeded payments can be refunded.');

    if (stripe && !payment.gatewayPaymentId.startsWith('pi_stub')) {
      await stripe.refunds.create({ payment_intent: payment.gatewayPaymentId, reason: 'requested_by_customer' });
    }

    const updated = await paymentRepository.updateById(paymentId, {
      status: 'refunded', refundReason: reason, refundedAt: new Date(),
    });
    logger.info(`Refund processed: payment ${paymentId} by user ${userId}`);
    return updated;
  }

  async getPaymentMethods(userId) {
    // In real implementation, list Stripe customer payment methods
    return { methods: [] };
  }

  async removePaymentMethod(methodId, userId) {
    if (stripe) {
      await stripe.paymentMethods.detach(methodId);
    }
    return { message: 'Payment method removed.' };
  }

  async getRefundStatus(paymentId, userId) {
    const payment = await this.getPaymentById(paymentId, userId);
    return { status: payment.status, refundedAt: payment.refundedAt, refundAmount: payment.refundAmount };
  }

  async handleStripeWebhook(rawBody, signature) {
    if (!stripe) return { received: true };
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return { received: true };

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestError(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await this.verifyPayment({ paymentIntentId: intent.id, bookingRef: intent.metadata?.bookingRef });
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const payment = await paymentRepository.findByGatewayId(intent.id);
        if (payment) await paymentRepository.updateById(payment._id, { status: 'failed', failureMessage: intent.last_payment_error?.message });
        break;
      }
    }

    return { received: true };
  }
}

module.exports = new PaymentService();
