'use strict';
const bookingRepository = require('./booking.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');
const emailService = require('../../infrastructure/mail/emailService');
const {
  formatDateTime,
  formatLocation,
  buildFrontendUrl,
  getUserFirstName,
} = require('../../infrastructure/mail/templateData');

// Additional dependencies for inventory and event lookups
const Event = require('../events/event.model');
const ticketRepository = require('../tickets/ticket.repository');
const ticketService = require('../tickets/ticket.service');

const getId = (user) => user?.id || user?._id?.toString() || user?.userId;

class BookingService {

  async createBooking(data, user) {
    const { eventId, items, contactName, contactEmail, contactPhone, promoCode, cartId } = data;
    if (!items || !items.length) {
      throw new BadRequestError('Booking must have at least one item.');
    }
    // Fetch event to ensure it exists and retrieve organizer
    const event = await Event.findById(eventId).select('organizer status title').exec();
    if (!event) {
      throw new NotFoundError('Event not found.');
    }
    // Only allow bookings on published events
    if (!['published'].includes(event.status)) {
      throw new BadRequestError('Event is not available for booking.');
    }
    // Build booking items from provided items, pulling authoritative data from ticket types
    const bookingItems = [];
    let subtotal = 0;
    for (const item of items) {
      const type = await ticketRepository.findTypeById(item.ticketTypeId);
      if (!type || !type.isActive) {
        throw new BadRequestError('Invalid ticket type.');
      }
      // Validate requested quantity against available inventory
      const available = (type.quantity || 0) - (type.sold || 0) - (type.reserved || 0);
      if (item.quantity > available) {
        throw new BadRequestError(`Not enough tickets available for ${type.name}. Requested ${item.quantity}, available ${available}.`);
      }
      // Determine price from ticket type; ignore client-provided unitPrice
      const unitPrice = Number(type.price || 0);
      const totalPrice = unitPrice * Number(item.quantity);
      subtotal += totalPrice;
      // Reserve inventory until booking is confirmed or cancelled
      await ticketRepository.incrementReserved(type._id, item.quantity);
      bookingItems.push({
        ticketTypeId:   type._id,
        ticketTypeName: type.name,
        quantity:       Number(item.quantity),
        unitPrice,
        totalPrice,
        seats:     item.seats || [],
        attendees: item.attendees || [],
      });
    }
    const totalAmount = subtotal; // promotions/fees handled elsewhere

    const booking = await bookingRepository.create({
      user:         getId(user),
      event:        eventId,
      organizer:    event.organizer,
      items:        bookingItems,
      subtotal,
      totalAmount,
      currency:     data.currency || 'USD',
      contactName:  contactName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
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

    const originalStatus = booking.status;
    const updated = await bookingRepository.updateByRef(bookingRef, {
      status:       'cancelled',
      cancelledAt:  new Date(),
      cancelReason: reason,
      cancelledBy:  getId(user),
    });
    logger.info(`Booking cancelled: ${bookingRef} by user ${getId(user)}`);

    // Adjust inventory depending on status
    if (Array.isArray(booking.items)) {
      for (const item of booking.items) {
        try {
          if (originalStatus === 'pending') {
            // Booking not yet confirmed: release reserved inventory
            await ticketRepository.decrementReserved(item.ticketTypeId, item.quantity);
          } else if (originalStatus === 'confirmed') {
            // Booking was confirmed: decrement sold count to free up inventory
            await ticketRepository.decrementSold(item.ticketTypeId, item.quantity);
          }
        } catch (err) {
          logger.error(`Error adjusting inventory on cancellation for ticketType ${item.ticketTypeId}: ${err.message}`);
        }
      }
    }

    await this._sendTicketCancelledEmail(booking, updated);
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
    // Mark booking as confirmed/paid. Fetch current booking first to determine if already confirmed.
    const existing = await bookingRepository.findByRef(bookingRef);
    if (!existing) {
      return null;
    }
    const alreadyPaid = existing.paymentStatus === 'paid' && existing.status === 'confirmed';

    // If already confirmed/paid, skip updates and ticket generation
    if (alreadyPaid) {
      return existing;
    }

    // Proceed to update status and payment information
    const update = {
      status:       'confirmed',
      paymentStatus:'paid',
      paidAt:       new Date(),
    };
    if (paymentId) {
      update.payment = paymentId;
    }
    const updated = await bookingRepository.updateByRef(bookingRef, update);
    // Reload booking with items to generate tickets and adjust inventory
    const booking = existing; // we already have existing booking with populated fields
    // Generate ticket records for each booked seat/quantity
    try {
      await ticketService.generateTicketsForBooking(booking);
    } catch (err) {
      logger.error(`Error generating tickets for booking ${bookingRef}: ${err.message}`);
    }
    // Adjust inventory: decrement reserved and increment sold
    if (Array.isArray(booking.items)) {
      for (const item of booking.items) {
        try {
          await ticketRepository.decrementReserved(item.ticketTypeId, item.quantity);
          await ticketRepository.incrementSold(item.ticketTypeId, item.quantity);
        } catch (err) {
          logger.error(`Error updating inventory for ticketType ${item.ticketTypeId}: ${err.message}`);
        }
      }
    }

    // After adjusting ticketType counts, update the event's totalSold count. This ensures
    // organizer dashboards reflect accurate sales numbers. We aggregate the sold
    // values across all ticket types for the event and persist it on the event document.
    try {
      const eventId = booking.event?._id || booking.event;
      if (eventId) {
        const TicketType = require('../tickets/ticketType.model');
        const agg = await TicketType.aggregate([
          { $match: { event: eventId, deletedAt: null } },
          { $group: { _id: null, sold: { $sum: '$sold' } } },
        ]);
        const totalSold = agg[0]?.sold || 0;
        const Event = require('../events/event.model');
        await Event.findByIdAndUpdate(eventId, { totalSold }, { new: false });
      }
    } catch (err) {
      logger.error(`Error updating event totalSold for booking ${bookingRef}: ${err.message}`);
    }
    await this._sendBookingConfirmationEmail(booking || updated);
    return updated;
  }

  async getStats() {
    return bookingRepository.getStats();
  }

  async _sendBookingConfirmationEmail(booking) {
    if (!booking?.contactEmail && !booking?.user?.email) {
      return;
    }

    await emailService.sendBookingConfirmationEmail({
      to: booking.contactEmail || booking.user.email,
      firstName: booking.user?.firstName || booking.contactName || 'there',
      eventName: booking.event?.title,
      bookingRef: booking.bookingRef,
      eventDate: formatDateTime(booking.event?.startDate),
      location: formatLocation(booking.event?.location),
      ticketCount: booking.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      bookingUrl: buildFrontendUrl(`/bookings/${booking.bookingRef}`),
    });
  }

  async _sendTicketCancelledEmail(originalBooking, updatedBooking) {
    if (!originalBooking?.contactEmail && !originalBooking?.user?.email) {
      return;
    }

    const firstTicketCode = originalBooking.items?.[0]?.ticketCode || originalBooking.items?.[0]?.code || originalBooking.bookingRef;

    await emailService.sendTicketCancelledEmail({
      to: originalBooking.contactEmail || originalBooking.user.email,
      firstName: getUserFirstName(originalBooking.user, originalBooking.contactName || 'there'),
      eventName: originalBooking.event?.title,
      ticketCode: firstTicketCode,
      cancelledAt: formatDateTime(updatedBooking?.cancelledAt || new Date()),
      refundSummary: reasonSummary(originalBooking, updatedBooking),
      bookingUrl: buildFrontendUrl(`/bookings/${originalBooking.bookingRef}`),
    });
  }
}

const reasonSummary = (booking, updatedBooking) => {
  if (updatedBooking?.paymentStatus === 'refunded' || booking?.paymentStatus === 'refunded') {
    return 'Your refund has already been processed.';
  }

  if (booking?.refundRequested) {
    return 'Your refund request is being reviewed.';
  }

  return 'If your booking qualifies for a refund, you can request it from your booking details page.';
};

module.exports = new BookingService();
