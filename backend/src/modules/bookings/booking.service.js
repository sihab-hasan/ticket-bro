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
const { socketEvents } = require('../../infrastructure/websocket/socketEvents');

// Additional dependencies for inventory and event lookups
const Event = require('../events/event.model');
const ticketRepository = require('../tickets/ticket.repository');
const ticketService = require('../tickets/ticket.service');
const TicketType = require('../tickets/ticketType.model');

const getId = (user) => user?.id || user?._id?.toString() || user?.userId;

class BookingService {
  _assertTicketOnSale(ticketType) {
    const now = Date.now();
    const salesStart = ticketType?.salesStart
      ? new Date(ticketType.salesStart).getTime()
      : null;
    const salesEnd = ticketType?.salesEnd
      ? new Date(ticketType.salesEnd).getTime()
      : null;

    if (salesStart && now < salesStart) {
      throw new BadRequestError(`Sales for ${ticketType.name} have not opened yet.`);
    }

    if (salesEnd && now > salesEnd) {
      throw new BadRequestError(`Sales for ${ticketType.name} have ended.`);
    }
  }

  async _syncEventInventorySummary(eventId) {
    if (!eventId) {
      return;
    }

    const summary = await TicketType.aggregate([
      { $match: { event: eventId, deletedAt: null } },
      {
        $group: {
          _id: null,
          sold: { $sum: '$sold' },
          reserved: { $sum: '$reserved' },
          capacity: { $sum: '$quantity' },
        },
      },
    ]);

    await Event.findByIdAndUpdate(eventId, {
      totalSold: summary[0]?.sold || 0,
      totalReserved: summary[0]?.reserved || 0,
      totalCapacity: summary[0]?.capacity || 0,
    });
  }

  async _buildBookingItems(eventId, items = []) {
    const groupedItems = items.reduce((map, item) => {
      const ticketTypeId = item?.ticketTypeId?.toString?.() || item?.ticketTypeId;
      const quantity = Number(item?.quantity || 0);

      if (!ticketTypeId || !Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestError('Each booking item must include a valid ticket type and quantity.');
      }

      const current = map.get(ticketTypeId) || {
        ticketTypeId,
        quantity: 0,
        seats: [],
        attendees: [],
      };

      current.quantity += quantity;
      current.seats.push(...(item.seats || []));
      current.attendees.push(...(item.attendees || []));
      map.set(ticketTypeId, current);
      return map;
    }, new Map());

    const bookingItems = [];
    let subtotal = 0;

    for (const grouped of groupedItems.values()) {
      const type = await ticketRepository.findTypeById(grouped.ticketTypeId);

      if (!type || !type.isActive) {
        throw new BadRequestError('Invalid ticket type.');
      }

      if (String(type.event) !== String(eventId)) {
        throw new BadRequestError('Ticket type does not belong to the selected event.');
      }

      this._assertTicketOnSale(type);

      if (type.minPerOrder && grouped.quantity < Number(type.minPerOrder)) {
        throw new BadRequestError(
          `${type.name} requires at least ${type.minPerOrder} tickets per order.`,
        );
      }

      if (type.maxPerOrder && grouped.quantity > Number(type.maxPerOrder)) {
        throw new BadRequestError(
          `${type.name} allows at most ${type.maxPerOrder} tickets per order.`,
        );
      }

      const available = (type.quantity || 0) - (type.sold || 0) - (type.reserved || 0);
      if (grouped.quantity > available) {
        throw new BadRequestError(`Not enough tickets available for ${type.name}. Requested ${grouped.quantity}, available ${available}.`);
      }

      const unitPrice = Number(type.price || 0);
      const totalPrice = unitPrice * grouped.quantity;
      subtotal += totalPrice;
      bookingItems.push({
        ticketTypeId: type._id,
        ticketTypeName: type.name,
        quantity: grouped.quantity,
        unitPrice,
        totalPrice,
        seats: grouped.seats,
        attendees: grouped.attendees,
      });
    }

    return { bookingItems, subtotal };
  }

  async createBooking(data, user) {
    const { eventId, items, contactName, contactEmail, contactPhone, promoCode, cartId } = data;
    if (!items || !items.length) {
      throw new BadRequestError('Booking must have at least one item.');
    }
    // Fetch event to ensure it exists and retrieve organizer
    const event = await Event.findById(eventId)
      .select('organizer status title currency startDate endDate location')
      .exec();
    if (!event) {
      throw new NotFoundError('Event not found.');
    }
    // Only allow bookings on published events
    if (!['published'].includes(event.status)) {
      throw new BadRequestError('Event is not available for booking.');
    }
    const { bookingItems, subtotal } = await this._buildBookingItems(eventId, items);
    const totalAmount = subtotal; // promotions/fees handled elsewhere

    const reservedItems = [];

    try {
      for (const item of bookingItems) {
        await ticketRepository.incrementReserved(item.ticketTypeId, item.quantity);
        reservedItems.push(item);
      }

      const booking = await bookingRepository.create({
        user:         getId(user),
        event:        eventId,
        organizer:    event.organizer,
        items:        bookingItems,
        subtotal,
        totalAmount,
        currency:     data.currency || event.currency || 'USD',
        contactName:  contactName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        contactEmail: contactEmail || user.email,
        contactPhone,
        promoCode,
        cartId,
        status:       'pending',
        paymentStatus:'pending',
      });

      await this._syncEventInventorySummary(eventId);
      logger.info(`Booking created: ${booking.bookingRef} by user ${getId(user)}`);
      return booking;
    } catch (error) {
      for (const item of reservedItems) {
        try {
          await ticketRepository.decrementReserved(item.ticketTypeId, item.quantity);
        } catch (rollbackError) {
          logger.error(`Failed to rollback reservation for ticketType ${item.ticketTypeId}: ${rollbackError.message}`);
        }
      }

      if (reservedItems.length) {
        try {
          await this._syncEventInventorySummary(eventId);
        } catch (syncError) {
          logger.error(`Failed to resync event inventory after rollback for event ${eventId}: ${syncError.message}`);
        }
      }

      throw error;
    }
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

    await this._syncEventInventorySummary(booking.event?._id || booking.event);

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

    // Emit real-time check-in event
    try {
      const userId = getId(booking.user);
      const organizerId = getId(booking.organizer);
      
      // Notify user their ticket was used
      socketEvents.emitUserTicketValidated(userId, { bookingRef, ticketCode: bookingRef });
      
      // Notify organizer of check-in
      if (organizerId) {
        socketEvents.emitOrganizerCheckin(organizerId, { 
          bookingRef, 
          checkedInAt: new Date() 
        });
      }
    } catch (err) {
      logger.warn('Failed to emit check-in socket events', { err: err.message });
    }

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

try {
      await this._syncEventInventorySummary(booking.event?._id || booking.event);
    } catch (err) {
      logger.error(`Error updating event inventory summary for booking ${bookingRef}: ${err.message}`);
    }

    // Emit real-time events for booking confirmation
    try {
      const userId = getId(booking.user);
      const organizerId = getId(booking.organizer);
      const confirmedBooking = updated || booking;
      
      // Notify user
      socketEvents.emitUserBookingConfirmed(userId, confirmedBooking);
      
      // Notify organizer
      if (organizerId) {
        socketEvents.emitOrganizerBookingNew(organizerId, confirmedBooking);
        socketEvents.emitOrganizerRevenueUpdate(organizerId, { 
          bookingRef, 
          totalAmount: confirmedBooking.totalAmount 
        });
      }
    } catch (err) {
      logger.warn('Failed to emit booking socket events', { err: err.message });
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
