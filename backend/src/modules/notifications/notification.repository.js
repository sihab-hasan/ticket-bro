'use strict';
const Notification = require('./notification.model');
const NotificationPreferences = require('./notification-preferences.model');

class NotificationRepository {
  async create(data) { return new Notification(data).save(); }
  async createMany(arr) { return Notification.insertMany(arr); }

  async findByUserId({ userId, page = 1, limit = 20, sort = '-createdAt', unreadOnly = false, type, priority, isRead }) {
    const filter = { user: userId, deletedAt: null };
    if (unreadOnly) filter.isRead = false;
    if (typeof isRead !== 'undefined') filter.isRead = String(isRead) === 'true';
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Notification.countDocuments(filter),
    ]);
    return { notifications, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }


  async findByIdForUser(id, userId) {
    return Notification.findOne({ _id: id, user: userId, deletedAt: null }).lean();
  }

  async countUnread(userId) {
    return Notification.countDocuments({ user: userId, isRead: false, deletedAt: null });
  }

  async markRead(id, userId) {
    return Notification.findOneAndUpdate({ _id: id, user: userId }, { $set: { isRead: true, readAt: new Date() } }, { new: true }).exec();
  }

  async markAllRead(userId) {
    return Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  }

  async deleteById(id, userId) {
    return Notification.findOneAndUpdate({ _id: id, user: userId }, { $set: { deletedAt: new Date() } }).exec();
  }

  async deleteAll(userId) {
    return Notification.updateMany({ user: userId }, { $set: { deletedAt: new Date() } });
  }

  async getPreferences(userId) {
    return NotificationPreferences.findOne({ user: userId }).lean();
  }

  async upsertPreferences(userId, prefs) {
    return NotificationPreferences.findOneAndUpdate(
      { user: userId },
      { $set: prefs },
      { upsert: true, new: true }
    ).lean();
  }

  async savePushSubscription(userId, subscription) {
    return NotificationPreferences.findOneAndUpdate(
      { user: userId },
      { $push: { pushSubscriptions: { ...subscription, createdAt: new Date() } } },
      { upsert: true, new: true }
    );
  }

  async getPushSubscriptions(userId) {
    const prefs = await NotificationPreferences.findOne({ user: userId }).lean();
    return prefs?.pushSubscriptions || [];
  }

  async removePushSubscription(userId, endpoint) {
    return NotificationPreferences.findOneAndUpdate(
      { user: userId },
      { $pull: { pushSubscriptions: { endpoint } } }
    );
  }

  static getUserPushSubscriptions = async (userId) => {
    const prefs = await NotificationPreferences.findOne({ user: userId }).lean();
    return prefs?.pushSubscriptions || [];
  };
}
module.exports = new NotificationRepository();
