'use strict';
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const payoutService   = require('./payout.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class PayoutController {
  requestPayout  = asyncHandler(async (req, res) => { sendCreated(res, 'Payout requested.', { payout: await payoutService.requestPayout(req.body, req.user) }); });
  getMyPayouts   = asyncHandler(async (req, res) => { sendSuccess(res, 'Payouts fetched.', await payoutService.getMyPayouts(getId(req.user), req.query)); });
  getAllPayouts   = asyncHandler(async (req, res) => { sendSuccess(res, 'Payouts fetched.', await payoutService.getAllPayouts(req.query)); });
  approvePayout  = asyncHandler(async (req, res) => { sendSuccess(res, 'Payout approved.', { payout: await payoutService.approvePayout(req.params.id, req.user) }); });
  rejectPayout   = asyncHandler(async (req, res) => { sendSuccess(res, 'Payout rejected.', { payout: await payoutService.rejectPayout(req.params.id, req.body.reason, req.user) }); });
}
module.exports = new PayoutController();
