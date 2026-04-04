'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const bookingService = require('./booking.service');
const waitlistService = require('./waitlist.service');

class BookingController {
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.body, req.user);
    sendCreated(res, 'Booking created.', { booking });
  });

  getMyBookings = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const result = await bookingService.getMyBookings(userId, req.query);
    sendSuccess(res, 'Bookings fetched.', result);
  });

  getBookingByRef = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingByRef(req.params.ref, req.user);
    sendSuccess(res, 'Booking fetched.', { booking });
  });

  cancelBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.params.ref, req.user, req.body.reason);
    sendSuccess(res, 'Booking cancelled.', { booking });
  });

  requestRefund = asyncHandler(async (req, res) => {
    const booking = await bookingService.requestRefund(req.params.ref, req.user, req.body.reason);
    sendSuccess(res, 'Refund requested.', { booking });
  });

  getBookingTickets = asyncHandler(async (req, res) => {
    const result = await bookingService.getBookingTickets(req.params.ref, req.user);
    sendSuccess(res, 'Tickets fetched.', result);
  });

  getInvoice = asyncHandler(async (req, res) => {
    const invoice = await bookingService.getInvoice(req.params.ref, req.user);
    sendSuccess(res, 'Invoice fetched.', { invoice });
  });

  getOrganizerBookings = asyncHandler(async (req, res) => {
    const organizerId = req.user._id || req.user.id;
    const result = await bookingService.getOrganizerBookings(organizerId, req.query);
    sendSuccess(res, 'Organizer bookings fetched.', result);
  });

  checkIn = asyncHandler(async (req, res) => {
    const booking = await bookingService.checkIn(req.params.ref, req.user);
    sendSuccess(res, 'Checked in successfully.', { booking });
  });

  joinWaitlist = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const entry = await waitlistService.join(userId, {
      eventId: req.params.eventId,
      ticketTypeId: req.body?.ticketTypeId,
      quantity: req.body?.quantity || 1,
    });
    sendCreated(res, 'Joined waitlist.', { waitlist: entry });
  });

  leaveWaitlist = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const result = await waitlistService.leave(userId, req.params.eventId);
    sendSuccess(res, 'Waitlist entry removed.', result);
  });

  getWaitlistStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const result = await waitlistService.getPosition(userId, req.params.eventId);
    sendSuccess(res, 'Waitlist status fetched.', result);
  });
}


module.exports = new BookingController();
