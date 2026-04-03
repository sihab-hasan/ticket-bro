'use strict';
const bookingRepository = require('./booking.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');

const getId = (user) => user?.id || user?._id?.toString() || user?.userId;

class BookingService {

  async createBooking(data, user) {
    const { eventId, items, contactName, contactEmail, contactPhone, promoCode, cartId } = data;
    if (!items || !items.length) throw new BadRequestError('Booking must have at least one item.');

    const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    const totalAmount = subtotal; // promotions applied separately

    const booking = await bookingRepository.create({
      user:         getId(user),
      event:        eventId,
      items,
      subtotal,
      totalAmount,
      currency:     data.currency || 'USD',
      contactName,
      contactEmail: contactEmail || user.email,
      contactPhone,
      promoCode,
      cartId,
      status:       'pending',
      paymentStatus:'pending',
    });

    logger.info(`Booking created: ${booking.bookingRef} by user ${getId(user)}`);
    return booking;
  }

  async getMyBookings(userId, query = {}) {
    return bookingRepository.findByUserId({ userId, ...query });
  }

  async getBookingByRef(bookingRef, user) {
    const isAdminOrOrganizer = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORGANIZER].includes(user.role);
    const userId = isAdminOrOrganizer ? null : getId(user);
    const booking = await bookingRepository.findByRef(bookingRef, userId);
    if (!booking) throw new NotFoundError('Booking not found.');
    return booking;
  }

  async cancelBooking(bookingRef, user, reason = '') {
    const booking = await bookingRepository.findByRef(bookingRef, getId(user));
    if (!booking) throw new NotFoundError('Booking not found.');
    if (!booking.isCancellable) throw new BadRequestError(`Booking cannot be cancelled in status: ${booking.status}`);

    const updated = await bookingRepository.updateByRef(bookingRef, {
      status:      'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
      cancelledBy: getId(user),
    });
    logger.info(`Booking cancelled: ${bookingRef} by user ${getId(user)}`);
    return updated;
  }

  async requestRefund(bookingRef, user, reason = '') {
    const booking = await bookingRepository.findByRef(bookingRef, getId(user));
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.status !== 'cancelled') throw new BadRequestError('Only cancelled bookings can be refunded.');
    if (booking.refundRequested) throw new BadRequestError('Refund already requested.');

    const updated = await bookingRepository.updateByRef(bookingRef, { refundRequested: true });
    return updated;
  }

  async getBookingTickets(bookingRef, user) {
    const booking = await bookingRepository.findByRef(bookingRef, getId(user));
    if (!booking) throw new NotFoundError('Booking not found.');
    return { tickets: booking.items || [] };
  }

  async getInvoice(bookingRef, user) {
    const booking = await this.getBookingByRef(bookingRef, user);
    return {
      invoiceRef:   `INV-${booking.bookingRef}`,
      booking,
      issuedAt:     new Date().toISOString(),
    };
  }

  async getOrganizerBookings(organizerId, query = {}) {
    return bookingRepository.findByOrganizer({ organizerId, ...query });
  }

  async checkIn(bookingRef, staffUser) {
    const booking = await bookingRepository.findByRef(bookingRef);
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.status === 'checked_in') throw new BadRequestError('Already checked in.');
    if (booking.status !== 'confirmed') throw new BadRequestError('Only confirmed bookings can be checked in.');

    const updated = await bookingRepository.updateByRef(bookingRef, {
      status:      'checked_in',
      checkedInAt: new Date(),
      checkedInBy: getId(staffUser),
    });
    logger.info(`Check-in: ${bookingRef} by ${getId(staffUser)}`);
    return updated;
  }

  async confirmBooking(bookingRef, paymentId = null) {
    const update = {
      status: 'confirmed',
      paymentStatus: 'paid',
      paidAt: new Date(),
    };

    if (paymentId) {
      update.payment = paymentId;
    }

    return bookingRepository.updateByRef(bookingRef, update);
  }

  async getStats() {
    return bookingRepository.getStats();
  }
}

module.exports = new BookingService();
