'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

const env = require('../../config/env');
const User = require('../users/user.model');
const Event = require('../events/event.model');
const Booking = require('../bookings/booking.model');
const Payment = require('../payments/payment.model');
const Promotion = require('../promotions/promotion.model');
const Organizer = require('../organizers/organizer.model');
const Payout = require('../payouts/payout.model');
const Review = require('../reviews/review.model');
const Report = require('../reports/report.model');
const AuditLog = require('../auditLogs/audit.model');
const RefreshToken = require('../../infrastructure/tokens/tokens');
const SystemSetting = require('../systemSettings/systemSetting.model');
const userService = require('../users/user.service');
const bookingService = require('../bookings/booking.service');
const bookingRepository = require('../bookings/booking.repository');
const paymentRepository = require('../payments/payment.repository');
const payoutRepository = require('../payouts/payout.repository');
const eventRepository = require('../events/event.repository');
const emailService = require('../../infrastructure/mail/emailService');
const {
  formatDateTime,
  buildFrontendUrl,
  getPaymentMethodLabel,
} = require('../../infrastructure/mail/templateData');
const {
  BadRequestError,
  NotFoundError,
} = require('../../common/errors/AppError');
const { getRefundSummary } = require('../bookings/booking.policy');

const DEFAULT_SYSTEM_SETTINGS = Object.freeze({
  platformName: 'Ticket Bro',
  platformUrl: env.FRONTEND_URL,
  currency: 'USD',
  commissionRate: 5,
  maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
  registrationEnabled: process.env.REGISTRATION_OPEN !== 'false',
  payoutHoldDays: 7,
  bookingFee: 2.5,
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  smtpHost: env.EMAIL_HOST,
  smtpPort: env.EMAIL_PORT,
  fromEmail: env.EMAIL_FROM_ADDRESS,
  fromName: env.EMAIL_FROM_NAME,
  enableMessaging: true,
  enableReviews: true,
  enableLoyaltyPoints: true,
  enableWaitlist: true,
  enableSeatMap: true,
  enableOAuth: true,
});

const FEATURE_FLAG_KEYS = [
  'enableMessaging',
  'enableReviews',
  'enableLoyaltyPoints',
  'enableWaitlist',
  'enableSeatMap',
  'enableOAuth',
  'maintenanceMode',
  'registrationEnabled',
];

const getId = (user) => user?.id || user?._id?.toString() || user?.userId?.toString();

const growthPercent = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 100);
};

const toDateRange = ({ from, to } = {}) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? range : null;
};

const normalizeBookingStatus = (status) => (status === 'expired' ? 'cancelled' : status);
const normalizePaymentStatus = (status) => (status === 'paid' ? 'succeeded' : status || 'pending');

const serializePaymentForAdmin = (payment) => {
  if (!payment) return payment;
  const source = payment.toObject ? payment.toObject() : payment;
  const ticketCount =
    source.booking?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
  return {
    ...source,
    status: normalizePaymentStatus(source.status),
    rawStatus: source.status,
    paymentMethod: source.paymentMethod?.type || source.gateway || 'stripe',
    gatewayTransactionId: source.gatewayPaymentId || null,
    platformFee: source.platformFee || 0,
    quantity: ticketCount,
    ticketCount,
    booking: source.booking
      ? {
          ...source.booking,
          status: normalizeBookingStatus(source.booking.status),
          rawStatus: source.booking.status,
          paymentStatus: normalizePaymentStatus(source.booking.paymentStatus),
          event: source.event || source.booking.event || null,
          quantity: ticketCount,
          ticketCount,
          refundSummary: getRefundSummary({
            ...source.booking,
            event: source.event || source.booking.event,
          }),
        }
      : null,
    event: source.event
      ? {
          ...source.event,
          venue: source.event.venue || source.event.location || null,
        }
      : null,
  };
};

