'use strict';

const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../infrastructure/logger/logger');

let transporter = null;

const createTransporter = () => {
  if (env.isTest()) {
    // Use ethereal (fake SMTP) in test
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'test@ethereal.email', pass: 'testpass' },
    });
  }

  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: env.isProduction(),
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const verifyConnection = async () => {
  try {
    const t = getTransporter();
    await t.verify();
    logger.info('Mail server connection verified successfully');
    return true;
  } catch (error) {
    logger.error(`Mail server connection failed: ${error.message}`);
    return false;
  }
};

const sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // fallback text
      attachments,
    });

    logger.info(`Email sent to ${to} | MessageId: ${info.messageId}`);

    if (env.isDevelopment()) {
      logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = { sendMail, verifyConnection, getTransporter };
