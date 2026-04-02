'use strict';
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const loyaltyService  = require('./loyalty.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class LoyaltyController {
  getAccount  = asyncHandler(async (req, res) => { sendSuccess(res, 'Account fetched.', { account: await loyaltyService.getAccount(getId(req.user)) }); });
  getHistory  = asyncHandler(async (req, res) => { sendSuccess(res, 'History fetched.', await loyaltyService.getHistory(getId(req.user))); });
  redeemPoints= asyncHandler(async (req, res) => { sendSuccess(res, 'Points redeemed.', await loyaltyService.redeemPoints(getId(req.user), req.body.points)); });
  getTiers    = asyncHandler(async (req, res) => { sendSuccess(res, 'Tiers fetched.', { tiers: await loyaltyService.getTiers() }); });
}
module.exports = new LoyaltyController();
