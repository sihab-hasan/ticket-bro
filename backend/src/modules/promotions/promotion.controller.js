'use strict';
const asyncHandler       = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const promotionService   = require('./promotion.service');

class PromotionController {
  validateCode    = asyncHandler(async (req, res) => { sendSuccess(res, 'Code validated.', await promotionService.validateCode(req.body.code, req.body)); });
  create          = asyncHandler(async (req, res) => { sendCreated(res, 'Promotion created.', { promotion: await promotionService.create(req.body, req.user) }); });
  getMyPromotions = asyncHandler(async (req, res) => { sendSuccess(res, 'Promotions fetched.', await promotionService.getMyPromotions(req.user, req.query)); });
  update          = asyncHandler(async (req, res) => { sendSuccess(res, 'Updated.', { promotion: await promotionService.update(req.params.id, req.body, req.user) }); });
  remove          = asyncHandler(async (req, res) => { sendSuccess(res, 'Deleted.', await promotionService.remove(req.params.id, req.user)); });
}
module.exports = new PromotionController();
