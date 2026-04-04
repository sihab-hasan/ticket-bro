'use strict';
const asyncHandler   = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const paymentService = require('./payment.service');

const getId = (u) => u?._id || u?.id || u?.userId;

class PaymentController {
  createIntent = asyncHandler(async (req, res) => {
    const result = await paymentService.createPaymentIntent({
      bookingRef: req.body.bookingRef,
      userId:     getId(req.user),
      currency:   req.body.currency || 'USD',
    });
    sendCreated(res, 'Payment intent created.', result);
  });

  verifyPayment = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyPayment({
      paymentIntentId: req.body.paymentIntentId,
      bookingRef:      req.body.bookingRef,
      userId:          getId(req.user),
    });
    sendSuccess(res, 'Payment verified.', result);
  });

  getMyPayments = asyncHandler(async (req, res) => {
    const result = await paymentService.getMyPayments(getId(req.user), req.query);
    sendSuccess(res, 'Payments fetched.', result);
  });

  getPaymentById = asyncHandler(async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id, getId(req.user));
    sendSuccess(res, 'Payment fetched.', { payment });
  });

  requestRefund = asyncHandler(async (req, res) => {
    const payment = await paymentService.requestRefund(req.params.id, getId(req.user), req.body.reason);
    sendSuccess(res, 'Refund requested.', { payment });
  });

  getRefundStatus = asyncHandler(async (req, res) => {
    const result = await paymentService.getRefundStatus(req.params.id, getId(req.user));
    sendSuccess(res, 'Refund status.', result);
  });

  getPaymentMethods = asyncHandler(async (req, res) => {
    const result = await paymentService.getPaymentMethods(getId(req.user));
    sendSuccess(res, 'Payment methods.', result);
  });

  removePaymentMethod = asyncHandler(async (req, res) => {
    await paymentService.removePaymentMethod(req.params.id, getId(req.user));
    sendSuccess(res, 'Payment method removed.');
  });
}

module.exports = new PaymentController();
