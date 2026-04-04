'use strict';
const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../common/middleware/validation.middleware');
const {
  addItemSchema,
  updateItemSchema,
  cartItemParamsSchema,
  promoSchema,
  checkoutSchema,
} = require('./cart.validation');
let _c; const c = () => { if (!_c) _c = require('./cart.controller'); return _c; };

router.get('/',                    (req,res,next) => c().getCart(req,res,next));
router.post('/items',              validateRequest(addItemSchema), (req,res,next) => c().addItem(req,res,next));
router.put('/items/:itemId',       validateRequest(cartItemParamsSchema, 'params'), validateRequest(updateItemSchema), (req,res,next) => c().updateItem(req,res,next));
router.delete('/items/:itemId',    validateRequest(cartItemParamsSchema, 'params'), (req,res,next) => c().removeItem(req,res,next));
router.delete('/',                 (req,res,next) => c().clearCart(req,res,next));
router.post('/apply-promo',        validateRequest(promoSchema), (req,res,next) => c().applyPromo(req,res,next));
router.delete('/promo',            (req,res,next) => c().removePromo(req,res,next));
router.post('/checkout',           validateRequest(checkoutSchema), (req,res,next) => c().checkout(req,res,next));
module.exports = router;
