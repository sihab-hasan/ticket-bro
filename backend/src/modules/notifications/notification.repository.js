'use strict';
const Notification = require('./notification.model');

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
}
module.exports = new NotificationRepository();
