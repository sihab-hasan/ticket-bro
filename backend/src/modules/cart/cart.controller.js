'use strict';
const asyncHandler  = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const cartService   = require('./cart.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class CartController {
  getCart    = asyncHandler(async (req, res) => { sendSuccess(res, 'Cart fetched.', { cart: await cartService.getCart(getId(req.user)) }); });
  addItem    = asyncHandler(async (req, res) => { sendSuccess(res, 'Item added.', { cart: await cartService.addItem(getId(req.user), req.body) }); });
  updateItem = asyncHandler(async (req, res) => { sendSuccess(res, 'Item updated.', { cart: await cartService.updateItem(getId(req.user), req.params.itemId, req.body) }); });
  removeItem = asyncHandler(async (req, res) => { sendSuccess(res, 'Item removed.', { cart: await cartService.removeItem(getId(req.user), req.params.itemId) }); });
  clearCart  = asyncHandler(async (req, res) => { sendSuccess(res, 'Cart cleared.', await cartService.clearCart(getId(req.user))); });
  applyPromo = asyncHandler(async (req, res) => { sendSuccess(res, 'Promo applied.', { cart: await cartService.applyPromo(getId(req.user), req.body.code) }); });
  removePromo= asyncHandler(async (req, res) => { sendSuccess(res, 'Promo removed.', { cart: await cartService.removePromo(getId(req.user)) }); });
  checkout   = asyncHandler(async (req, res) => { sendSuccess(res, 'Ready for checkout.', await cartService.checkout(getId(req.user))); });
}
module.exports = new CartController();