const serializeBookingForAdmin = (booking) => {
  if (!booking) return booking;
  const source = booking.toObject ? booking.toObject() : booking;
  const ticketCount =
    source.totalTickets ||
    source.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ||
    0;
  return {
    ...source,
    status: normalizeBookingStatus(source.status),
    rawStatus: source.status,
    paymentStatus: normalizePaymentStatus(source.paymentStatus),
    rawPaymentStatus: source.paymentStatus,
    amount: source.totalAmount,
    ticketCount,
    ticketsSold: ticketCount,
    refundSummary: getRefundSummary(source),
  };
};

const serializeEventForAdmin = (event) => {
  if (!event) return event;
  const source = event.toObject ? event.toObject() : event;
  return {
    ...source,
    status: source.status === 'pending' ? 'pending_review' : source.status,
    organizer: source.organizer
      ? {
          ...source.organizer,
          name:
            source.organizer.fullName ||
            `${source.organizer.firstName || ''} ${source.organizer.lastName || ''}`.trim(),
        }
      : null,
    venue: source.location
      ? {
          name: source.location.name,
          city: source.location.city,
          country: source.location.country,
        }
      : null,
    isOnline: source.location?.type === 'online',
    capacity: source.totalCapacity || null,
    ticketsSold: source.totalSold || 0,
    totalRevenue: (source.totalSold || 0) * (source.minPrice || 0),
  };
};

class AdminService {
  async _getSystemSettings() {
    const docs = await SystemSetting.find({
      key: { $in: Object.keys(DEFAULT_SYSTEM_SETTINGS) },
    }).lean();

    return docs.reduce(
      (acc, doc) => ({ ...acc, [doc.key]: doc.value }),
      { ...DEFAULT_SYSTEM_SETTINGS },
    );
  }

