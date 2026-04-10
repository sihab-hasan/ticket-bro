'use strict';

const logger = require('../../../infrastructure/logger/logger');
const pushNotificationService = require('../push-notification.service');

class PushProvider {
  constructor() {
    this.vapidDetails = null;
  }

  setVapidDetails(subject, publicKey, privateKey) {
    this.vapidDetails = { subject, publicKey, privateKey };
    logger.info('Push provider vapid details configured');
  }

  async send(subscription, payload) {
    if (!pushNotificationService.validateSubscription(subscription)) {
      logger.warn('Invalid push subscription', { subscription });
      return { success: false, error: 'Invalid subscription' };
    }

    try {
      const result = await pushNotificationService.send(subscription.userId, {
        title: payload.title,
        body: payload.message,
        data: payload.data || {},
        url: payload.link || '',
      });

      return { success: result.sent, error: result.reason };
    } catch (error) {
      logger.error('Push notification error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendToUser(userId, notification) {
    const { getUserPushSubscriptions } = require('./notification.repository');
    
    try {
      const subscriptions = await getUserPushSubscriptions(userId);
      if (!subscriptions || subscriptions.length === 0) {
        return { success: false, error: 'No push subscriptions found' };
      }

      const results = await Promise.all(
        subscriptions.map(sub => this.send(sub, notification))
      );

      const successful = results.filter(r => r.success).length;
      return {
        success: true,
        sent: successful,
        failed: results.length - successful,
      };
    } catch (error) {
      logger.error('Failed to send push to user', { error: error.message, userId });
      return { success: false, error: error.message };
    }
  }

  async sendBatch(userIds, notification) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, notification))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    return {
      success: true,
      sent: successful,
      failed: results.length - successful,
    };
  }
}

module.exports = new PushProvider();