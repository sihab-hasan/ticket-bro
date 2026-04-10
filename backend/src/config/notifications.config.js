'use strict';

require('dotenv').config();

const env = {
  // WebPush VAPID keys - Generate using: npx web-push generate-vapid-keys
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:admin@ticketbro.com',

  // Push notification settings
  PUSH_ENABLED: process.env.PUSH_ENABLED === 'true',
  PUSH_TTL: parseInt(process.env.PUSH_TTL, 10) || 2419200, // 28 days

  // SMS Provider settings
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'twilio', // twilio, aws-sns, etc.
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',

  // SNS settings (alternative SMS provider)
  AWS_SNS_REGION: process.env.AWS_SNS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',

  // Notification delivery settings
  NOTIFICATION_DELIVERY: {
    retryAttempts: 3,
    retryDelay: 1000, // ms
    batchSize: 100,
  },

  // In-app notification settings
  IN_APP_NOTIFICATIONS: {
    enabled: true,
    retentionDays: 90,
    maxPerUser: 100,
  },
};

module.exports = env;