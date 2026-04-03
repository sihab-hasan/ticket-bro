'use strict';

const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const superAdminService = require('./superadmin.service');

class SuperAdminController {
  getDashboard = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Super admin dashboard fetched.', await superAdminService.getDashboard());
  });

  getAllAdmins = asyncHandler(async (req, res) => {
    sendSuccess(res, 'All admins fetched.', await superAdminService.getAllAdmins(req.query));
  });

  getAllUsers = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Users fetched.', await superAdminService.getAllUsers(req.query));
  });

  assignAdminRole = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Admin role assigned.', await superAdminService.assignAdminRole(req.user, req.params.userId));
  });

  revokeAdminRole = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Admin role revoked.', await superAdminService.revokeAdminRole(req.user, req.params.userId));
  });

  updateUserRole = asyncHandler(async (req, res) => {
    sendSuccess(res, 'User role updated.', await superAdminService.updateUserRole(req.user, req.params.userId, req.body.role));
  });

  getPlatformSettings = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'Platform settings fetched.', await superAdminService.getPlatformSettings());
  });

  updatePlatformSettings = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Platform settings updated.', await superAdminService.updatePlatformSettings(req.body, req.user));
  });

  getFullAuditLog = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Audit logs fetched.', await superAdminService.getFullAuditLog(req.query));
  });

  forceLogoutAll = asyncHandler(async (req, res) => {
    sendSuccess(res, 'All sessions terminated.', await superAdminService.forceLogoutAll(req.user));
  });

  getSystemHealth = asyncHandler(async (_req, res) => {
    sendSuccess(res, 'System health fetched.', await superAdminService.getSystemHealth());
  });
}

module.exports = new SuperAdminController();
