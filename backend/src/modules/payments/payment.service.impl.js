'use strict';

const paymentRepository = require('./payment.repository');
const bookingRepository = require('../bookings/booking.repository');
const bookingService = require('../bookings/booking.service');
const {
  NotFoundError,
  BadRequestError,
} = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const emailService = require('../../infrastructure/mail/emailService');
const {
  formatDateTime,
  buildFrontendUrl,
  getPaymentMethodLabel,
  getUserFirstName,
} = require('../../infrastructure/mail/templateData');
const { getRefundSummary } = require('../bookings/booking.policy');
const {
  isStripeConfigured,
  createPaymentIntent: createStripePaymentIntent,
  retrievePaymentIntent,
  constructWebhookEvent,
  detachPaymentMethod,
} = require('./gateways/stripe.gateway');

const getId = (value) =>
  value?.id ||
  value?._id?.toString?.() ||
  value?.userId ||
  value?.user?._id?.toString?.();

const normalizeBookingStatus = (status) =>
  status === 'expired' ? 'cancelled' : status;

const normalizePaymentStatus = (status) => {
  if (status === 'paid' || status === 'succeeded') return 'succeeded';
  if (status === 'cancelled') return 'failed';
  return status || 'pending';
};

const isStubPaymentIntent = (paymentIntentId) =>
  String(paymentIntentId || '').startsWith('pi_stub_');

class PaymentService {
  async createPaymentIntent({ bookingRef, userId, currency = 'USD' }) {
    const booking = await bookingService.getBookingByRefRaw(bookingRef, {
      _id: userId,
      role: 'user',
    });

    if (booking.status !== 'pending') {
      throw new BadRequestError('Only pending bookings can be paid.');
    }

    if (booking.paymentStatus === 'paid') {
      throw new BadRequestError('Booking already paid.');
    }

    if (booking.paymentStatus === 'refunded') {
      throw new BadRequestError('Booking has already been refunded.');
    }

    const existingPendingPayment = await paymentRepository.findPendingByBookingId(booking._id);
    if (
      existingPendingPayment?.clientSecret &&
      existingPendingPayment?.gatewayPaymentId &&
      !this._isExpired(existingPendingPayment.expiresAt)
    ) {
      await bookingRepository.updateById(booking._id, {
        payment: existingPendingPayment._id,
        paymentStatus: 'pending',
      });

      return {
        clientSecret: existingPendingPayment.clientSecret,
        paymentId: existingPendingPayment._id,
        gatewayPaymentId: existingPendingPayment.gatewayPaymentId,
        bookingRef: booking.bookingRef,
        amount: booking.totalAmount,
        currency: booking.currency || currency.toUpperCase(),
      };
    }

    const amount = Number(booking.totalAmount || 0);
    const amountCents = Math.round(amount * 100);

    if (amountCents <= 0) {
      throw new BadRequestError('Booking total must be greater than zero.');
    }

    const normalizedCurrency = String(booking.currency || currency || 'USD').toUpperCase();
    let gatewayPaymentId = `pi_stub_${Date.now()}`;
    let clientSecret = `${gatewayPaymentId}_secret_stub`;

    if (isStripeConfigured()) {
      const intent = await createStripePaymentIntent({
        amount: amountCents,
        currency: normalizedCurrency.toLowerCase(),
        metadata: {
          bookingRef: booking.bookingRef,
          userId: String(userId),
        },
      });

      gatewayPaymentId = intent.id;
      clientSecret = intent.client_secret;
    }

    const payload = {
      booking: booking._id,
      user: getId(booking.user) || userId,
      event: booking.event?._id || booking.event,
      amount,
      currency: normalizedCurrency,
      status: 'pending',
      gateway: 'stripe',
      gatewayPaymentId,
      clientSecret,
      expiresAt: booking.expiresAt || null,
      paymentMethod: { type: 'card' },
    };

    const payment = existingPendingPayment
      ? await paymentRepository.updateById(existingPendingPayment._id, payload)
      : await paymentRepository.create(payload);

    await bookingRepository.updateById(booking._id, {
      payment: payment._id,
      paymentStatus: 'pending',
    });

    logger.info(`Payment intent created: ${gatewayPaymentId} for booking ${bookingRef}`);

    return {
      clientSecret,
      paymentId: payment._id,
      gatewayPaymentId,
      bookingRef: booking.bookingRef,
      amount: payment.amount,
      currency: payment.currency,
    };
  }

