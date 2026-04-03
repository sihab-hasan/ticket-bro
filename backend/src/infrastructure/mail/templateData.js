"use strict";

const env = require("../../config/env");

const formatCurrency = (amount = 0, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${currency || "USD"}`;
  }
};

const formatCountLabel = (count = 0, singular = "item", plural = `${singular}s`) =>
  `${Number(count || 0)} ${Number(count || 0) === 1 ? singular : plural}`;

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: env.TIMEZONE || process.env.TZ || "UTC",
    }).format(new Date(value));
  } catch {
    return new Date(value).toISOString();
  }
};

const formatLocation = (location) => {
  if (!location) {
    return "";
  }

  if (typeof location === "string") {
    return location;
  }

  if (location.type === "online") {
    return location.onlinePlatform || location.onlineUrl || "Online event";
  }

  return [
    location.name,
    location.address,
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const buildFrontendUrl = (pathname = "") => {
  const base = (env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
  const path = String(pathname || "").replace(/^\/+/, "");
  return path ? `${base}/${path}` : base;
};

const getUserFirstName = (user, fallback = "there") =>
  user?.firstName || user?.name || fallback;

const getUserDisplayName = (user, fallback = "there") =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
  user?.name ||
  fallback;

const getPaymentMethodLabel = (payment) => {
  if (payment?.paymentMethod?.brand && payment?.paymentMethod?.last4) {
    return `${payment.paymentMethod.brand} ending in ${payment.paymentMethod.last4}`;
  }

  if (payment?.paymentMethod?.type) {
    return payment.paymentMethod.type;
  }

  if (payment?.gateway) {
    return String(payment.gateway).toUpperCase();
  }

  return "Card";
};

const getPayoutDestination = (payout) => {
  const bankName = payout?.bankDetails?.bankName;
  const accountNumber = payout?.bankDetails?.accountNumber;

  if (!bankName && !accountNumber) {
    return "Your connected payout destination";
  }

  const last4 = accountNumber ? String(accountNumber).slice(-4) : "";
  return [bankName, last4 ? `•••• ${last4}` : ""].filter(Boolean).join(" ");
};

module.exports = {
  formatCurrency,
  formatCountLabel,
  formatDateTime,
  formatLocation,
  buildFrontendUrl,
  getUserFirstName,
  getUserDisplayName,
  getPaymentMethodLabel,
  getPayoutDestination,
};
