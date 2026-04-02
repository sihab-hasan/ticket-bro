'use strict';
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const sessionService  = require('./session.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class SessionController {
  getSessions     = asyncHandler(async (req, res) => { sendSuccess(res, 'Sessions fetched.', await sessionService.getSessions(getId(req.user))); });
  revokeSession   = asyncHandler(async (req, res) => { sendSuccess(res, 'Session revoked.', await sessionService.revokeSession(req.params.id, getId(req.user))); });
  revokeAll       = asyncHandler(async (req, res) => { sendSuccess(res, 'All sessions revoked.', await sessionService.revokeAllSessions(getId(req.user))); });
}
module.exports = new SessionController();
