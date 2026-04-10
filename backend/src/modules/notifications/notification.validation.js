'use strict';

const { NOTIFICATION_TYPES } = require('./notification.templates');

const validateNotificationData = (data) => {
  const errors = [];

  if (!data.type) {
    errors.push('Notification type is required');
  } else if (!Object.values(NOTIFICATION_TYPES).includes(data.type)) {
    errors.push(`Invalid notification type. Must be one of: ${Object.values(NOTIFICATION_TYPES).join(', ')}`);
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required and must be a non-empty string');
  } else if (data.message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }

  if (data.link !== undefined && typeof data.link !== 'string') {
    errors.push('Link must be a string');
  }

  if (data.data !== undefined && typeof data.data !== 'object') {
    errors.push('Data must be an object');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePreferences = (prefs) => {
  const errors = [];
  const validKeys = [
    'email.bookingConfirmed',
    'email.bookingCancelled',
    'email.paymentSuccess',
    'email.refundProcessed',
    'email.eventUpdated',
    'email.promotions',
    'email.newsletter',
    'push.bookingReminder',
    'push.newEvents',
    'soundEnabled',
  ];

  if (typeof prefs !== 'object' || prefs === null) {
    return { isValid: false, errors: ['Preferences must be an object'] };
  }

  for (const key of Object.keys(prefs)) {
    if (!validKeys.includes(key) && key !== 'smsNotify') {
      // Allow unknown keys but warn
    }
    if (typeof prefs[key] !== 'boolean') {
      errors.push(`Preference '${key}' must be a boolean`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePushSubscription = (subscription) => {
  const errors = [];

  if (!subscription || typeof subscription !== 'object') {
    return { isValid: false, errors: ['Subscription must be an object'] };
  }

  if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
    errors.push('Subscription endpoint is required');
  }

  if (!subscription.keys || typeof subscription.keys !== 'object') {
    errors.push('Subscription keys are required');
  } else {
    if (!subscription.keys.p256dh || typeof subscription.keys.p256dh !== 'string') {
      errors.push('P256DH key is required');
    }
    if (!subscription.keys.auth || typeof subscription.keys.auth !== 'string') {
      errors.push('Auth key is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateNotificationData,
  validatePreferences,
  validatePushSubscription,
};