"use strict";
const asyncHandler = require("../../common/utils/asyncHandler");
const { sendSuccess, sendCreated } = require("../../common/utils/apiResponse");
const { generateInvoicePDF } = require("../../common/utils/generateTicketPDF");
const bookingService = require("./booking.service");

class BookingController {
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.body, req.user);
    sendCreated(res, "Booking created.", { booking });
  });

  getMyBookings = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const result = await bookingService.getMyBookings(userId, req.query);
    sendSuccess(res, "Bookings fetched.", result);
  });

  getBookingByRef = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingByRef(
      req.params.ref,
      req.user,
    );
    sendSuccess(res, "Booking fetched.", { booking });
  });

  cancelBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking(
      req.params.ref,
      req.user,
      req.body.reason,
    );
    sendSuccess(res, "Booking cancelled.", { booking });
  });

  requestRefund = asyncHandler(async (req, res) => {
    const booking = await bookingService.requestRefund(
      req.params.ref,
      req.user,
      req.body.reason,
    );
    sendSuccess(res, "Refund requested.", { booking });
  });

  getBookingTickets = asyncHandler(async (req, res) => {
    const result = await bookingService.getBookingTickets(
      req.params.ref,
      req.user,
    );
    sendSuccess(res, "Tickets fetched.", result);
  });

  getInvoice = asyncHandler(async (req, res) => {
    const invoice = await bookingService.getInvoice(req.params.ref, req.user);
    const pdfBuffer = generateInvoicePDF(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.booking?.bookingRef || req.params.ref}.pdf"`,
    );
    res.status(200).send(pdfBuffer);
  });

  getOrganizerBookings = asyncHandler(async (req, res) => {
    const organizerId = req.user._id || req.user.id;
    const result = await bookingService.getOrganizerBookings(
      organizerId,
      req.query,
    );
    sendSuccess(res, "Organizer bookings fetched.", result);
  });

  checkIn = asyncHandler(async (req, res) => {
    const booking = await bookingService.checkIn(req.params.ref, req.user);
    sendSuccess(res, "Checked in successfully.", { booking });
  });
}

module.exports = new BookingController();
