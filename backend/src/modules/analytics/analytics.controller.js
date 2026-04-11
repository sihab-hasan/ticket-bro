'use strict';
const asyncHandler      = require('../../common/utils/asyncHandler');
const { sendSuccess }   = require('../../common/utils/apiResponse');
const analyticsService  = require('./analytics.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class AnalyticsController {
  getOverview      = asyncHandler(async (req, res) => {
    // Pass optional query parameters (e.g. eventId) to the analytics service
    const userId = getId(req.user);
    const overview = await analyticsService.getOverview(userId, req.query || {});
    sendSuccess(res, 'Overview.', overview);
  });
  getRevenue       = asyncHandler(async (req, res) => { sendSuccess(res, 'Revenue.', await analyticsService.getRevenue(getId(req.user), req.query)); });
  getTicketStats   = asyncHandler(async (req, res) => { sendSuccess(res, 'Ticket stats.', await analyticsService.getTicketStats(getId(req.user), req.query || {})); });
  getEventStats    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event stats.', await analyticsService.getEventStats(getId(req.user), req.query)); });
  getEventAnalytics= asyncHandler(async (req, res) => { sendSuccess(res, 'Event analytics.', await analyticsService.getEventAnalytics(req.params.id, getId(req.user))); });
  getAudience      = asyncHandler(async (req, res) => { sendSuccess(res, 'Audience.', await analyticsService.getAudience(getId(req.user), req.query || {})); });
}
module.exports = new AnalyticsController();
