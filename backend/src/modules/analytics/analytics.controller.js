'use strict';
const asyncHandler      = require('../../common/utils/asyncHandler');
const { sendSuccess }   = require('../../common/utils/apiResponse');
const analyticsService  = require('./analytics.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class AnalyticsController {
  getOverview      = asyncHandler(async (req, res) => { sendSuccess(res, 'Overview.', await analyticsService.getOverview(getId(req.user))); });
  getRevenue       = asyncHandler(async (req, res) => { sendSuccess(res, 'Revenue.', await analyticsService.getRevenue(getId(req.user), req.query)); });
  getTicketStats   = asyncHandler(async (req, res) => { sendSuccess(res, 'Ticket stats.', await analyticsService.getTicketStats(getId(req.user))); });
  getEventStats    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event stats.', await analyticsService.getEventStats(getId(req.user), req.query)); });
  getEventAnalytics= asyncHandler(async (req, res) => { sendSuccess(res, 'Event analytics.', await analyticsService.getEventAnalytics(req.params.id, getId(req.user))); });
  getAudience      = asyncHandler(async (req, res) => { sendSuccess(res, 'Audience.', await analyticsService.getAudience(getId(req.user))); });
}
module.exports = new AnalyticsController();
