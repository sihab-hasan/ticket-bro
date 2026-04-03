'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const adminService = require('../admins/admin.service');
class AuditController {
  getLogs = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Audit logs fetched.', await adminService.getAuditLogs(req.query));
  });

  getById = asyncHandler(async (req, res) => {
    const result = await adminService.getAuditLogs({ ...req.query, limit: 200 });
    const log = result.logs.find((entry) => entry._id?.toString() === req.params.id);
    sendSuccess(res, 'Log fetched.', log || null);
  });

  getByUser = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User logs fetched.', await adminService.getAuditLogs({ ...req.query, userId: req.params.userId }));
  });
}
module.exports = new AuditController();