  async verifyPayment({ paymentIntentId, bookingRef, userId = null }) {
    if (!paymentIntentId) {
      throw new BadRequestError('Payment intent id is required.');
    }

    const payment = await paymentRepository.findByGatewayId(paymentIntentId);
    if (!payment) {
      throw new NotFoundError('Payment not found.');
    }

    if (userId && getId(payment.user) !== userId.toString()) {
      throw new NotFoundError('Payment not found.');
    }

    const expectedBookingRef = bookingRef || payment.booking?.bookingRef;
    if (!expectedBookingRef) {
      throw new BadRequestError('Booking reference is required.');
    }

    if (bookingRef && payment.booking?.bookingRef && payment.booking.bookingRef !== bookingRef) {
      throw new BadRequestError('Payment does not match the provided booking.');
    }

    const actor = userId ? { _id: userId, role: 'user' } : { role: 'admin' };
    const booking = await bookingService.getBookingByRefRaw(expectedBookingRef, actor);

    if (
      payment.booking?._id &&
      String(payment.booking._id) !== String(booking._id)
    ) {
      throw new BadRequestError('Payment does not match the provided booking.');
    }

    if (booking.status === 'expired') {
      throw new BadRequestError('Booking has expired.');
    }

    let intent = {
      id: paymentIntentId,
      status: 'succeeded',
      metadata: {
        bookingRef: expectedBookingRef,
        userId: userId ? String(userId) : undefined,
      },
    };

    if (!isStubPaymentIntent(paymentIntentId)) {
      intent = await retrievePaymentIntent(paymentIntentId);
      if (!intent) {
        throw new BadRequestError('Stripe is not configured for payment verification.');
      }
    }

    if (intent.metadata?.bookingRef && intent.metadata.bookingRef !== expectedBookingRef) {
      throw new BadRequestError('Payment intent metadata does not match the booking reference.');
    }

    if (userId && intent.metadata?.userId && intent.metadata.userId !== String(userId)) {
      throw new BadRequestError('Payment intent metadata does not match the authenticated user.');
    }

    if (intent.status === 'succeeded') {
      const wasAlreadySucceeded = payment.status === 'succeeded';
      const bookingAlreadyPaid = booking.paymentStatus === 'paid';

      if (!wasAlreadySucceeded) {
        await paymentRepository.updateById(payment._id, {
          status: 'succeeded',
          paidAt: payment.paidAt || new Date(),
          paymentMethod: this._extractPaymentMethod(intent, payment),
          failureCode: null,
          failureMessage: null,
        });
      }

      const confirmedBooking = bookingAlreadyPaid
        ? await bookingService.getBookingByRef(expectedBookingRef, actor)
        : await bookingService.confirmBooking(expectedBookingRef, payment._id);

      if (!wasAlreadySucceeded) {
        const confirmedPayment = await paymentRepository.findById(payment._id);
        await this._sendPaymentReceiptEmail(confirmedPayment, confirmedBooking);
      }

      return {
        status: 'succeeded',
        bookingRef: expectedBookingRef,
        paymentId: payment._id,
        payment: this._formatPayment(await paymentRepository.findById(payment._id)),
      };
    }

    if (this._isFailedIntentStatus(intent.status)) {
      const failedPayment = await this._markPaymentFailed(
        payment,
        expectedBookingRef,
        intent.last_payment_error?.message || 'Payment failed.',
      );

      return {
        status: 'failed',
        bookingRef: expectedBookingRef,
        paymentId: payment._id,
        payment: this._formatPayment(failedPayment),
      };
    }

    return {
      status: 'pending',
      bookingRef: expectedBookingRef,
      paymentId: payment._id,
      payment: this._formatPayment(payment),
    };
  }

  async getMyPayments(userId, query = {}) {
    const result = await paymentRepository.findByUserId({ userId, ...query });
    return {
      ...result,
      payments: (result.payments || []).map((payment) => this._formatPayment(payment)),
    };
  }

