"use strict";

const env = require("../../config/env");

const APP_NAME = env.APP_NAME || "Ticket Bro";
const FRONTEND_URL = env.FRONTEND_URL || "http://localhost:3000";
const CONTACT_URL = `${FRONTEND_URL.replace(/\/+$/, "")}/contact`;

const getGreetingName = (data = {}) =>
  String(
    data.greetingName ||
      data.firstName ||
      data.recipientFirstName ||
      data.recipientName ||
      "there",
  ).trim() || "there";

const manifest = {
  welcome: {
    fileName: "welcome.html",
    subject: "Welcome to {{appName}}, {{greetingName}}! Please verify your email",
    previewText: "Welcome to {{appName}}",
    required: ["verificationUrl"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      verificationExpiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN || "24h",
    }),
  },
  verifyEmail: {
    fileName: "verify-email.html",
    subject: "Verify your email address - {{appName}}",
    previewText: "Confirm your email address",
    required: ["verificationUrl"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      verificationExpiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN || "24h",
    }),
  },
  resetPassword: {
    fileName: "reset-password.html",
    subject: "Reset your password - {{appName}}",
    previewText: "Password reset request",
    required: ["resetUrl"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      passwordResetExpiresIn: env.PASSWORD_RESET_EXPIRES_IN || "1h",
    }),
  },
  passwordChanged: {
    fileName: "password-changed.html",
    subject: "Your password has been changed - {{appName}}",
    previewText: "Your password has been changed",
    prepare: (data) => ({
      greetingName: getGreetingName(data),
    }),
  },
  twoFactorCode: {
    fileName: "2fa-code.html",
    subject: "Your {{appName}} OTP code: {{otp}}",
    previewText: "{{otp}} is your verification code",
    required: ["otp"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      purpose: data.purpose || "verification",
    }),
  },
  loginAlert: {
    fileName: "login-alert.html",
    subject: "New login detected - {{appName}}",
    previewText: "Security alert for your account",
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      loginTime: data.loginTime || data.time || new Date().toUTCString(),
      ipAddress: data.ipAddress || "Unknown",
      device: data.device || "Unknown device",
    }),
  },
  accountSuspended: {
    fileName: "account-suspended.html",
    subject: "Your {{appName}} account has been suspended",
    previewText: "Your account has been suspended",
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      suspensionReason:
        data.suspensionReason ||
        data.reason ||
        "A policy or security review is in progress.",
      reviewDate:
        data.reviewDate || "We will contact you with an update soon.",
      supportUrl: data.supportUrl || CONTACT_URL,
    }),
  },
  accountBanned: {
    fileName: "account-banned.html",
    subject: "Your {{appName}} account has been banned",
    previewText: "Your account has been banned",
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      banReason:
        data.banReason ||
        data.reason ||
        "A serious policy violation was recorded on this account.",
      appealUrl: data.appealUrl || CONTACT_URL,
    }),
  },
  bookingConfirmation: {
    fileName: "booking-confirmation.html",
    subject: "Booking confirmed - {{eventName}}",
    previewText: "Booking confirmed for {{eventName}}",
    required: ["eventName", "bookingRef", "bookingUrl"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      eventLocation: data.eventLocation || data.location || "Location details will be shared soon.",
      ticketCountLabel: data.ticketCountLabel || data.ticketCount || "0 tickets",
      totalAmountFormatted: data.totalAmountFormatted || data.totalAmount || "",
    }),
  },
  eventCancelled: {
    fileName: "event-cancelled.html",
    subject: "{{eventName}} has been cancelled",
    previewText: "{{eventName}} has been cancelled",
    required: ["eventName"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      refundSummary:
        data.refundSummary || "Refund details will be shared separately.",
      bookingUrl: data.bookingUrl || `${FRONTEND_URL}/bookings`,
    }),
  },
  eventReminder: {
    fileName: "event-reminder.html",
    subject: "Reminder: {{eventName}} starts soon",
    previewText: "Reminder: {{eventName}} starts soon",
    required: ["eventName"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      eventLocation: data.eventLocation || data.location || "Check your booking for the latest venue details.",
      ticketCountLabel: data.ticketCountLabel || data.ticketCount || "0 tickets",
      bookingUrl: data.bookingUrl || `${FRONTEND_URL}/bookings`,
    }),
  },
  organizerApproved: {
    fileName: "organizer-approved.html",
    subject: "Your organizer profile has been approved - {{appName}}",
    previewText: "Your organizer profile has been approved",
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      dashboardUrl: data.dashboardUrl || `${FRONTEND_URL}/organizer/dashboard`,
    }),
  },
  organizerRejected: {
    fileName: "organizer-rejected.html",
    subject: "Organizer verification update - {{appName}}",
    previewText: "Organizer verification update",
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      rejectionReason:
        data.rejectionReason ||
        data.reason ||
        "Your submission needs additional information or updated documents.",
      dashboardUrl: data.dashboardUrl || `${FRONTEND_URL}/organizer/settings`,
    }),
  },
  paymentReceipt: {
    fileName: "payment-receipt.html",
    subject: "Payment receipt - {{appName}}",
    previewText: "Your payment receipt",
    required: ["amountFormatted"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      receiptUrl: data.receiptUrl || `${FRONTEND_URL}/payments/history`,
    }),
  },
  payoutSent: {
    fileName: "payout-sent.html",
    subject: "Your payout has been sent - {{appName}}",
    previewText: "Your payout has been sent",
    required: ["amountFormatted"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      dashboardUrl: data.dashboardUrl || `${FRONTEND_URL}/organizer/revenue`,
    }),
  },
  refundProcessed: {
    fileName: "refund-processed.html",
    subject: "Your refund has been processed - {{appName}}",
    previewText: "Your refund has been processed",
    required: ["amountFormatted"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      statusUrl: data.statusUrl || `${FRONTEND_URL}/bookings`,
    }),
  },
  ticketCancelled: {
    fileName: "ticket-cancelled.html",
    subject: "Your ticket has been cancelled - {{appName}}",
    previewText: "Your ticket has been cancelled",
    required: ["eventName"],
    prepare: (data) => ({
      greetingName: getGreetingName(data),
      bookingUrl: data.bookingUrl || `${FRONTEND_URL}/bookings`,
      refundSummary:
        data.refundSummary ||
        "A separate refund update will be sent if applicable.",
    }),
  },
};

module.exports = {
  APP_NAME,
  FRONTEND_URL,
  CONTACT_URL,
  manifest,
};
