'use strict';
const { NotFoundError } = require('../../common/errors/AppError');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class SessionService {
  async getSessions(userId) {
    try {
      const RefreshToken = require('../../infrastructure/tokens/tokens');
      const sessions = await RefreshToken.find({ userId, isRevoked: false })
        .select('_id createdAt lastUsedAt device ip expiresAt').sort('-lastUsedAt').lean();
      return { sessions };
    } catch { return { sessions: [] }; }
  }

  async revokeSession(sessionId, userId) {
    const RefreshToken = require('../../infrastructure/tokens/tokens');
    const s = await RefreshToken.findOne({ _id: sessionId, userId });
    if (!s) throw new NotFoundError('Session not found.');
    s.isRevoked = true;
    await s.save();
    return { message: 'Session revoked.' };
  }

  async revokeAllSessions(userId) {
    const RefreshToken = require('../../infrastructure/tokens/tokens');
    await RefreshToken.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true } });
    return { message: 'All sessions revoked.' };
  }
}
module.exports = new SessionService();
