'use strict';

const logger = require('../../../infrastructure/logger/logger');
const notificationsConfig = require('../../../config/notifications.config');

class SMSProvider {
  constructor() {
    this.provider = notificationsConfig.SMS_PROVIDER || 'twilio';
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    if (this.provider === 'twilio') {
      if (notificationsConfig.TWILIO_ACCOUNT_SID && notificationsConfig.TWILIO_AUTH_TOKEN) {
        try {
          const twilio = require('twilio');
          this.client = twilio(notificationsConfig.TWILIO_ACCOUNT_SID, notificationsConfig.TWILIO_AUTH_TOKEN);
          logger.info('Twilio SMS client initialized');
        } catch (error) {
          logger.warn('Twilio not available:', error.message);
        }
      }
    } else if (this.provider === 'aws-sns') {
      if (notificationsConfig.AWS_ACCESS_KEY_ID && notificationsConfig.AWS_SECRET_ACCESS_KEY) {
        try {
          const AWS = require('aws-sdk');
          AWS.config.update({
            region: notificationsConfig.AWS_SNS_REGION,
            accessKeyId: notificationsConfig.AWS_ACCESS_KEY_ID,
            secretAccessKey: notificationsConfig.AWS_SECRET_ACCESS_KEY,
          });
          this.client = new AWS.SNS();
          logger.info('AWS SNS client initialized');
        } catch (error) {
          logger.warn('AWS SNS not available:', error.message);
        }
      }
    }
  }

  async send({ to, message, from }) {
    if (!this.client) {
      logger.debug('SMS queued (provider not configured)', { to, message });
      return { success: false, reason: 'SMS provider not configured' };
    }

    try {
      if (this.provider === 'twilio') {
        const result = await this.client.messages.create({
          body: message,
          from: from || notificationsConfig.TWILIO_PHONE_NUMBER,
          to,
        });
        logger.info('SMS sent via Twilio', { sid: result.sid, to });
        return { success: true, id: result.sid };
      } else if (this.provider === 'aws-sns') {
        const result = await this.client.publish({
          Message: message,
          PhoneNumber: to,
        }).promise();
        logger.info('SMS sent via AWS SNS', { messageId: result.MessageId, to });
        return { success: true, id: result.MessageId };
      }
    } catch (error) {
      logger.error('SMS send error', { error: error.message, to });
      return { success: false, error: error.message };
    }

    return { success: false, reason: 'Unknown provider' };
  }

  async sendVerification(phone, code) {
    return this.send({
      to: phone,
      message: `Your Ticket Bro verification code is: ${code}. Valid for 10 minutes.`,
    });
  }

  async sendBookingConfirmation(phone, eventName, bookingRef) {
    return this.send({
      to: phone,
      message: `Booking confirmed! ${eventName}. Ref: ${bookingRef}. Show your ticket at entry.`,
    });
  }

  async sendEventReminder(phone, eventName, timeUntil) {
    return this.send({
      to: phone,
      message: `Reminder: ${eventName} is ${timeUntil}. Don't forget your ticket!`,
    });
  }

  async sendTicketAvailable(phone, eventName) {
    return this.send({
      to: phone,
      message: `Tickets available! ${eventName} - Book now before they sell out!`,
    });
  }
}

module.exports = new SMSProvider();