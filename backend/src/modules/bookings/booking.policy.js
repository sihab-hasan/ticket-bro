'use strict';

const DAY_MS = 24 * 60 * 60 * 1000;

const roundCurrency = (amount) => Math.round(Number(amount || 0) * 100) / 100;

const getRefundPolicy = ({ startDate, totalAmount }) => {
  const total = roundCurrency(totalAmount);

  if (!startDate || !total) {
    return {
      percentage: 0,
      amount: 0,
      label: 'No refund available',
      isRefundable: false,
    };
  }

  const now = new Date();
  const eventDate = new Date(startDate);
  const daysUntilEvent = (eventDate.getTime() - now.getTime()) / DAY_MS;

  if (Number.isNaN(eventDate.getTime()) || daysUntilEvent < 0) {
    return {
      percentage: 0,
      amount: 0,
      label: 'No refund after the event starts',
      isRefundable: false,
    };
  }

  if (daysUntilEvent >= 7) {
    return {
      percentage: 90,
      amount: roundCurrency(total * 0.9),
      label: '90% refund (7+ days before event)',
      isRefundable: true,
    };
  }

  if (daysUntilEvent >= 2) {
    return {
      percentage: 50,
      amount: roundCurrency(total * 0.5),
      label: '50% refund (2-7 days before event)',
      isRefundable: true,
    };
  }

  return {
    percentage: 0,
    amount: 0,
    label: 'No refund within 48 hours of the event',
    isRefundable: false,
  };
};

const getRefundSummary = (booking) => {
  const policy = getRefundPolicy({
    startDate: booking?.event?.startDate,
    totalAmount: booking?.totalAmount,
  });

  if (booking?.paymentStatus === 'refunded') {
    return `Refunded ${policy.amount ? `${policy.amount} ${booking.currency || 'USD'}` : 'per policy'}.`;
  }

  return policy.label;
};

module.exports = {
  DAY_MS,
  getRefundPolicy,
  getRefundSummary,
  roundCurrency,
};
