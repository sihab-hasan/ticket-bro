'use strict';

const userRepository = require('./user.repository');
const avatarService  = require('./avatar.service');
const fs = require('fs');
const { NotFoundError, BadRequestError } = require('../../common/errors/AppError');

const getId = (user) => user?.id || user?._id || user?.userId;

class UserService {
  async getUserById(id) {
    const user = await userRepository.findActiveById(id);
    if (!user) throw new NotFoundError('User not found.');
    return user.toSafeObject ? user.toSafeObject() : user.toObject();
  }

  async updateUser(id, data) {
    const {
      role, isActive, isEmailVerified, deletedAt, password,
      googleId, facebookId, oauthProvider, loginAttempts, lockUntil,
      emailVerificationToken, passwordResetToken, ...safe
    } = data;
    const user = await userRepository.updateById(id, safe);
    if (!user) throw new NotFoundError('User not found.');
    return user.toSafeObject ? user.toSafeObject() : user.toObject();
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
      return user.toSafeObject ? user.toSafeObject() : user.toObject();
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
    return user.toSafeObject ? user.toSafeObject() : user.toObject();
  }

  async getActiveSessions(userId) {
    try {
      const RefreshToken = require('../auth/refreshToken.model');
      return await RefreshToken.find({ userId, isRevoked: false })
        .select('_id createdAt lastUsedAt device ip expiresAt').sort('-lastUsedAt').lean();
    } catch { return []; }
  }

  async revokeSession(userId, sessionId) {
    try {
      const RefreshToken = require('../auth/refreshToken.model');
      const session = await RefreshToken.findOne({ _id: sessionId, userId });
      if (!session) throw new NotFoundError('Session not found.');
      session.isRevoked = true;
      await session.save();
    } catch (err) { if (err.statusCode) throw err; }
  }

  async getAllUsers(query)        { return userRepository.findAll(query); }
  async getUserStats()            { return userRepository.getStats(); }

  async adminUpdateUser(id, data) {
    const { password, deletedAt, ...safe } = data;
    const user = await userRepository.updateById(id, safe);
    if (!user) throw new NotFoundError('User not found.');
    return user.toSafeObject ? user.toSafeObject() : user.toObject();
  }

  async hardDeleteUser(id) {
    const user = await userRepository.hardDeleteById(id);
    if (!user) throw new NotFoundError('User not found.');
  }

  async setUserActive(id, isActive) {
    const user = await userRepository.updateById(id, { isActive });
    if (!user) throw new NotFoundError('User not found.');
    return user.toSafeObject ? user.toSafeObject() : user.toObject();
  }

  async changeRole(id, role) {
    const validRoles = ['user', 'organizer', 'admin'];
    if (!validRoles.includes(role)) throw new BadRequestError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    const user = await userRepository.updateById(id, { role });
    if (!user) throw new NotFoundError('User not found.');
    return user.toSafeObject ? user.toSafeObject() : user.toObject();
  }
}

module.exports = new UserService();
