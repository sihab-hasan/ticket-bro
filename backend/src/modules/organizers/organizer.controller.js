'use strict';

const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const { NotFoundError } = require('../../common/errors/AppError');

const getId = (user) => user?.id || user?._id || user?.userId;

class OrganizerController {
  getPublicProfile = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const profile = await organizerService.getPublicProfile(req.params.slug);
    if (!profile) throw new NotFoundError('Organizer not found.');
    sendSuccess(res, 'Organizer profile fetched.', profile);
  });

  getPublicEvents = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const events = await organizerService.getPublicEvents(req.params.slug, req.query);
    sendSuccess(res, 'Organizer events fetched.', events);
  });

  getOwnProfile = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const profile = await organizerService.getOwnProfile(getId(req.user));
    sendSuccess(res, 'Profile fetched.', profile);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const profile = await organizerService.updateProfile(getId(req.user), req.body);
    sendSuccess(res, 'Profile updated.', profile);
  });

  submitVerification = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const result = await organizerService.submitVerification(getId(req.user), req.body);
    sendCreated(res, 'Verification submitted.', result);
  });

  getVerificationStatus = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const status = await organizerService.getVerificationStatus(getId(req.user));
    sendSuccess(res, 'Verification status fetched.', status);
  });

  getDashboard = asyncHandler(async (req, res) => {
    const analyticsService = require('../analytics/analytics.service');
    const organizerService = require('./organizer.service');
    const [profile, overview] = await Promise.all([
      organizerService.getOwnProfile(getId(req.user)),
      analyticsService.getOverview(getId(req.user)),
    ]);
    sendSuccess(res, 'Dashboard data.', { profile, overview });
  });

  getMyEvents = asyncHandler(async (req, res) => {
    const eventService = require('../events/event.service');
    const events = await eventService.getOrganizerEvents(getId(req.user), req.query);
    sendSuccess(res, 'Events fetched.', events);
  });

  getMyBookings = asyncHandler(async (req, res) => {
    const bookingService = require('../bookings/booking.service');
    const bookings = await bookingService.getOrganizerBookings(getId(req.user), req.query);
    sendSuccess(res, 'Bookings fetched.', bookings);
  });

  getRevenue = asyncHandler(async (req, res) => {
    const analyticsService = require('../analytics/analytics.service');
    const revenue = await analyticsService.getRevenue(getId(req.user), req.query);
    sendSuccess(res, 'Revenue data.', revenue);
  });

  getPayouts = asyncHandler(async (req, res) => {
    const payoutService = require('../payouts/payout.service');
    const payouts = await payoutService.getMyPayouts(getId(req.user), req.query);
    sendSuccess(res, 'Payouts fetched.', payouts);
  });

  // ── POST /organizer/images/logo ──────────────────────────────────────────────
  uploadLogo = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No logo uploaded. Send multipart/form-data with the "logo" field.',
      });
    }
    const organizer = await organizerService.uploadLogo(getId(req.user), req.file);
    sendSuccess(res, 'Logo updated.', { organizer });
  });

  // ── DELETE /organizer/images/logo ────────────────────────────────────────────
  removeLogo = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const organizer = await organizerService.removeLogo(getId(req.user));
    sendSuccess(res, 'Logo removed.', { organizer });
  });

  // ── POST /organizer/images/banner ────────────────────────────────────────────
  uploadBanner = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No banner uploaded. Send multipart/form-data with the "banner" field.',
      });
    }
    const organizer = await organizerService.uploadBanner(getId(req.user), req.file);
    sendSuccess(res, 'Banner updated.', { organizer });
  });

  // ── DELETE /organizer/images/banner ──────────────────────────────────────────
  removeBanner = asyncHandler(async (req, res) => {
    const organizerService = require('./organizer.service');
    const organizer = await organizerService.removeBanner(getId(req.user));
    sendSuccess(res, 'Banner removed.', { organizer });
  });
}

module.exports = new OrganizerController();
