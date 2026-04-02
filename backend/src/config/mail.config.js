'use strict';
const nodemailer = require('nodemailer');
const env = require('./env');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Dev: log emails to console
    transporter = { sendMail: async (opts) => { console.log('[MAIL]', opts.to, opts.subject); return { messageId: 'dev' }; } };
  }
  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  return t.sendMail({ from: process.env.EMAIL_FROM || 'noreply@ticketbro.com', to, subject, html, text });
};

module.exports = { sendMail, getTransporter };