  async getPaymentById(id, userId) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Payment not found.');
    if (getId(payment.user) !== userId.toString()) throw new NotFoundError('Payment not found.');
    return this._formatPayment(payment);
  }

  async requestRefund(paymentId, userId, reason = '') {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found.');
    if (getId(payment.user) !== userId.toString()) throw new NotFoundError('Payment not found.');

    if (!payment.booking?.bookingRef) {
      throw new BadRequestError('Payment is not linked to a booking.');
    }

    await bookingService.refundBooking(
      payment.booking.bookingRef,
      { _id: userId, role: 'user' },
      reason,
    );

    const refreshedPayment = await paymentRepository.findById(paymentId);
    logger.info(`Refund processed: payment ${paymentId} by user ${userId}`);
    return this._formatPayment(refreshedPayment);
  }

  async getPaymentMethods() {
    return { methods: [] };
  }

  async removePaymentMethod(methodId) {
    await detachPaymentMethod(methodId);
    return { message: 'Payment method removed.' };
  }

  async getRefundStatus(paymentId, userId) {
    const payment = await this.getPaymentById(paymentId, userId);
    return {
      status: payment.status,
      refundedAt: payment.refundedAt,
      refundAmount: payment.refundAmount,
    };
  }

  async handleStripeWebhook(rawBody, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !isStripeConfigured()) {
      return { received: true };
    }

    let event;
    try {
      event = constructWebhookEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      throw new BadRequestError(`Webhook signature verification failed: ${error.message}`);
    }

    if (!event) {
      return { received: true };
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await this.verifyPayment({
          paymentIntentId: intent.id,
          bookingRef: intent.metadata?.bookingRef,
        });
        break;
      }
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const intent = event.data.object;
        const payment = await paymentRepository.findByGatewayId(intent.id);
        if (payment) {
          await this._markPaymentFailed(
            payment,
            intent.metadata?.bookingRef || payment.booking?.bookingRef,
            intent.last_payment_error?.message || 'Payment failed.',
          );
        }
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  _formatPayment(payment) {
    if (!payment) return payment;

    const source = payment.toObject ? payment.toObject({ virtuals: true }) : { ...payment };
    const bookingTicketCount =
      source.booking?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

    const event = source.event
      ? {
          ...source.event,
          venue: source.event.venue || source.event.location || null,
        }
      : null;

    const booking = source.booking
      ? {
          ...source.booking,
          status: normalizeBookingStatus(source.booking.status),
          rawStatus: source.booking.status,
          paymentStatus: normalizePaymentStatus(source.booking.paymentStatus),
          event,
          quantity: bookingTicketCount,
          ticketCount: bookingTicketCount,
          refundSummary: getRefundSummary({
            ...source.booking,
            event,
          }),
        }
      : null;

    return {
      ...source,
      status: normalizePaymentStatus(source.status),
      rawStatus: source.status,
      paymentMethod: source.paymentMethod?.type || source.gateway || 'stripe',
      gatewayTransactionId: source.gatewayPaymentId || null,
      event,
      booking,
      quantity: bookingTicketCount,
      ticketCount: bookingTicketCount,
      bookingRef: source.booking?.bookingRef || null,
    };
  }

  async _markPaymentFailed(payment, bookingRef, failureMessage = 'Payment failed.') {
    const updatedPayment = await paymentRepository.updateById(payment._id, {
      status: 'failed',
      failureMessage,
      failureCode: payment.failureCode || null,
    });

    if (bookingRef) {
      await bookingService.expirePendingBooking(bookingRef, failureMessage);
    }

    return paymentRepository.findById(updatedPayment._id);
  }

  _extractPaymentMethod(intent, payment) {
    const card = intent?.charges?.data?.[0]?.payment_method_details?.card;

    return {
      type: payment?.paymentMethod?.type || 'card',
      brand: card?.brand || payment?.paymentMethod?.brand,
      last4: card?.last4 || payment?.paymentMethod?.last4,
      expMonth: card?.exp_month || payment?.paymentMethod?.expMonth,
      expYear: card?.exp_year || payment?.paymentMethod?.expYear,
    };
  }

  _isExpired(date) {
    return date ? new Date(date).getTime() < Date.now() : false;
  }

  _isFailedIntentStatus(status) {
    return ['canceled', 'requires_payment_method'].includes(status);
  }

  async _sendPaymentReceiptEmail(payment, booking) {
    if (!payment?.user?.email) {
      return;
    }

    await emailService.sendPaymentReceiptEmail({
      to: payment.user.email,
      firstName: getUserFirstName(payment.user),
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: getPaymentMethodLabel(payment),
      paymentDate: formatDateTime(payment.paidAt || new Date()),
      receiptNumber: payment.gatewayPaymentId || payment._id?.toString?.(),
      bookingRef: booking?.bookingRef || payment.booking?.bookingRef,
      receiptUrl: buildFrontendUrl('/payments/history'),
    });
  }
}

module.exports = new PaymentService();
