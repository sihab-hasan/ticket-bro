'use strict';
const notificationRepository = require('./notification.repository');
const { NotFoundError } = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
// WebSocket emitter to push notifications in real time
const { emitToUser } = require('../../infrastructure/websocket/socketServer');
const getId = (u) => u?._id || u?.id || u?.userId;

class NotificationService {
  async notify(userId, { type, title, message, data = {}, link = '' }) {
    const notification = await notificationRepository.create({ user: userId, type, title, message, data, link });
    logger.debug(`Notification sent to ${userId}: ${type}`);
    try {
      // Emit the notification to connected clients via WebSocket.  The event name
      // follows the pattern 'notification.created' and sends the raw notification
      // document.  Clients should normalize the payload as needed.
      emitToUser(getId(userId), 'notification.created', { notification });
    } catch (err) {
      // Log errors but do not block the main notification flow
      logger.warn('Failed to emit WS notification', { err: err.message });
    }
    return notification;
  }

  async getNotifications(userId, query = {}) {
    return notificationRepository.findByUserId({ userId, ...query });
  }

  async getNotificationById(notifId, userId) {
    const notification = await notificationRepository.findByIdForUser(notifId, getId(userId));
    if (!notification) throw new NotFoundError('Notification not found.');
    return { notification };
  }

  async getUnreadCount(userId) {
    const count = await notificationRepository.countUnread(userId);
    return { count };
  }

  async markRead(notifId, userId) {
    const n = await notificationRepository.markRead(notifId, getId(userId));
    if (!n) throw new NotFoundError('Notification not found.');
    return n;
  }

  async markAllRead(userId) {
    await notificationRepository.markAllRead(userId);
    return { message: 'All notifications marked as read.' };
  }

  async deleteNotification(notifId, userId) {
    await notificationRepository.deleteById(notifId, userId);
    return { message: 'Notification deleted.' };
  }

  async clearAll(userId) {
    await notificationRepository.deleteAll(userId);
    return { message: 'All notifications cleared.' };
  }

  async getPreferences(userId) {
    // Extend with a NotificationPreference model in a full implementation
    return { email: true, push: true, sms: false, bookingUpdates: true, eventReminders: true, marketing: false };
  }

  async updatePreferences(userId, prefs) {
    return { ...prefs, updatedAt: new Date() };
  }

  async subscribePush(userId, subscription) {
    logger.info(`Push subscription registered for user ${userId}`);
    return { message: 'Push subscription saved.' };
  }

  async unsubscribePush(userId) {
    return { message: 'Push subscription removed.' };
  }
}
module.exports = new NotificationService();
