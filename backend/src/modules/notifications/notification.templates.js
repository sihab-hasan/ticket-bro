'use strict';

const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REFUNDED: 'booking_refunded',
  EVENT_REMINDER: 'event_reminder',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  WAITLIST_UPDATE: 'waitlist_update',
  TICKET_AVAILABLE: 'ticket_available',
  SYSTEM_NOTIFICATION: 'system',
  PROMOTIONAL: 'promotional',
};

const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.BOOKING_CONFIRMED]: {
    title: 'Booking Confirmed!',
    message: 'Your booking for {{eventName}} has been confirmed. Your ticket reference is {{bookingRef}}.',
    icon: '🎟️',
    priority: 'high',
  },
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: {
    title: 'Booking Cancelled',
    message: 'Your booking for {{eventName}} has been cancelled. {{refundMessage}}',
    icon: '❌',
    priority: 'high',
  },
  [NOTIFICATION_TYPES.BOOKING_REFUNDED]: {
    title: 'Refund Processed',
    message: 'Your refund of {{amount}} for {{eventName}} has been processed.',
    icon: '💰',
    priority: 'medium',
  },
  [NOTIFICATION_TYPES.EVENT_REMINDER]: {
    title: 'Event Reminder',
    message: '{{eventName}} is happening {{timeUntil}}. Don\'t forget your ticket!',
    icon: '⏰',
    priority: 'high',
  },
  [NOTIFICATION_TYPES.EVENT_UPDATED]: {
    title: 'Event Updated',
    message: '{{eventName}} has been updated. {{changeDescription}}',
    icon: '📅',
    priority: 'medium',
  },
  [NOTIFICATION_TYPES.EVENT_CANCELLED]: {
    title: 'Event Cancelled',
    message: '{{eventName}} has been cancelled. {{refundInfo}}',
    icon: '🚫',
    priority: 'high',
  },
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: {
    title: 'Payment Successful',
    message: 'Your payment of {{amount}} for {{eventName}} was successful.',
    icon: '✅',
    priority: 'medium',
  },
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: {
    title: 'Payment Failed',
    message: 'Your payment for {{eventName}} failed. Please try again.',
    icon: '❌',
    priority: 'high',
  },
  [NOTIFICATION_TYPES.WAITLIST_UPDATE]: {
    title: 'Waitlist Update',
    message: 'Your position on the waitlist for {{eventName}} has changed to #{{position}}.',
    icon: '📋',
    priority: 'medium',
  },
  [NOTIFICATION_TYPES.TICKET_AVAILABLE]: {
    title: 'Tickets Available!',
    message: 'Tickets for {{eventName}} are now available!',
    icon: '🎉',
    priority: 'high',
  },
  [NOTIFICATION_TYPES.SYSTEM_NOTIFICATION]: {
    title: '{{title}}',
    message: '{{message}}',
    icon: '⚙️',
    priority: 'low',
  },
  [NOTIFICATION_TYPES.PROMOTIONAL]: {
    title: '{{title}}',
    message: '{{message}}',
    icon: '🎁',
    priority: 'low',
  },
};

const fillTemplate = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

const getTemplate = (type, variables = {}) => {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) {
    return {
      title: variables.title || 'Notification',
      message: variables.message || '',
      icon: '🔔',
      priority: 'medium',
    };
  }

  return {
    title: fillTemplate(template.title, variables),
    message: fillTemplate(template.message, variables),
    icon: template.icon,
    priority: template.priority,
  };
};

module.exports = {
  NOTIFICATION_TYPES,
  NOTIFICATION_TEMPLATES,
  getTemplate,
  fillTemplate,
};