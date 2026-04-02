'use strict';
const logger = require('../../infrastructure/logger/logger');

// Placeholder for web push / FCM integration
// Replace with webpush or firebase-admin when deploying to production

class PushNotificationService {
  async send(userId, { title, body, data = {}, url = '' }) {
    // TODO: Look up user's push subscription and send via web-push or FCM
    logger.debug(`Push notification queued for user ${userId}: ${title}`);
    return { sent: false, reason: 'Push not configured' };
  }

  async sendToMany(userIds, payload) {
    const results = await Promise.allSettled(userIds.map(id => this.send(id, payload)));
    return { sent: results.filter(r => r.status === 'fulfilled').length, failed: results.filter(r => r.status === 'rejected').length };
  }

  validateSubscription(sub) {
    return sub && sub.endpoint && sub.keys && sub.keys.auth && sub.keys.p256dh;
  }
}

module.exports = new PushNotificationService();
