'use strict';

const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const moderatorService = require('./moderator.service');

class ModeratorController {
  getDashboard = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Moderator dashboard fetched.', await moderatorService.getDashboard());
  });

  getUsers = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Moderated users fetched.', await moderatorService.getUsers(req.query));
  });

  suspendUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User suspended.', await moderatorService.suspendUser(req.user, req.params.userId, req.body.reason));
  });

  unsuspendUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User unsuspended.', await moderatorService.unsuspendUser(req.user, req.params.userId));
  });

  warnUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User warned.', await moderatorService.warnUser(req.user, req.params.userId, req.body.warning));
  });

  getReportsQueue = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Reports queue fetched.', await moderatorService.getReportsQueue(req.query));
  });

  resolveReport = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Report resolved.', await moderatorService.resolveReport(req.user, req.params.reportId, req.body));
  });

  getPendingEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Pending events fetched.', await moderatorService.getPendingEvents(req.query));
  });

  approveEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event approved.', await moderatorService.approveEvent(req.user, req.params.eventId));
  });

  rejectEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event rejected.', await moderatorService.rejectEvent(req.user, req.params.eventId, req.body.reason));
  });
}

module.exports = new ModeratorController();