  async _updateSystemSettings(data, actor) {
    const updates = Object.entries(data || {});

    await Promise.all(
      updates.map(([key, value]) =>
        SystemSetting.findOneAndUpdate(
          { key },
          { $set: { value, updatedBy: getId(actor) || null } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ),
      ),
    );

    return this._getSystemSettings();
  }

  async _resolveEvent(identifier) {
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier, deletedAt: null }
      : { slug: identifier, deletedAt: null };

    const event = await Event.findOne(query)
      .populate('organizer', 'firstName lastName email avatar')
      .populate('category', 'name slug')
      .lean({ virtuals: true });

    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async _readLogFiles({ search, level, limit = 50 } = {}) {
    const logDir = path.resolve(process.cwd(), env.LOG_FILE_PATH || 'logs');
    if (!fs.existsSync(logDir)) {
      return {
        logs: [],
        total: 0,
        pagination: { total: 0, page: 1, limit: Number(limit), totalPages: 0 },
      };
    }

    const files = fs
      .readdirSync(logDir)
      .filter((file) => file.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 4);

    const entries = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(logDir, file), 'utf8');
      const lines = content.split(/\r?\n/).filter(Boolean).reverse();

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          entries.push({
            level: parsed.level || 'info',
            message: parsed.message || file,
            details: parsed,
            service: parsed.service || 'backend',
            timestamp: parsed.timestamp || parsed.createdAt || new Date().toISOString(),
          });
        } catch {
          entries.push({
            level: file.startsWith('error-') ? 'error' : 'info',
            message: line,
            details: line,
            service: 'backend',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    const filtered = entries.filter((entry) => {
      const matchesLevel = level ? entry.level === level : true;
      const haystack = `${entry.message} ${entry.service}`.toLowerCase();
      const matchesSearch = search ? haystack.includes(String(search).toLowerCase()) : true;
      return matchesLevel && matchesSearch;
    });

    return {
      logs: filtered.slice(0, Number(limit)),
      total: filtered.length,
      pagination: {
        total: filtered.length,
        page: 1,
        limit: Number(limit),
        totalPages: Math.ceil(filtered.length / Number(limit || 1)),
      },
    };
  }

  async _getSecurityAlerts() {
    const now = new Date();

    const [lockedUsers, suspendedUsers, bannedUsers, recentRoleChanges] = await Promise.all([
      User.find({ deletedAt: null, lockUntil: { $gt: now } })
        .select('firstName lastName email lockUntil')
        .sort({ lockUntil: -1 })
        .limit(10)
        .lean(),
      User.find({ deletedAt: null, status: 'suspended' })
        .select('firstName lastName email statusUpdatedAt statusReason')
        .sort({ statusUpdatedAt: -1 })
        .limit(10)
        .lean(),
      User.find({ deletedAt: null, status: 'banned' })
        .select('firstName lastName email statusUpdatedAt statusReason')
        .sort({ statusUpdatedAt: -1 })
        .limit(10)
        .lean(),
      AuditLog.find({ action: 'user.role.changed' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return [
      ...lockedUsers.map((user) => ({
        _id: `locked-${user._id}`,
        severity: 'high',
        title: 'Temporarily locked account detected',
        description: `${user.firstName} ${user.lastName} is locked until ${user.lockUntil?.toISOString?.() || ''}`,
        createdAt: user.lockUntil || now,
        resolved: false,
      })),
      ...suspendedUsers.map((user) => ({
        _id: `suspended-${user._id}`,
        severity: 'medium',
        title: 'Suspended user account',
        description: `${user.firstName} ${user.lastName} is suspended${user.statusReason ? `: ${user.statusReason}` : ''}`,
        createdAt: user.statusUpdatedAt || now,
        resolved: false,
      })),
      ...bannedUsers.map((user) => ({
        _id: `banned-${user._id}`,
        severity: 'critical',
        title: 'Banned user account',
        description: `${user.firstName} ${user.lastName} is banned${user.statusReason ? `: ${user.statusReason}` : ''}`,
        createdAt: user.statusUpdatedAt || now,
        resolved: false,
      })),
      ...recentRoleChanges.map((log) => ({
        _id: `role-change-${log._id}`,
        severity: 'low',
        title: 'Role change recorded',
        description: `${log.userEmail || 'Staff'} updated a user role`,
        createdAt: log.createdAt,
        resolved: true,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalEvents,
      eventsThisMonth,
      eventsLastMonth,
      totalBookings,
      bookingsThisMonth,
      bookingsLastMonth,
      paidPayments,
      paidPaymentsThisMonth,
      paidPaymentsLastMonth,
      pendingOrganizers,
      openReports,
      pendingPayouts,
      pendingPayoutAmountAgg,
      pendingEvents,
      activeSessions,
      recentUsers,
      recentEvents,
      alerts,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ deletedAt: null, createdAt: { $gte: monthStart } }),
      User.countDocuments({ deletedAt: null, createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Event.countDocuments({ deletedAt: null }),
      Event.countDocuments({ deletedAt: null, createdAt: { $gte: monthStart } }),
      Event.countDocuments({ deletedAt: null, createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Booking.countDocuments({ deletedAt: null }),
      Booking.countDocuments({ deletedAt: null, createdAt: { $gte: monthStart } }),
      Booking.countDocuments({ deletedAt: null, createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Payment.aggregate([
        { $match: { deletedAt: null, status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { deletedAt: null, status: 'succeeded', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { deletedAt: null, status: 'succeeded', createdAt: { $gte: previousMonthStart, $lt: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Organizer.countDocuments({ deletedAt: null, verificationStatus: 'pending' }),
      Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      Payout.countDocuments({ deletedAt: null, status: 'pending' }),
      Payout.aggregate([
        { $match: { deletedAt: null, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Event.countDocuments({ deletedAt: null, status: 'pending' }),
      RefreshToken.countDocuments({ isRevoked: false, expiresAt: { $gt: now } }),
      User.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('firstName lastName email role avatar status isEmailVerified createdAt')
        .lean(),
      Event.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('organizer', 'firstName lastName email')
        .populate('category', 'name slug')
        .lean({ virtuals: true }),
      this._getSecurityAlerts(),
    ]);

    const totalRevenue = paidPayments[0]?.total || 0;
    const monthRevenue = paidPaymentsThisMonth[0]?.total || 0;
    const lastMonthRevenue = paidPaymentsLastMonth[0]?.total || 0;
    const weekRevenueAgg = await Payment.aggregate([
      { $match: { deletedAt: null, status: 'succeeded', createdAt: { $gte: weekStart } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, total: { $sum: '$amount' } } },
    ]);

    const revenueWeekly = Array.from({ length: 7 }, (_, index) => {
      const dayOfWeek = ((weekStart.getDay() + index) % 7) + 1;
      const match = weekRevenueAgg.find((entry) => entry._id === dayOfWeek);
      return Math.round(match?.total || 0);
    });

    const totalRefunds = await Payment.aggregate([
      { $match: { deletedAt: null, status: 'refunded' } },
      { $group: { _id: null, total: { $sum: '$refundAmount' } } },
    ]).then((rows) => rows[0]?.total || 0);

    const stats = {
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      monthRevenue,
      weekRevenue: revenueWeekly.reduce((sum, value) => sum + value, 0),
      revenueWeekly,
      totalRefunds,
      pendingOrganizers,
      openReports,
      pendingPayouts,
      pendingPayoutAmount: pendingPayoutAmountAgg[0]?.total || 0,
      pendingEvents,
      activeSessions,
      criticalAlerts: alerts.filter((alert) => !alert.resolved && alert.severity === 'critical').length,
      userGrowth: growthPercent(usersThisMonth, usersLastMonth),
      eventGrowth: growthPercent(eventsThisMonth, eventsLastMonth),
      bookingGrowth: growthPercent(bookingsThisMonth, bookingsLastMonth),
      revenueGrowth: growthPercent(monthRevenue, lastMonthRevenue),
      uptime: 99.9,
      apiSuccessRate: 99.2,
      avgFillRate: totalEvents
        ? Math.round(
            (recentEvents.reduce((sum, event) => sum + (event.totalSold || 0), 0) /
              Math.max(recentEvents.reduce((sum, event) => sum + (event.totalCapacity || 0), 0), 1)) *
              100,
          )
        : 0,
      paymentSuccessRate: 97.5,
      queueJobs: pendingPayouts + openReports + pendingEvents,
    };

    return {
      stats,
      recentUsers,
      recentEvents: recentEvents.map((event) => serializeEventForAdmin(event)),
    };
  }

  async getDashboardStats() {
    const dashboard = await this.getDashboard();
    return dashboard.stats;
  }

  async getSystemHealth() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const memoryUsage = totalMem ? Math.round((memUsage.rss / totalMem) * 100) : 0;
    const cpuUsage = Math.min(100, Math.round(((os.loadavg?.()[0] || 0) / Math.max(os.cpus().length, 1)) * 100));
    const dbHealthy = mongoose.connection.readyState === 1;
    const recentErrors = await this._readLogFiles({ level: 'error', limit: 5 });

    return {
      uptime: Math.round(process.uptime() / 60),
      cpuUsage,
      memoryUsage,
      requestsPerMinute: 0,
      api: 'healthy',
      apiLatency: 25,
      database: dbHealthy ? 'healthy' : 'down',
      dbLatency: dbHealthy ? 12 : 0,
      cache: 'healthy',
      cacheLatency: 4,
      email: env.EMAIL_HOST ? 'healthy' : 'degraded',
      payment: process.env.STRIPE_SECRET_KEY ? 'healthy' : 'degraded',
      storage: 'healthy',
      recentErrors: recentErrors.logs.map((entry) => ({
        message: entry.message,
        time: entry.timestamp,
      })),
    };
  }

  async getSystemMetrics() {
    const health = await this.getSystemHealth();
    return {
      ...health,
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      cpu: os.cpus()?.[0]?.model || 'unknown',
      loadAverage: os.loadavg(),
    };
  }

  async getFeatureFlags() {
    const settings = await this._getSystemSettings();
    return FEATURE_FLAG_KEYS.reduce((acc, key) => ({ ...acc, [key]: settings[key] }), {});
  }

  async updateFeatureFlags(data, actor) {
    const current = await this._getSystemSettings();
    const next = FEATURE_FLAG_KEYS.reduce((acc, key) => {
      if (Object.prototype.hasOwnProperty.call(data || {}, key)) {
        acc[key] = Boolean(data[key]);
      }
      return acc;
    }, {});

    return this._updateSystemSettings({ ...current, ...next }, actor);
  }

  async getUsers(query) {
    const result = await userService.getAllUsers(query);
    return { ...result, total: result.pagination?.total || 0 };
  }

  async getUserById(id) {
    return userService.getUserById(id, { includeInactive: true });
  }

  async updateUser(id, data) {
    return userService.adminUpdateUser(id, data);
  }

  async deleteUser(id) {
    return userService.hardDeleteUser(id);
  }

  async banUser(id, actor, reason = '') {
    return userService.setUserStatus(id, 'banned', actor, reason);
  }

  async unbanUser(id, actor) {
    return userService.setUserStatus(id, 'active', actor);
  }

  async changeUserRole(id, role, actor) {
    return userService.changeRole(id, role, actor);
  }

  async getAllOrganizers({ page = 1, limit = 20, verificationStatus, search } = {}) {
    const filter = { deletedAt: null };
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ displayName: re }, { email: re }, { phone: re }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [organizers, total] = await Promise.all([
      Organizer.find(filter)
        .populate('user', 'firstName lastName email avatar role status isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Organizer.countDocuments(filter),
    ]);

    return {
      organizers,
      total,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getOrganizerById(id) {
    const organizer = await Organizer.findOne({ _id: id, deletedAt: null })
      .populate('user', 'firstName lastName email avatar role status isActive')
      .lean();

    if (!organizer) throw new NotFoundError('Organizer not found.');
    return organizer;
  }

  async verifyOrganizer(id) {
    const organizer = await Organizer.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { verificationStatus: 'verified', verifiedAt: new Date() } },
      { new: true },
    )
      .populate('user', 'firstName lastName email avatar role status isActive')
      .lean();

    if (!organizer) throw new NotFoundError('Organizer not found.');

    if (organizer.user?.email) {
      await emailService.sendOrganizerApprovedEmail({
        to: organizer.user.email,
        firstName: organizer.user.firstName,
        dashboardUrl: buildFrontendUrl('/organizer/dashboard'),
      });
    }

    return organizer;
  }

  async rejectOrganizer(id, reason = '') {
    const organizer = await Organizer.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { verificationStatus: 'rejected', rejectionReason: reason } },
      { new: true },
    )
      .populate('user', 'firstName lastName email avatar role status isActive')
      .lean();

    if (!organizer) throw new NotFoundError('Organizer not found.');

    if (organizer.user?.email) {
      await emailService.sendOrganizerRejectedEmail({
        to: organizer.user.email,
        firstName: organizer.user.firstName,
        reason,
        dashboardUrl: buildFrontendUrl('/organizer/settings'),
      });
    }

    return organizer;
  }

  async suspendOrganizer(id, actor, reason = '') {
    const organizer = await Organizer.findOne({ _id: id, deletedAt: null }).lean();
    if (!organizer) throw new NotFoundError('Organizer not found.');

    await Organizer.findByIdAndUpdate(id, { $set: { isActive: false } });
    await userService.setUserStatus(
      organizer.user,
      'suspended',
      actor,
      reason || 'Organizer suspended by admin',
    );

    return this.getOrganizerById(id);
  }

  async getAllBookings(query) {
    const result = await bookingRepository.findAll(query);
    return {
      ...result,
      bookings: result.bookings.map((booking) => serializeBookingForAdmin(booking)),
      total: result.pagination?.total || 0,
    };
  }

  async cancelBooking(ref, actor, reason = '') {
    const updated = await bookingService.cancelBooking(ref, actor, reason, {
      bypassOwnership: true,
      forceFullRefund: true,
    });

    return serializeBookingForAdmin(updated);
  }

  async refundBooking(ref, actor, reason = '') {
    const updated = await bookingService.refundBooking(ref, actor, reason, {
      bypassOwnership: true,
      forceFullRefund: true,
    });

    return serializeBookingForAdmin(updated);
  }

  async getAllPayments(query) {
    const result = await paymentRepository.findAll(query);
    return {
      ...result,
      payments: result.payments.map((payment) => serializePaymentForAdmin(payment)),
      total: result.pagination?.total || 0,
    };
  }

  async getPaymentById(id) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Payment not found.');
    return serializePaymentForAdmin(payment);
  }

  async refundPayment(id, actor, reason = '') {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Payment not found.');

    if (!payment.booking?.bookingRef) {
      throw new BadRequestError('Payment is not linked to a booking.');
    }

    await bookingService.refundBooking(payment.booking.bookingRef, actor, reason, {
      bypassOwnership: true,
      forceFullRefund: true,
    });

    const updated = await paymentRepository.findById(id);
    return serializePaymentForAdmin(updated);
  }

  async getAllReviews({ page = 1, limit = 20, search, reported, sort = '-createdAt' } = {}) {
    const filter = { deletedAt: null };
    if (reported !== undefined && reported !== '') {
      filter.reported = reported === 'true' || reported === true;
    }
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ title: re }, { body: re }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate('user', 'firstName lastName email avatar')
          .populate('event', 'title slug')
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async deleteReview(id) {
    const review = await Review.findOne({ _id: id, deletedAt: null }).lean();
    if (!review) throw new NotFoundError('Review not found.');

    await Review.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(), isPublished: false },
    });

    return { id };
  }

  async flagReview(id, flagged = true) {
    const review = await Review.findByIdAndUpdate(
      id,
      { $set: { reported: flagged } },
      { new: true },
    );

    if (!review) throw new NotFoundError('Review not found.');
    return review;
  }

  async getAnalyticsOverview() {
    const [users, events, bookings, payments] = await Promise.all([
      userService.getUserStats(),
      eventRepository.getStats(),
      bookingRepository.getStats(),
      paymentRepository.getStats(),
    ]);

    return { users, events, bookings, payments };
  }

  async getRevenueAnalytics() {
    const stats = await this.getDashboardStats();
    return {
      totalRevenue: stats.totalRevenue,
      monthRevenue: stats.monthRevenue,
      weekRevenue: stats.weekRevenue,
      revenueGrowth: stats.revenueGrowth,
      revenueWeekly: stats.revenueWeekly,
    };
  }

  async getUserAnalytics() {
    return userService.getUserStats();
  }

  async getEventAnalytics() {
    return eventRepository.getStats();
  }

  async getOrganizerAnalytics() {
    const verified = await Organizer.countDocuments({ deletedAt: null, verificationStatus: 'verified' });
    const pending = await Organizer.countDocuments({ deletedAt: null, verificationStatus: 'pending' });
    const rejected = await Organizer.countDocuments({ deletedAt: null, verificationStatus: 'rejected' });

    return { total: verified + pending + rejected, verified, pending, rejected };
  }

  async getAllPromotions({ page = 1, limit = 20, search } = {}) {
    const filter = { deletedAt: null };
    if (search) filter.code = new RegExp(search, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const [promotions, total] = await Promise.all([
      Promotion.find(filter)
        .populate('organizer', 'firstName lastName email')
        .populate('event', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Promotion.countDocuments(filter),
    ]);

    return {
      promotions: promotions.map((promotion) => ({
        ...promotion,
        expiresAt: promotion.endDate || null,
        minOrderValue: promotion.minAmount || 0,
      })),
      total,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async createPromotion(data, actor) {
    const code = String(data.code || '').trim().toUpperCase();
    if (!code) throw new BadRequestError('Promotion code is required.');

    const promotion = await Promotion.create({
      organizer: data.organizerId || getId(actor),
      event: data.eventId || null,
      code,
      type: data.type,
      value: data.value,
      maxUses: data.maxUses || null,
      minAmount: data.minOrderValue || data.minAmount || 0,
      endDate: data.expiresAt || data.endDate || null,
      isActive: data.isActive !== false,
    });

    return promotion.toObject();
  }

  async updatePromotion(id, data) {
    const patch = {};
    if (data.code !== undefined) patch.code = String(data.code).trim().toUpperCase();
    if (data.type !== undefined) patch.type = data.type;
    if (data.value !== undefined) patch.value = data.value;
    if (data.maxUses !== undefined) patch.maxUses = data.maxUses;
    if (data.minOrderValue !== undefined || data.minAmount !== undefined) patch.minAmount = data.minOrderValue ?? data.minAmount;
    if (data.expiresAt !== undefined || data.endDate !== undefined) patch.endDate = data.expiresAt ?? data.endDate;
    if (data.isActive !== undefined) patch.isActive = data.isActive;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true },
    );

    if (!promotion) throw new NotFoundError('Promotion not found.');
    return promotion.toObject();
  }

  async deletePromotion(id) {
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
    );

    if (!promotion) throw new NotFoundError('Promotion not found.');
    return { id };
  }

  async disablePromotion(id) {
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!promotion) throw new NotFoundError('Promotion not found.');
    return promotion.toObject();
  }

  async getReports({ page = 1, limit = 20, search, status, type, priority } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.entityType = type;
    if (search) {
      filter.$or = [{ reason: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reportedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Report.countDocuments(filter),
    ]);

    return {
      reports: reports.map((report) => ({
        ...report,
        type: report.entityType,
        reporter: report.reportedBy,
        targetId: report.entityId,
        targetTitle: report.reason,
        priority:
          priority ||
          (report.reason === 'fraud'
            ? 'high'
            : ['spam', 'fake', 'misleading'].includes(report.reason)
            ? 'medium'
            : 'low'),
      })),
      total,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getReportById(id) {
    const report = await Report.findById(id)
      .populate('reportedBy', 'firstName lastName email')
      .lean();

    if (!report) throw new NotFoundError('Report not found.');

    return {
      ...report,
      type: report.entityType,
      reporter: report.reportedBy,
      targetId: report.entityId,
      targetTitle: report.reason,
      priority:
        report.reason === 'fraud'
          ? 'high'
          : ['spam', 'fake', 'misleading'].includes(report.reason)
          ? 'medium'
          : 'low',
    };
  }

  async updateReport(id, data) {
    const report = await Report.findByIdAndUpdate(
      id,
      {
        $set: {
          status: data.status || 'resolved',
          resolution: data.status || 'resolved',
          resolutionNote: data.note || null,
          reviewedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    if (!report) throw new NotFoundError('Report not found.');
    return report;
  }

  async getSystemSettings() {
    return this._getSystemSettings();
  }

  async updateSystemSettings(data, actor) {
    return this._updateSystemSettings(data, actor);
  }

  async getSystemLogs(query = {}) {
    return this._readLogFiles(query);
  }

  async getSystemSessions({ page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { isRevoked: false, expiresAt: { $gt: new Date() } };

    const [sessions, total] = await Promise.all([
      RefreshToken.find(filter)
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      RefreshToken.countDocuments(filter),
    ]);

    return {
      sessions: sessions.map((session) => ({
        _id: session._id,
        ipAddress: session.ipAddress,
        device: session.deviceInfo || session.userAgent,
        lastActiveAt: session.lastUsedAt || session.createdAt,
        createdAt: session.createdAt,
        user: session.userId
          ? {
              _id: session.userId._id,
              firstName: session.userId.firstName,
              lastName: session.userId.lastName,
              email: session.userId.email,
              role: session.userId.role,
            }
          : null,
      })),
      total,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async revokeSystemSession(id) {
    const session = await RefreshToken.findById(id);
    if (!session) throw new NotFoundError('Session not found.');
    await session.revoke('security');
    return { id };
  }

  async clearSystemSessions() {
    await RefreshToken.updateMany(
      { isRevoked: false, expiresAt: { $gt: new Date() } },
      { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: 'security' } },
    );

    return { cleared: true };
  }

  async getSecurityAlerts() {
    const alerts = await this._getSecurityAlerts();
    return { alerts };
  }

  async getAuditLogs({ page = 1, limit = 20, userId, action, from, to } = {}) {
    const filter = {};
    const dateRange = toDateRange({ from, to });
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (dateRange) filter.createdAt = dateRange;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs: logs.map((log) => ({
        ...log,
        actor: {
          firstName: log.userEmail?.split('@')[0] || 'System',
          lastName: '',
          email: log.userEmail || null,
          role: log.userRole || null,
        },
        target: log.resource,
        targetId: log.resourceId,
      })),
      total,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getPayouts(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.organizer) filter.organizer = query.organizer;
    const result = await payoutRepository.findAll(filter, query.page, query.limit);
    return { ...result, total: result.pagination?.total || 0 };
  }

  async updatePayout(id, data, actor) {
    const status = data.status === 'approved' ? 'processing' : data.status;
    const payout = await payoutRepository.updateById(id, {
      status,
      processedAt: ['processing', 'completed'].includes(status) ? new Date() : undefined,
      processedBy: getId(actor),
      notes: data.notes,
    });

    if (!payout) throw new NotFoundError('Payout not found.');
    return payout.toObject ? payout.toObject() : payout;
  }

  async getEvents(query = {}) {
    const result = await eventRepository.findAll({
      page: query.page,
      limit: query.limit,
      status: query.status === 'pending_review' ? 'pending' : query.status,
      search: query.search,
      category: query.category,
      from: query.from,
      to: query.to,
      sort: query.sort || '-createdAt',
    });

    return {
      ...result,
      events: result.events.map((event) => serializeEventForAdmin(event)),
      total: result.pagination?.total || 0,
    };
  }

  async getEventByIdentifier(identifier) {
    const event = await this._resolveEvent(identifier);
    return serializeEventForAdmin(event);
  }

  async updateEvent(identifier, data, actor) {
    const existingEvent = await this._resolveEvent(identifier);
    const patch = {};

    if (data.status) {
      patch.status = data.status === 'pending_review' ? 'pending' : data.status;

      if (patch.status === 'published') {
        patch.publishedAt = new Date();
        patch.moderatedAt = new Date();
        patch.moderatedBy = getId(actor);
        patch.rejectionReason = '';
      }

      if (patch.status === 'rejected') {
        patch.moderatedAt = new Date();
        patch.moderatedBy = getId(actor);
        patch.rejectionReason = data.reason || data.rejectionReason || '';
      }

      if (patch.status === 'cancelled') {
        patch.cancelledAt = new Date();
      }
    }

    if (typeof data.isFeatured === 'boolean') {
      patch.isFeatured = data.isFeatured;
    }

    if (typeof data.isTrending === 'boolean') {
      patch.isTrending = data.isTrending;
    }

    if (data.visibility) {
      patch.visibility = data.visibility;
    }

    const updated = await Event.findByIdAndUpdate(
      existingEvent._id,
      { $set: patch },
      { new: true },
    )
      .populate('organizer', 'firstName lastName email avatar')
      .populate('category', 'name slug')
      .lean({ virtuals: true });

    return serializeEventForAdmin(updated);
  }

  async deleteEvent(identifier) {
    const existingEvent = await this._resolveEvent(identifier);
    await Event.findByIdAndUpdate(existingEvent._id, {
      $set: { deletedAt: new Date(), status: 'cancelled' },
    });

    return { id: existingEvent._id };
  }
}

module.exports = new AdminService();
