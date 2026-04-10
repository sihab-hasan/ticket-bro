'use strict';
const notificationRepository = require('./notification.repository');
const { NotFoundError } = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const { emitToUser } = require('../../infrastructure/websocket/socketServer');
const { getTemplate, NOTIFICATION_TYPES } = require('./notification.templates');
const pushProvider = require('./providers/push.provider');
const smsProvider = require('./providers/sms.provider');
const emailProvider = require('./providers/email.provider');
const getId = (u) => u?._id || u?.id || u?.userId;

const PREF_KEY_MAP = {
  'email.bookingConfirmed': 'email.bookingConfirmed',
  'email.bookingCancelled': 'email.bookingCancelled',
  'email.paymentSuccess': 'email.paymentSuccess',
  'email.refundProcessed': 'email.refundProcessed',
  'email.eventUpdated': 'email.eventUpdated',
  'email.promotions': 'email.promotions',
  'email.newsletter': 'email.newsletter',
  'push.bookingReminder': 'push.bookingReminder',
  'push.newEvents': 'push.newEvents',
  'smsNotify': 'sms.bookingConfirmed',
  'soundEnabled': 'soundEnabled',
};

class NotificationService {
  async notify(userId, { type, title, message, data = {}, link = '' }) {
    const notification = await notificationRepository.create({ user: userId, type, title, message, data, link });
    logger.debug(`Notification sent to ${userId}: ${type}`);

    try {
      emitToUser(getId(userId), 'notification.created', { notification });
    } catch (err) {
      logger.warn('Failed to emit WS notification', { err: err.message });
    }

    const prefs = await notificationRepository.getPreferences(getId(userId));
    if (prefs) {
      this.sendMultiChannel(getId(userId), type, { title, message, data, link }, prefs).catch(err => {
        logger.warn('Multi-channel notification failed', { err: err.message });
      });
    }

    return notification;
  }

  async sendMultiChannel(userId, type, payload, prefs) {
    const shouldEmail = this.shouldSendEmail(type, prefs.email);
    const shouldPush = this.shouldSendPush(type, prefs.push);
    const shouldSms = this.shouldSendSms(type, prefs.sms);

    if (shouldPush) {
      pushProvider.sendToUser(userId, payload).catch(err => logger.warn('Push failed', { err: err.message }));
    }

    if (shouldSms && prefs.sms) {
      const userRepo = require('../users/user.repository');
      const user = await userRepo.findById(userId);
      if (user?.phone) {
        if (type === NOTIFICATION_TYPES.BOOKING_CONFIRMED) {
          smsProvider.sendBookingConfirmation(user.phone, payload.data?.eventName, payload.data?.bookingRef);
        } else if (type === NOTIFICATION_TYPES.EVENT_REMINDER) {
          smsProvider.sendEventReminder(user.phone, payload.data?.eventName, payload.data?.timeUntil);
        }
      }
    }

    if (shouldEmail && type !== NOTIFICATION_TYPES.SYSTEM_NOTIFICATION) {
      logger.debug('Email notification queued', { type, userId });
    }
  }

  shouldSendEmail(type, prefs) {
    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_CONFIRMED: return prefs.bookingConfirmed;
      case NOTIFICATION_TYPES.BOOKING_CANCELLED: return prefs.bookingCancelled;
      case NOTIFICATION_TYPES.PAYMENT_SUCCESS: return prefs.paymentSuccess;
      case NOTIFICATION_TYPES.BOOKING_REFUNDED: return prefs.refundProcessed;
      case NOTIFICATION_TYPES.EVENT_UPDATED:
      case NOTIFICATION_TYPES.EVENT_CANCELLED: return prefs.eventUpdated;
      case NOTIFICATION_TYPES.PROMOTIONAL: return prefs.promotions;
      default: return true;
    }
  }

  shouldSendPush(type, prefs) {
    switch (type) {
      case NOTIFICATION_TYPES.EVENT_REMINDER: return prefs.bookingReminder;
      case NOTIFICATION_TYPES.TICKET_AVAILABLE:
      case NOTIFICATION_TYPES.WAITLIST_UPDATE: return prefs.newEvents;
      default: return true;
    }
  }

  shouldSendSms(type, prefs) {
    return type === NOTIFICATION_TYPES.BOOKING_CONFIRMED && prefs.bookingConfirmed;
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
    await notificationRepository.deleteById(notifId, getId(userId));
    return { message: 'Notification deleted.' };
  }

  async clearAll(userId) {
    await notificationRepository.deleteAll(userId);
    return { message: 'All notifications cleared.' };
  }

  async getPreferences(userId) {
    let prefs = await notificationRepository.getPreferences(getId(userId));
    if (!prefs) {
      prefs = await notificationRepository.upsertPreferences(getId(userId), {
        email: { bookingConfirmed: true, bookingCancelled: true, paymentSuccess: true, refundProcessed: true, eventUpdated: true, promotions: false, newsletter: false },
        push: { bookingReminder: true, newEvents: false },
        soundEnabled: true,
      });
    }
    return prefs;
  }

  async updatePreferences(userId, rawPrefs) {
    const updateObj = {};
    for (const [key, value] of Object.entries(rawPrefs)) {
      const mapped = PREF_KEY_MAP[key];
      if (mapped) {
        const parts = mapped.split('.');
        if (parts.length === 2) {
          if (!updateObj[parts[0]]) updateObj[parts[0]] = {};
          updateObj[parts[0]][parts[1]] = value;
        } else {
          updateObj[mapped] = value;
        }
      }
    }

    if (rawPrefs.doNotDisturb) {
      updateObj.doNotDisturb = rawPrefs.doNotDisturb;
    }

    const prefs = await notificationRepository.upsertPreferences(getId(userId), updateObj);
    return prefs;
  }

  async subscribePush(userId, subscription) {
    const { endpoint, keys, expirationTime } = subscription;
    await notificationRepository.savePushSubscription(getId(userId), { endpoint, keys, expirationTime });
    logger.info(`Push subscription registered for user ${userId}`);
    return { message: 'Push subscription saved.' };
  }

  async unsubscribePush(userId, endpoint) {
    if (endpoint) {
      await notificationRepository.removePushSubscription(getId(userId), endpoint);
    }
    return { message: 'Push subscription removed.' };
  }

  async notifyWithTemplate(userId, type, variables) {
    const template = getTemplate(type, variables);
    return this.notify(userId, {
      type,
      title: template.title,
      message: template.message,
      data: variables,
      link: variables.link || '',
    });
  }
}
module.exports = new NotificationService();