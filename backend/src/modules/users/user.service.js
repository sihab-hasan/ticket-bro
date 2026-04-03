'use strict';

const userRepository = require('./user.repository');
const avatarService = require('./avatar.service');
const fs = require('fs');
const AuditLog = require('../auditLogs/audit.model');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../../common/errors/AppError');
const {
  ROLES,
  normalizeRole,
} = require('../../common/constants/roles');

const getId = (user) => user?.id || user?._id || user?.userId;
const isPrivilegedRole = (role) => [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(normalizeRole(role));
const validRoles = Object.values(ROLES);

class UserService {
  _toSafeUser(user) {
    return user?.toSafeObject ? user.toSafeObject() : user?.toObject?.() || user;
  }

  async _writeAuditLog({
    actor,
    action,
    resource = 'user',
    resourceId,
    changes,
    metadata,
  }) {
    if (!actor) {
      return;
    }

    await AuditLog.create({
      userId: getId(actor),
      userEmail: actor.email,
      userRole: actor.role,
      action,
      resource,
      resourceId: resourceId?.toString(),
      changes,
      metadata,
    });
  }

  async getUserById(id, options = {}) {
    const user = options.includeInactive
      ? await userRepository.findById(id)
      : await userRepository.findActiveById(id);

    if (!user) throw new NotFoundError('User not found.');
    return this._toSafeUser(user);
  }

  async updateUser(id, data) {
    const {
      role, isActive, isEmailVerified, deletedAt, password,
      status, statusReason, statusUpdatedAt, statusUpdatedBy,
      googleId, facebookId, oauthProvider, loginAttempts, lockUntil,
      emailVerificationToken, passwordResetToken, ...safe
    } = data;
    const user = await userRepository.updateById(id, safe);
    if (!user) throw new NotFoundError('User not found.');
    return this._toSafeUser(user);
  }

  async deactivateUser(id) {
    const user = await userRepository.softDeleteById(id);
    if (!user) throw new NotFoundError('User not found.');
    return user;
  }

  async updateAvatar(id, file) {
    if (!file) throw new BadRequestError('No file uploaded.');
    if (!file.path) throw new BadRequestError('File path missing — check multer disk storage config.');
    try {
      avatarService.validateFile(file);
      const existing = await userRepository.findById(id, 'avatar');
      const filename = avatarService.generateFilename(id, file.originalname);
      await avatarService.processAndSave(file, filename);
      const avatarUrl = avatarService.getAvatarUrl(filename);
      if (existing?.avatar) await avatarService.deleteOldAvatar(existing.avatar);
      const user = await userRepository.updateById(id, { avatar: avatarUrl });
      if (!user) throw new NotFoundError('User not found.');
      return this._toSafeUser(user);
    } catch (error) {
      if (file?.path) fs.unlink(file.path, () => {});
      throw error;
    }
  }

  async removeAvatar(id) {
    const existing = await userRepository.findById(id, 'avatar');
    if (existing?.avatar) await avatarService.deleteOldAvatar(existing.avatar);
    const user = await userRepository.updateById(id, { avatar: null });
    if (!user) throw new NotFoundError('User not found.');
    return this._toSafeUser(user);
  }

  async getActiveSessions(userId) {
    const RefreshToken = require('../../infrastructure/tokens/tokens');
    return RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select('_id createdAt lastUsedAt userAgent ipAddress expiresAt')
      .sort('-createdAt')
      .lean();
  }

  async revokeSession(userId, sessionId) {
    const RefreshToken = require('../../infrastructure/tokens/tokens');
    const session = await RefreshToken.findOne({ _id: sessionId, userId, isRevoked: false });
    if (!session) throw new NotFoundError('Session not found.');
    await session.revoke('manual_revoke');
  }

  async getAllUsers(query) { return userRepository.findAll(query); }
  async getUserStats() { return userRepository.getStats(); }

  async adminUpdateUser(id, data) {
    const { password, deletedAt, role, ...safe } = data;

    if (safe.status) {
      safe.isActive = safe.status === 'active';
      safe.statusUpdatedAt = new Date();
    }

    const user = await userRepository.updateById(id, safe);
    if (!user) throw new NotFoundError('User not found.');
    return this._toSafeUser(user);
  }

  async hardDeleteUser(id) {
    const user = await userRepository.hardDeleteById(id);
    if (!user) throw new NotFoundError('User not found.');
  }

  async setUserStatus(id, status, actor = null, reason = '') {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    const validStatuses = ['active', 'inactive', 'suspended', 'banned'];

    if (!validStatuses.includes(normalizedStatus)) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found.');
    }

    if (
      actor &&
      normalizeRole(actor.role) === ROLES.MODERATOR &&
      isPrivilegedRole(existingUser.role)
    ) {
      throw new ForbiddenError('Moderators cannot change the status of admin staff.');
    }

    const payload = {
      status: normalizedStatus,
      isActive: normalizedStatus === 'active',
      statusReason: reason || '',
      statusUpdatedAt: new Date(),
      statusUpdatedBy: getId(actor) || undefined,
    };

    const user = await userRepository.updateById(id, payload);
    if (!user) throw new NotFoundError('User not found.');

    await this._writeAuditLog({
      actor,
      action: 'user.status.changed',
      resourceId: id,
      changes: {
        before: { status: existingUser.status || (existingUser.isActive ? 'active' : 'inactive') },
        after: { status: normalizedStatus, reason: reason || '' },
      },
      metadata: { targetUserId: id },
    });

    return this._toSafeUser(user);
  }

  async setUserActive(id, isActive, actor = null, reason = '') {
    return this.setUserStatus(id, isActive ? 'active' : 'inactive', actor, reason);
  }

  async changeRole(id, role, actor = null) {
    const normalizedRole = normalizeRole(role);
    if (!validRoles.includes(normalizedRole)) {
      throw new BadRequestError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found.');
    }

    const actorRole = normalizeRole(actor?.role);
    const currentRole = normalizeRole(existingUser.role);

    if (actor && getId(actor)?.toString() === id.toString()) {
      throw new ForbiddenError('You cannot change your own role.');
    }

    if (actorRole !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('You do not have permission to change roles.');
    }

    const user = await userRepository.updateById(id, { role: normalizedRole });
    if (!user) throw new NotFoundError('User not found.');

    await this._writeAuditLog({
      actor,
      action: 'user.role.changed',
      resourceId: id,
      changes: {
        before: { role: currentRole },
        after: { role: normalizedRole },
      },
      metadata: { targetUserId: id },
    });

    return this._toSafeUser(user);
  }
}

module.exports = new UserService();
