'use strict';

const asyncHandler = require('../../common/utils/asyncHandler');
const { sendCreated, sendSuccess } = require('../../common/utils/apiResponse');
const capturedMomentService = require('./capturedMoment.service');

class CapturedMomentController {
  listMoments = asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      'Captured moments fetched.',
      await capturedMomentService.listMoments(req.query, req.user),
    );
  });

  createMoments = asyncHandler(async (req, res) => {
    const moments = await capturedMomentService.createMoments(
      req.files,
      req.body,
      req.user,
    );
    sendCreated(res, 'Captured moments uploaded.', { moments });
  });

  toggleReaction = asyncHandler(async (req, res) => {
    const result = await capturedMomentService.toggleReaction(
      req.params.id,
      req.user,
    );
    const message = result?.reaction?.hasReacted
      ? 'Captured moment reaction added.'
      : 'Captured moment reaction removed.';

    sendSuccess(res, message, result);
  });
}

module.exports = new CapturedMomentController();
