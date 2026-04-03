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
}

module.exports = new OrganizerController();
