"use strict";

const emailService = require("../../../infrastructure/mail/emailService");

class EmailProvider {
  async sendTemplate(payload) {
    return emailService.sendTemplateEmail(payload);
  }

  async sendWelcome(payload) {
    return emailService.sendWelcomeEmail(payload);
  }

  async sendVerification(payload) {
    return emailService.sendVerificationEmail(payload);
  }

  async sendPasswordReset(payload) {
    return emailService.sendPasswordResetEmail(payload);
  }
}

module.exports = new EmailProvider();
