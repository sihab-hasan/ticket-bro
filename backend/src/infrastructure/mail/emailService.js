"use strict";

const { sendMail } = require("./mailClient");
const {
  renderEmailTemplate,
  getAvailableEmailTemplates,
} = require("./templateRenderer");
const logger = require("../../infrastructure/logger/logger");
const {
  formatCurrency,
  formatCountLabel,
} = require("./templateData");

class EmailService {
  async sendTemplateEmail({
    to,
    templateName,
    data = {},
    subject,
    text,
    attachments,
    cc,
    bcc,
    replyTo,
    headers,
  }) {
    try {
      if (!getAvailableEmailTemplates().includes(templateName)) {
        throw new Error(`Unknown email template: ${templateName}`);
      }

      const rendered = renderEmailTemplate(templateName, data);

      return await this._send({
        to,
        cc,
        bcc,
        replyTo,
        headers,
        subject: subject || rendered.subject,
        html: rendered.html,
        text: text || rendered.text,
        attachments,
      });
    } catch (error) {
      logger.error(
        `EmailService.sendTemplateEmail failed [template: ${templateName}, to: ${to}]: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail({ to, firstName, verificationUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "welcome",
      data: { firstName, verificationUrl },
    });
  }

  async sendVerificationEmail({ to, firstName, verificationUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "verifyEmail",
      data: { firstName, verificationUrl },
    });
  }

  async sendPasswordResetEmail({ to, firstName, resetUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "resetPassword",
      data: { firstName, resetUrl },
    });
  }

  async sendPasswordChangedEmail({ to, firstName }) {
    return this.sendTemplateEmail({
      to,
      templateName: "passwordChanged",
      data: { firstName },
    });
  }

  async sendOTPEmail({ to, firstName, otp, purpose = "verification" }) {
    return this.sendTemplateEmail({
      to,
      templateName: "twoFactorCode",
      data: { firstName, otp, purpose },
    });
  }

  async sendLoginAlertEmail({ to, firstName, ipAddress, device, time }) {
    return this.sendTemplateEmail({
      to,
      templateName: "loginAlert",
      data: {
        firstName,
        ipAddress,
        device,
        loginTime: time || new Date().toUTCString(),
      },
    });
  }

  async sendAccountSuspendedEmail({ to, firstName, reason, reviewDate, supportUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "accountSuspended",
      data: {
        firstName,
        suspensionReason: reason,
        reviewDate,
        supportUrl,
      },
    });
  }

  async sendAccountBannedEmail({ to, firstName, reason, appealUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "accountBanned",
      data: {
        firstName,
        banReason: reason,
        appealUrl,
      },
    });
  }

  async sendBookingConfirmationEmail({
    to,
    firstName,
    eventName,
    bookingRef,
    eventDate,
    location,
    ticketCount,
    totalAmount,
    currency,
    bookingUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "bookingConfirmation",
      data: {
        firstName,
        eventName,
        bookingRef,
        eventDate,
        eventLocation: location,
        ticketCount,
        ticketCountLabel: formatCountLabel(ticketCount, "ticket"),
        totalAmountFormatted: formatCurrency(totalAmount, currency),
        bookingUrl,
      },
    });
  }

  async sendEventCancelledEmail({
    to,
    firstName,
    eventName,
    eventDate,
    organizerName,
    refundSummary,
    bookingUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "eventCancelled",
      data: {
        firstName,
        eventName,
        eventDate,
        organizerName,
        refundSummary,
        bookingUrl,
      },
    });
  }

  async sendEventReminderEmail({
    to,
    firstName,
    eventName,
    eventDate,
    location,
    ticketCount,
    bookingUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "eventReminder",
      data: {
        firstName,
        eventName,
        eventDate,
        eventLocation: location,
        ticketCount,
        ticketCountLabel: formatCountLabel(ticketCount, "ticket"),
        bookingUrl,
      },
    });
  }

  async sendOrganizerApprovedEmail({ to, firstName, dashboardUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "organizerApproved",
      data: { firstName, dashboardUrl },
    });
  }

  async sendOrganizerRejectedEmail({ to, firstName, reason, dashboardUrl }) {
    return this.sendTemplateEmail({
      to,
      templateName: "organizerRejected",
      data: {
        firstName,
        rejectionReason: reason,
        dashboardUrl,
      },
    });
  }

  async sendPaymentReceiptEmail({
    to,
    firstName,
    amount,
    currency,
    paymentMethod,
    paymentDate,
    receiptNumber,
    bookingRef,
    receiptUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "paymentReceipt",
      data: {
        firstName,
        amountFormatted: formatCurrency(amount, currency),
        paymentMethod,
        paymentDate,
        receiptNumber,
        bookingRef,
        receiptUrl,
      },
    });
  }

  async sendPayoutSentEmail({
    to,
    firstName,
    amount,
    currency,
    payoutReference,
    destination,
    processedAt,
    dashboardUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "payoutSent",
      data: {
        firstName,
        amountFormatted: formatCurrency(amount, currency),
        payoutReference,
        destination,
        processedAt,
        dashboardUrl,
      },
    });
  }

  async sendRefundProcessedEmail({
    to,
    firstName,
    amount,
    currency,
    paymentMethod,
    processedAt,
    bookingRef,
    statusUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "refundProcessed",
      data: {
        firstName,
        amountFormatted: formatCurrency(amount, currency),
        paymentMethod,
        processedAt,
        bookingRef,
        statusUrl,
      },
    });
  }

  async sendTicketCancelledEmail({
    to,
    firstName,
    eventName,
    ticketCode,
    cancelledAt,
    refundSummary,
    bookingUrl,
  }) {
    return this.sendTemplateEmail({
      to,
      templateName: "ticketCancelled",
      data: {
        firstName,
        eventName,
        ticketCode,
        cancelledAt,
        refundSummary,
        bookingUrl,
      },
    });
  }

  async _send({
    to,
    cc,
    bcc,
    replyTo,
    headers,
    subject,
    html,
    text,
    attachments,
  }) {
    try {
      return await sendMail({
        to,
        cc,
        bcc,
        replyTo,
        headers,
        subject,
        html,
        text,
        attachments,
      });
    } catch (error) {
      logger.error(
        `EmailService._send failed [to: ${to}, subject: ${subject}]: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
