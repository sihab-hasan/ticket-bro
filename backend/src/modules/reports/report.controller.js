'use strict';
const asyncHandler    = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const reportService   = require('./report.service');

class ReportController {
  createReport  = asyncHandler(async (req, res) => { sendCreated(res, 'Report submitted.', { report: await reportService.createReport(req.body, req.user) }); });
  getReports    = asyncHandler(async (req, res) => { sendSuccess(res, 'Reports fetched.', await reportService.getReports(req.query)); });
  resolveReport = asyncHandler(async (req, res) => { sendSuccess(res, 'Report resolved.', { report: await reportService.resolveReport(req.params.id, req.body, req.user) }); });
}
module.exports = new ReportController();
