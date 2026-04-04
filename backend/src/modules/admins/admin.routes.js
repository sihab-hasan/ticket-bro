'use strict';

// admin.routes.js
// NOTE: authenticate + authorize(ROLES.ADMIN) are applied in routes.js
// before this router is mounted — do NOT re-apply here.

const express = require('express');
const router = express.Router();

const { authorize } = require('../../common/middleware/auth.middleware');
const { validateRequest } = require('../../common/middleware/validation.middleware');
const { ROLES } = require('../../common/constants/roles');
const {
  adminReviewFlagSchema,
  adminReviewListQuerySchema,
  reviewIdParamsSchema,
} = require('../reviews/review.validation');

let _ctrl;
const ctrl = () => { if (!_ctrl) _ctrl = require('./admin.controller'); return _ctrl; };

// ── Dashboard & System ────────────────────────────────────────────────────────
// GET /admin/dashboard
router.get('/dashboard',        (req, res, next) => ctrl().getDashboard(req, res, next));
router.get('/dashboard/stats',  (req, res, next) => ctrl().getDashboardStats(req, res, next));

// GET /admin/system/health
router.get('/system/health',    (req, res, next) => ctrl().getSystemHealth(req, res, next));

// GET /admin/system/metrics
router.get('/system/metrics',   (req, res, next) => ctrl().getSystemMetrics(req, res, next));
router.get('/system/settings',  (req, res, next) => ctrl().getSystemSettings(req, res, next));
// Update system settings — restricted to SUPER_ADMIN
router.put('/system/settings', authorize(ROLES.SUPER_ADMIN), (req, res, next) => ctrl().updateSystemSettings(req, res, next));
router.get('/system/logs',      (req, res, next) => ctrl().getSystemLogs(req, res, next));
router.get('/system/sessions',  (req, res, next) => ctrl().getSystemSessions(req, res, next));
// Clearing or revoking system sessions — restricted to SUPER_ADMIN
router.delete('/system/sessions', authorize(ROLES.SUPER_ADMIN), (req, res, next) => ctrl().clearSystemSessions(req, res, next));
router.delete('/system/sessions/:id', authorize(ROLES.SUPER_ADMIN), (req, res, next) => ctrl().revokeSystemSession(req, res, next));
router.get('/system/security-alerts', (req, res, next) => ctrl().getSecurityAlerts(req, res, next));
router.get('/system/audit-logs',      (req, res, next) => ctrl().getAuditLogs(req, res, next));

// ── Feature Flags ─────────────────────────────────────────────────────────────
// GET  /admin/feature-flags
router.get('/feature-flags',    (req, res, next) => ctrl().getFeatureFlags(req, res, next));

// PUT  /admin/feature-flags
// Update feature flags — restricted to SUPER_ADMIN
router.put('/feature-flags', authorize(ROLES.SUPER_ADMIN), (req, res, next) => ctrl().updateFeatureFlags(req, res, next));

// ── User Management ───────────────────────────────────────────────────────────
// GET    /admin/users
router.get('/users',                    (req, res, next) => ctrl().getAllUsers(req, res, next));

// GET    /admin/users/:id
router.get('/users/:id',                (req, res, next) => ctrl().getUserById(req, res, next));

// PATCH  /admin/users/:id
router.patch('/users/:id',              (req, res, next) => ctrl().updateUser(req, res, next));

// DELETE /admin/users/:id
router.delete('/users/:id',             (req, res, next) => ctrl().deleteUser(req, res, next));

// PATCH  /admin/users/:id/ban
router.patch('/users/:id/ban',          (req, res, next) => ctrl().banUser(req, res, next));

// PATCH  /admin/users/:id/unban
router.patch('/users/:id/unban',        (req, res, next) => ctrl().unbanUser(req, res, next));

// PATCH  /admin/users/:id/role
router.patch('/users/:id/role',
  authorize(ROLES.SUPER_ADMIN),         // Only SUPER_ADMIN can change roles
  (req, res, next) => ctrl().changeUserRole(req, res, next));

// ── Organizer Management ──────────────────────────────────────────────────────
// GET    /admin/organizers
router.get('/organizers',               (req, res, next) => ctrl().getAllOrganizers(req, res, next));

// GET    /admin/organizers/:id
router.get('/organizers/:id',           (req, res, next) => ctrl().getOrganizerById(req, res, next));

// PUT    /admin/organizers/:id/verify
router.put('/organizers/:id/verify',    (req, res, next) => ctrl().verifyOrganizer(req, res, next));

