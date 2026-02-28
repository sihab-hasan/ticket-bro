"use strict";

const { sendMail } = require("./mailClient");
const {
  welcomeTemplate,
  verifyEmailTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  otpTemplate,
  loginAlertTemplate,
} = require("./templates/emailTemplates");
const logger = require("../../infrastructure/logger/logger");

class EmailService {
  /**
   * Send welcome + verification email on registration
   */
  async sendWelcomeEmail({ to, firstName, verificationUrl }) {
    return this._send({
      to,
      subject: `Welcome to Ticket Bro, ${firstName}! Please verify your email`,
      html: welcomeTemplate({ firstName, verificationUrl }),
    });
  }

  /**
   * Resend verification email
   */
  async sendVerificationEmail({ to, firstName, verificationUrl }) {
    return this._send({
      to,
      subject: "Verify your email address — Ticket Bro",
      html: verifyEmailTemplate({ firstName, verificationUrl }),
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ to, firstName, resetUrl }) {
    return this._send({
      to,
      subject: "Reset your password — Ticket Bro",
      html: resetPasswordTemplate({ firstName, resetUrl }),
    });
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail({ to, firstName }) {
    return this._send({
      to,
      subject: "Your password has been changed — Ticket Bro",
      html: passwordChangedTemplate({ firstName }),
    });
  }

  /**
   * Send OTP for 2FA / phone verification
   */
  async sendOTPEmail({ to, firstName, otp, purpose = "verification" }) {
    return this._send({
      to,
      subject: `Your Ticket Bro OTP code: ${otp}`,
      html: otpTemplate({ firstName, otp, purpose }),
    });
  }

  /**
   * Send login alert for suspicious login
   */
  async sendLoginAlertEmail({ to, firstName, ipAddress, device, time }) {
    return this._send({
      to,
      subject: "⚠️ New login detected — Ticket Bro",
      html: loginAlertTemplate({
        firstName,
        ipAddress,
        device,
        time: time || new Date().toUTCString(),
      }),
    });
  }

  /**
   * Core send method with error handling
   */
  async _send({ to, subject, html, text, attachments }) {
    try {
      return await sendMail({ to, subject, html, text, attachments });
    } catch (error) {
      // Log but don't throw — email failure should not crash auth flow
      logger.error(
        `EmailService._send failed [to: ${to}, subject: ${subject}]: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
