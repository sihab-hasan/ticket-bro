'use strict';
const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../common/middleware/validation.middleware');
const {
  createPaymentIntentSchema,
  verifyPaymentSchema,
  refundRequestSchema,
  paymentsQuerySchema,
  paymentIdParamsSchema,
  paymentMethodParamsSchema,
} = require('./payment.validation');
let _c; const c = () => { if (!_c) _c = require('./payment.controller'); return _c; };

router.post('/intent',             validateRequest(createPaymentIntentSchema), (req,res,next) => c().createIntent(req,res,next));
router.post('/verify',             validateRequest(verifyPaymentSchema), (req,res,next) => c().verifyPayment(req,res,next));
router.get('/',                    validateRequest(paymentsQuerySchema, 'query'), (req,res,next) => c().getMyPayments(req,res,next));
router.get('/methods',             (req,res,next) => c().getPaymentMethods(req,res,next));
router.delete('/methods/:id',      validateRequest(paymentMethodParamsSchema, 'params'), (req,res,next) => c().removePaymentMethod(req,res,next));
router.get('/:id',                 validateRequest(paymentIdParamsSchema, 'params'), (req,res,next) => c().getPaymentById(req,res,next));
router.post('/:id/refund',         validateRequest(paymentIdParamsSchema, 'params'), validateRequest(refundRequestSchema), (req,res,next) => c().requestRefund(req,res,next));
router.get('/:id/refund',          validateRequest(paymentIdParamsSchema, 'params'), (req,res,next) => c().getRefundStatus(req,res,next));
module.exports = router;