// PUT    /admin/organizers/:id/reject
router.put('/organizers/:id/reject',    (req, res, next) => ctrl().rejectOrganizer(req, res, next));

// PUT    /admin/organizers/:id/suspend
router.put('/organizers/:id/suspend',   (req, res, next) => ctrl().suspendOrganizer(req, res, next));

// ── Bookings ──────────────────────────────────────────────────────────────────
// GET    /admin/bookings
router.get('/bookings',                 (req, res, next) => ctrl().getAllBookings(req, res, next));

// PUT    /admin/bookings/:ref/cancel
router.put('/bookings/:ref/cancel',     (req, res, next) => ctrl().cancelBooking(req, res, next));

// PUT    /admin/bookings/:ref/refund
router.put('/bookings/:ref/refund',     (req, res, next) => ctrl().refundBooking(req, res, next));

// ── Payments ──────────────────────────────────────────────────────────────────
// GET    /admin/payments
router.get('/payments',                 (req, res, next) => ctrl().getAllPayments(req, res, next));

// GET    /admin/payments/:id
router.get('/payments/:id',             (req, res, next) => ctrl().getPaymentById(req, res, next));

// POST   /admin/payments/:id/refund
router.post('/payments/:id/refund',     (req, res, next) => ctrl().refundPayment(req, res, next));

// ── Payouts ───────────────────────────────────────────────────────────────────
router.get('/payouts',                  (req, res, next) => ctrl().getPayouts(req, res, next));
router.patch('/payouts/:id',            (req, res, next) => ctrl().updatePayout(req, res, next));

// ── Reviews ───────────────────────────────────────────────────────────────────
// GET    /admin/reviews
router.get('/reviews',                  validateRequest(adminReviewListQuerySchema, 'query'), (req, res, next) => ctrl().getAllReviews(req, res, next));

// DELETE /admin/reviews/:id
router.delete('/reviews/:id',           validateRequest(reviewIdParamsSchema, 'params'), (req, res, next) => ctrl().deleteReview(req, res, next));

// PUT    /admin/reviews/:id/flag
router.put('/reviews/:id/flag',         validateRequest(reviewIdParamsSchema, 'params'), validateRequest(adminReviewFlagSchema), (req, res, next) => ctrl().flagReview(req, res, next));

// ── Analytics ─────────────────────────────────────────────────────────────────
// GET /admin/analytics/overview
router.get('/analytics/overview',       (req, res, next) => ctrl().getAnalyticsOverview(req, res, next));

// GET /admin/analytics/revenue
router.get('/analytics/revenue',        (req, res, next) => ctrl().getRevenueAnalytics(req, res, next));

// GET /admin/analytics/users
router.get('/analytics/users',          (req, res, next) => ctrl().getUserAnalytics(req, res, next));

// GET /admin/analytics/events
router.get('/analytics/events',         (req, res, next) => ctrl().getEventAnalytics(req, res, next));

// GET /admin/analytics/organizers
router.get('/analytics/organizers',     (req, res, next) => ctrl().getOrganizerAnalytics(req, res, next));

// ── Promotions ────────────────────────────────────────────────────────────────
// GET /admin/promotions
router.get('/promotions',               (req, res, next) => ctrl().getAllPromotions(req, res, next));
router.post('/promotions',              (req, res, next) => ctrl().createPromotion(req, res, next));
router.put('/promotions/:id',           (req, res, next) => ctrl().updatePromotion(req, res, next));
router.delete('/promotions/:id',        (req, res, next) => ctrl().deletePromotion(req, res, next));

// PUT /admin/promotions/:id/disable
router.put('/promotions/:id/disable',   (req, res, next) => ctrl().disablePromotion(req, res, next));

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports',                  (req, res, next) => ctrl().getReports(req, res, next));
router.get('/reports/:id',              (req, res, next) => ctrl().getReportById(req, res, next));
router.patch('/reports/:id',            (req, res, next) => ctrl().updateReport(req, res, next));

// ── Events ────────────────────────────────────────────────────────────────────
router.get('/events',                   (req, res, next) => ctrl().getEvents(req, res, next));
router.get('/events/:id',               (req, res, next) => ctrl().getEventById(req, res, next));
router.patch('/events/:id',             (req, res, next) => ctrl().updateEvent(req, res, next));
router.delete('/events/:id',            (req, res, next) => ctrl().deleteEvent(req, res, next));

module.exports = router;
