'use strict';
const express = require('express');
const router = express.Router();
let _c; const c = () => { if (!_c) _c = require('./cart.controller'); return _c; };

router.get('/',                    (req,res,next) => c().getCart(req,res,next));
router.post('/items',              (req,res,next) => c().addItem(req,res,next));
router.put('/items/:itemId',       (req,res,next) => c().updateItem(req,res,next));
router.delete('/items/:itemId',    (req,res,next) => c().removeItem(req,res,next));
router.delete('/',                 (req,res,next) => c().clearCart(req,res,next));
router.post('/apply-promo',        (req,res,next) => c().applyPromo(req,res,next));
router.delete('/promo',            (req,res,next) => c().removePromo(req,res,next));
router.post('/checkout',           (req,res,next) => c().checkout(req,res,next));
module.exports = router;
