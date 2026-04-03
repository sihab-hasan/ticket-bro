'use strict';

const User = require('../users/user.model');
const AuditLog = require('../auditLogs/audit.model');
const RefreshToken = require('../../infrastructure/tokens/tokens');
const userService = require('../users/user.service');
const adminService = require('../admins/admin.service');
const { ROLES } = require('../../common/constants/roles');
const { NotFoundError } = require('../../common/errors/AppError');

class SuperAdminService {
  async getDashboard() {
    const [admins, moderators, auditEvents, activeSessions, systemHealth] = await Promise.all([
      User.countDocuments({ deletedAt: null, role: ROLES.ADMIN }),
      User.countDocuments({ deletedAt: null, role: ROLES.MODERATOR }),
      AuditLog.countDocuments(),
      RefreshToken.countDocuments({ isRevoked: false, expiresAt: { $gt: new Date() } }),
      adminService.getSystemHealth(),
    ]);

    return {
      admins,
      moderators,
      auditEvents,
      activeSessions,
      systemHealth,
    };
  }

  async getAllAdmins({ page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { deletedAt: null, role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } };
    const [admins, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email role status lastLoginAt createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      admins,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getAllUsers(query = {}) {
    return userService.getAllUsers(query);
  }

  async assignAdminRole(superAdmin, targetUserId) {
    return userService.changeRole(targetUserId, ROLES.ADMIN, superAdmin);
  }

  async revokeAdminRole(superAdmin, targetUserId) {
    const target = await User.findOne({ _id: targetUserId, deletedAt: null }).lean();
    if (!target) throw new NotFoundError('User not found.');

    const nextRole = target.role === ROLES.SUPER_ADMIN ? ROLES.SUPER_ADMIN : ROLES.USER;
    return userService.changeRole(targetUserId, nextRole, superAdmin);
  }

  async updateUserRole(superAdmin, targetUserId, role) {
    return userService.changeRole(targetUserId, role, superAdmin);
  }

  async getPlatformSettings() {
    return adminService.getSystemSettings();
  }

  async updatePlatformSettings(data, superAdmin) {
    return adminService.updateSystemSettings(data, superAdmin);
  }

  async getFullAuditLog(query = {}) {
    return adminService.getAuditLogs(query);
  }

  async forceLogoutAll(superAdmin) {
    await RefreshToken.updateMany(
      { isRevoked: false, expiresAt: { $gt: new Date() } },
      { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: 'security' } },
    );

    await AuditLog.create({
      userId: superAdmin._id,
      userEmail: superAdmin.email,
      userRole: superAdmin.role,
      action: 'system.force_logout_all',
      resource: 'session',
      metadata: {
        initiatedBy: superAdmin._id?.toString(),
      },
    });

    return { cleared: true };
  }

  async getSystemHealth() {
    return adminService.getSystemHealth();
  }
}

module.exports = new SuperAdminService();
