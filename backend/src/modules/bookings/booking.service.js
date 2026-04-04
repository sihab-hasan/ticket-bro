'use strict';

const bookingRepository = require('./booking.repository');
const cartRepository = require('../cart/cart.repository');
const promotionService = require('../promotions/promotion.service');
const ticketService = require('../tickets/ticket.service');
const TicketType = require('../tickets/ticketType.model');
const Ticket = require('../tickets/ticket.model');
const Payment = require('../payments/payment.model');
const Event = require('../events/event.model');
const {
  NotFoundError,
  BadRequestError,
} = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');
const emailService = require('../../infrastructure/mail/emailService');
const {
  formatDateTime,
  formatLocation,
  buildFrontendUrl,
  getUserFirstName,
} = require('../../infrastructure/mail/templateData');
const {
  getRefundPolicy,
  getRefundSummary,
  roundCurrency,
} = require('./booking.policy');
const { generateBookingInvoicePdf } = require('../../common/utils/generateTicketPDF');
const { refundPaymentIntent } = require('../payments/gateways/stripe.gateway');

const BOOKING_HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES || 15);

const getId = (user) => user?.id || user?._id?.toString() || user?.userId;
const normalizeBookingStatus = (status) => (status === 'expired' ? 'cancelled' : status);
const normalizePaymentStatus = (status) => (status === 'paid' ? 'succeeded' : status || 'pending');

const isStaffUser = (user) =>
  [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.ORGANIZER].includes(user?.role);

class BookingService {
  async createBooking(data, user) {
    const { eventId, items, contactName, contactEmail, contactPhone, promoCode, cartId } = data;
    if (!items || !items.length) throw new BadRequestError('Booking must have at least one item.');

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalAmount = subtotal;

    const booking = await bookingRepository.create({
      user: getId(user),
      event: eventId,
      items,
      subtotal,
      totalAmount,
      currency: data.currency || 'USD',
      contactName,
      contactEmail: contactEmail || user.email,
      contactPhone,
      promoCode,
      cartId,
      status: 'pending',
      paymentStatus: 'pending',
    });

    logger.info(`Booking created: ${booking.bookingRef} by user ${getId(user)}`);
    return this._formatBooking(booking);
  }

  async createBookingFromCart({ user, cart, contact, attendees = [], notes = '' }) {
    const userId = getId(user);
    if (!userId) {
      throw new BadRequestError('Authenticated user is required.');
    }

    if (!cart?.items?.length) {
      throw new BadRequestError('Cart is empty.');
    }

    await this.expirePendingBookingsForUser(userId);

    const eventIds = [...new Set(cart.items.map((item) => String(item.event?._id || item.event)))];
    if (eventIds.length !== 1) {
      throw new BadRequestError('Your cart can only contain tickets from one event at a time.');
    }

    const eventId = eventIds[0];
    const event = await Event.findOne({ _id: eventId, deletedAt: null })
      .select('title slug startDate endDate location organizer')
      .lean();

    if (!event) {
      throw new NotFoundError('Event not found.');
    }

    const existingPending = cart?._id
      ? await bookingRepository.findPendingByCartId(userId, cart._id)
      : null;

    if (existingPending) {
      await this._expireBooking(existingPending, 'Checkout restarted');
    }

    const bookingItems = await this._buildBookingItems(cart.items, eventId);
    const subtotal = roundCurrency(
      bookingItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
    );

    let promo = null;
    if (cart.promoCode) {
      promo = await promotionService.validateCode(cart.promoCode, {
        subtotal,
        eventId,
      });
    }

    const discountAmount = roundCurrency(promo?.discount || cart.discountAmount || 0);
    const totalAmount = roundCurrency(Math.max(0, subtotal - discountAmount));
    const preparedItems = this._assignAttendees({
      items: bookingItems,
      contact,
      attendees,
    });

    await this._reserveInventory(preparedItems);

    try {
      const booking = await bookingRepository.create({
        user: userId,
        event: eventId,
        organizer: event.organizer,
        items: preparedItems,
        subtotal,
        discount: discountAmount,
        discountAmount,
        totalAmount,
        currency: 'USD',
        promoCode: promo?.code || cart.promoCode || undefined,
        promoId: promo?.promoId || cart.promoId || undefined,
        contactName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        contactEmail: contact.email,
        contactPhone: contact.phone,
        cartId: cart._id,
        notes,
        status: 'pending',
        paymentStatus: 'pending',
        expiresAt: new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000),
      });

      logger.info(`Checkout booking created: ${booking.bookingRef} by user ${userId}`);
      return {
        booking: await this.getBookingByRef(booking.bookingRef, { _id: userId, role: ROLES.USER }),
        bookingRef: booking.bookingRef,
      };
    } catch (error) {
      await this._releaseInventory(preparedItems);
      throw error;
    }
  }

  async getMyBookings(userId, query = {}) {
    await this.expirePendingBookingsForUser(userId);

    const result = await bookingRepository.findByUserId({ userId, ...query });
    return {
      ...result,
      bookings: (result.bookings || []).map((booking) => this._formatBooking(booking)),
    };
  }

  async getBookingByRef(bookingRef, user) {
    const userId = isStaffUser(user) ? null : getId(user);
    let booking = await bookingRepository.findByRef(bookingRef, userId);
    if (!booking) throw new NotFoundError('Booking not found.');

    booking = await this.expireBookingIfNeeded(booking);
    return this._formatBooking(booking);
  }

  async getBookingByRefRaw(bookingRef, user) {
    const userId = isStaffUser(user) ? null : getId(user);
    let booking = await bookingRepository.findByRef(bookingRef, userId);
    if (!booking) throw new NotFoundError('Booking not found.');

    booking = await this.expireBookingIfNeeded(booking);
    return booking;
  }

  async cancelBooking(bookingRef, user, reason = '', options = {}) {
    const booking = await this.getBookingByRefRaw(
      bookingRef,
      options.bypassOwnership ? { role: ROLES.ADMIN } : user,
    );

    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new BadRequestError(`Booking cannot be cancelled in status: ${booking.status}`);
    }

    const actorId = getId(user);
    const now = new Date();

    if (booking.status === 'pending' || booking.paymentStatus === 'pending') {
      await this._releaseInventory(booking.items);
      const updated = await bookingRepository.updateByRef(bookingRef, {
        status: 'cancelled',
        paymentStatus: booking.payment ? 'failed' : booking.paymentStatus,
        cancelledAt: now,
        cancelReason: reason,
        cancelledBy: actorId,
      });

      if (booking.payment?._id) {
        await Payment.findByIdAndUpdate(booking.payment._id, {
          $set: {
            status: 'failed',
            failureMessage: reason || 'Booking cancelled before payment completion',
          },
        });
      }

      const fullBooking = await bookingRepository.findByRef(bookingRef);
      await this._sendTicketCancelledEmail(booking, fullBooking || updated);
      return this._formatBooking(fullBooking || updated);
    }

    await this._cancelIssuedTickets(booking._id);
    await this._decrementSoldInventory(booking.items);

    const policy = options.forceFullRefund
      ? {
          amount: roundCurrency(booking.totalAmount),
          percentage: 100,
          isRefundable: true,
          label: '100% refund',
        }
      : getRefundPolicy({
          startDate: booking.event?.startDate,
          totalAmount: booking.totalAmount,
        });

    const paymentUpdate = {};
    const bookingUpdate = {
      status: policy.amount > 0 ? 'refunded' : 'cancelled',
      cancelledAt: now,
      cancelReason: reason,
      cancelledBy: actorId,
      refundAmount: policy.amount,
    };

    if (policy.amount > 0) {
      if (booking.payment?.gatewayPaymentId && !String(booking.payment.gatewayPaymentId).startsWith('pi_stub')) {
        await refundPaymentIntent({
          paymentIntentId: booking.payment.gatewayPaymentId,
          amount: policy.amount,
        });
      }

      bookingUpdate.paymentStatus = 'refunded';
      bookingUpdate.refundedAt = now;

      paymentUpdate.status = 'refunded';
      paymentUpdate.refundedAt = now;
      paymentUpdate.refundAmount = policy.amount;
      paymentUpdate.refundReason = reason || policy.label;
    }

    const updated = await bookingRepository.updateByRef(bookingRef, bookingUpdate);

    if (booking.payment?._id && Object.keys(paymentUpdate).length) {
      await Payment.findByIdAndUpdate(booking.payment._id, { $set: paymentUpdate });
    }

    const fullBooking = await bookingRepository.findByRef(bookingRef);

    if (policy.amount > 0) {
      await this._sendRefundProcessedEmail(fullBooking || booking, policy.amount);
    } else {
      await this._sendTicketCancelledEmail(booking, fullBooking || updated);
    }

    logger.info(`Booking cancelled: ${bookingRef} by user ${actorId}`);
    return this._formatBooking(fullBooking || updated);
  }

  async refundBooking(bookingRef, user, reason = '', options = {}) {
    const booking = await this.getBookingByRefRaw(
      bookingRef,
      options.bypassOwnership ? { role: ROLES.ADMIN } : user,
    );

    if (booking.paymentStatus === 'refunded') {
      throw new BadRequestError('Booking has already been refunded.');
    }

    if (booking.paymentStatus !== 'paid') {
      throw new BadRequestError('Only paid bookings can be refunded.');
    }

    if (booking.status === 'confirmed') {
      return this.cancelBooking(bookingRef, user, reason, options);
    }

    const refundAmount = options.forceFullRefund
      ? roundCurrency(booking.totalAmount)
      : getRefundPolicy({
          startDate: booking.event?.startDate,
          totalAmount: booking.totalAmount,
        }).amount;

    if (!refundAmount) {
      throw new BadRequestError('This booking is not eligible for a refund.');
    }

    if (booking.payment?.gatewayPaymentId && !String(booking.payment.gatewayPaymentId).startsWith('pi_stub')) {
      await refundPaymentIntent({
        paymentIntentId: booking.payment.gatewayPaymentId,
        amount: refundAmount,
      });
    }

    const now = new Date();
    const updated = await bookingRepository.updateByRef(bookingRef, {
      status: 'refunded',
      paymentStatus: 'refunded',
      refundedAt: now,
      refundAmount,
      refundRequested: false,
      cancelReason: reason || booking.cancelReason,
      cancelledBy: getId(user) || booking.cancelledBy,
    });

    if (booking.payment?._id) {
      await Payment.findByIdAndUpdate(booking.payment._id, {
        $set: {
          status: 'refunded',
          refundedAt: now,
          refundAmount,
          refundReason: reason || 'Booking refund processed',
        },
      });
    }

    const fullBooking = await bookingRepository.findByRef(bookingRef);
    await this._sendRefundProcessedEmail(fullBooking || booking, refundAmount);
    return this._formatBooking(fullBooking || updated);
  }

  async requestRefund(bookingRef, user, reason = '') {
    return this.refundBooking(bookingRef, user, reason);
  }

  async getBookingTickets(bookingRef, user) {
    const booking = await this.getBookingByRefRaw(bookingRef, user);
    const tickets = await ticketService.getTicketsForBooking(booking._id);
    return { tickets };
  }

  async getInvoiceBuffer(bookingRef, user) {
    const booking = await this.getBookingByRefRaw(bookingRef, user);
    const tickets = await ticketService.getTicketsForBooking(booking._id);
    return generateBookingInvoicePdf({ booking: this._formatBooking(booking), tickets });
  }

  async getOrganizerBookings(organizerId, query = {}) {
    const result = await bookingRepository.findByOrganizer({ organizerId, ...query });
    return {
      ...result,
      bookings: (result.bookings || []).map((booking) => this._formatBooking(booking)),
    };
  }

  async checkIn(bookingRef, staffUser) {
    const booking = await bookingRepository.findByRef(bookingRef);
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.status === 'checked_in') throw new BadRequestError('Already checked in.');
    if (booking.status !== 'confirmed') throw new BadRequestError('Only confirmed bookings can be checked in.');

    const updated = await bookingRepository.updateByRef(bookingRef, {
      status: 'checked_in',
      checkedInAt: new Date(),
      checkedInBy: getId(staffUser),
    });
    logger.info(`Check-in: ${bookingRef} by ${getId(staffUser)}`);
    return this._formatBooking(updated);
  }

  async confirmBooking(bookingRef, paymentId = null) {
    let booking = await bookingRepository.findByRef(bookingRef);
    if (!booking) throw new NotFoundError('Booking not found.');

    booking = await this.expireBookingIfNeeded(booking);

    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      await ticketService.generateTicketsForBooking(booking);
      return this._formatBooking(booking);
    }

    if (booking.status !== 'pending') {
      throw new BadRequestError(`Booking cannot be confirmed in status: ${booking.status}`);
    }

    await this._commitInventory(booking.items);

    const update = {
      status: 'confirmed',
      paymentStatus: 'paid',
      paidAt: new Date(),
      expiresAt: null,
    };

    if (paymentId) {
      update.payment = paymentId;
    }

    const updated = await bookingRepository.updateByRef(bookingRef, update);
    const fullBooking = await bookingRepository.findByRef(bookingRef);

    await ticketService.generateTicketsForBooking(fullBooking || updated);

    if (booking.cartId) {
      await cartRepository.deleteByUserId(getId((fullBooking || booking).user));
    }

    await this._sendBookingConfirmationEmail(fullBooking || updated);

    return this._formatBooking(fullBooking || updated);
  }

  async expireBookingIfNeeded(booking) {
    if (!booking?.expiresAt || booking.status !== 'pending') {
      return booking;
    }

    if (new Date(booking.expiresAt).getTime() >= Date.now()) {
      return booking;
    }

    return this._expireBooking(booking, 'Booking hold expired');
  }

  async expirePendingBookingsForUser(userId) {
    const pendingBookings = await bookingRepository.findPendingByUserId(userId);
    await Promise.all(
      pendingBookings.map((booking) => this.expireBookingIfNeeded(booking)),
    );
  }

  async expirePendingBooking(bookingRef, failureMessage = 'Booking expired') {
    const booking = await bookingRepository.findByRef(bookingRef);
    if (!booking) {
      return null;
    }

    return this._expireBooking(booking, failureMessage);
  }

  async getStats() {
    return bookingRepository.getStats();
  }

  async _buildBookingItems(cartItems, eventId) {
    const ticketTypeIds = cartItems.map((item) => item.ticketType?._id || item.ticketType);
    const ticketTypes = await TicketType.find({
      _id: { $in: ticketTypeIds },
      event: eventId,
      deletedAt: null,
      isActive: true,
    }).lean();

    const typeMap = new Map(ticketTypes.map((ticketType) => [String(ticketType._id), ticketType]));
    const now = Date.now();

    return cartItems.map((item) => {
      const ticketTypeId = String(item.ticketType?._id || item.ticketType);
      const ticketType = typeMap.get(ticketTypeId);
      if (!ticketType) {
        throw new NotFoundError('Ticket type not found.');
      }

      const quantity = Number(item.quantity || 0);
      if (quantity < Number(ticketType.minPerOrder || 1)) {
        throw new BadRequestError(`Minimum ${ticketType.minPerOrder || 1} ticket(s) required for ${ticketType.name}.`);
      }
      if (quantity > Number(ticketType.maxPerOrder || 10)) {
        throw new BadRequestError(`Maximum ${ticketType.maxPerOrder || 10} tickets allowed for ${ticketType.name}.`);
      }

      if (ticketType.salesStart && new Date(ticketType.salesStart).getTime() > now) {
        throw new BadRequestError(`${ticketType.name} sales have not started yet.`);
      }

      if (ticketType.salesEnd && new Date(ticketType.salesEnd).getTime() < now) {
        throw new BadRequestError(`${ticketType.name} sales have ended.`);
      }

      const available = Number(ticketType.quantity || 0) - Number(ticketType.sold || 0) - Number(ticketType.reserved || 0);
      if (available < quantity) {
        throw new BadRequestError(`${ticketType.name} only has ${Math.max(available, 0)} ticket(s) left.`);
      }

      const unitPrice = Number(ticketType.price || 0);

      return {
        ticketTypeId: ticketType._id,
        ticketTypeName: ticketType.name,
        quantity,
        unitPrice,
        totalPrice: roundCurrency(unitPrice * quantity),
        attendees: [],
      };
    });
  }

  _assignAttendees({ items, contact, attendees = [] }) {
    const primaryAttendee = {
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
    };

    const queue = [
      primaryAttendee,
      ...attendees.map((attendee) => ({
        firstName: attendee.firstName || '',
        lastName: attendee.lastName || '',
        email: attendee.email || '',
        phone: attendee.phone || '',
      })),
    ];

    return items.map((item) => ({
      ...item,
      attendees: Array.from({ length: item.quantity }, () => queue.shift() || primaryAttendee),
    }));
  }

  async _reserveInventory(items) {
    for (const item of items) {
      const updated = await TicketType.findOneAndUpdate(
        {
          _id: item.ticketTypeId,
          deletedAt: null,
          isActive: true,
          $expr: {
            $gte: [
              { $subtract: ['$quantity', { $add: ['$sold', '$reserved'] }] },
              Number(item.quantity || 0),
            ],
          },
        },
        { $inc: { reserved: Number(item.quantity || 0) } },
        { new: true },
      ).exec();

      if (!updated) {
        throw new BadRequestError(`Unable to reserve ${item.ticketTypeName}.`);
      }
    }
  }

  async _releaseInventory(items) {
    for (const item of items || []) {
      await TicketType.findByIdAndUpdate(item.ticketTypeId, {
        $inc: { reserved: -Number(item.quantity || 0) },
      }).exec();
    }
  }

  async _commitInventory(items) {
    for (const item of items || []) {
      await TicketType.findByIdAndUpdate(item.ticketTypeId, {
        $inc: {
          reserved: -Number(item.quantity || 0),
          sold: Number(item.quantity || 0),
        },
      }).exec();
    }
  }

  async _decrementSoldInventory(items) {
    for (const item of items || []) {
      await TicketType.findByIdAndUpdate(item.ticketTypeId, {
        $inc: { sold: -Number(item.quantity || 0) },
      }).exec();
    }
  }

  async _cancelIssuedTickets(bookingId) {
    await Ticket.updateMany(
      { booking: bookingId, deletedAt: null, status: { $ne: 'cancelled' } },
      { $set: { status: 'cancelled', cancelledAt: new Date() } },
    ).exec();
  }

  async _expireBooking(booking, failureMessage = 'Booking expired') {
    if (booking.status !== 'pending') {
      return booking;
    }

    await this._releaseInventory(booking.items);

    const updated = await bookingRepository.updateByRef(booking.bookingRef, {
      status: 'expired',
      paymentStatus: 'failed',
      cancelReason: failureMessage,
    });

    if (booking.payment?._id) {
      await Payment.findByIdAndUpdate(booking.payment._id, {
        $set: {
          status: 'failed',
          failureMessage,
        },
      }).exec();
    }

    const refreshed = await bookingRepository.findByRef(booking.bookingRef);
    return refreshed || updated;
  }

  _formatBooking(booking) {
    if (!booking) return booking;

    const source = booking.toObject ? booking.toObject({ virtuals: true }) : { ...booking };
    const ticketCount = source.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
    const firstItem = source.items?.[0] || null;
    const payment = source.payment
      ? {
          ...source.payment,
          gatewayTransactionId: source.payment.gatewayPaymentId || source.payment.gatewayTransactionId || null,
          status: normalizePaymentStatus(source.payment.status || source.paymentStatus),
        }
      : null;

    return {
      ...source,
      status: normalizeBookingStatus(source.status),
      rawStatus: source.status,
      paymentStatus: normalizePaymentStatus(source.paymentStatus),
      rawPaymentStatus: source.paymentStatus,
      quantity: ticketCount,
      ticketCount,
      ticketType: firstItem
        ? {
            name: firstItem.ticketTypeName,
            quantity: firstItem.quantity,
          }
        : null,
      refundSummary: getRefundSummary(source),
      contact: {
        name: source.contactName,
        email: source.contactEmail,
        phone: source.contactPhone,
      },
      event: source.event
        ? {
            ...source.event,
            venue: source.event.venue || source.event.location || null,
          }
        : source.event,
      payment,
      paymentMethod: payment?.paymentMethod?.type || payment?.gateway || null,
    };
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

    const firstTicketCode =
      originalBooking.items?.[0]?.ticketCode ||
      originalBooking.items?.[0]?.code ||
      originalBooking.bookingRef;

    await emailService.sendTicketCancelledEmail({
      to: originalBooking.contactEmail || originalBooking.user.email,
      firstName: getUserFirstName(originalBooking.user, originalBooking.contactName || 'there'),
      eventName: originalBooking.event?.title,
      ticketCode: firstTicketCode,
      cancelledAt: formatDateTime(updatedBooking?.cancelledAt || new Date()),
      refundSummary: getRefundSummary(updatedBooking || originalBooking),
      bookingUrl: buildFrontendUrl(`/bookings/${originalBooking.bookingRef}`),
    });
  }

  async _sendRefundProcessedEmail(booking, refundAmount) {
    if (!booking?.contactEmail && !booking?.user?.email) {
      return;
    }

    await emailService.sendRefundProcessedEmail({
      to: booking.contactEmail || booking.user.email,
      firstName: getUserFirstName(booking.user, booking.contactName || 'there'),
      amount: refundAmount,
      currency: booking.currency || 'USD',
      paymentMethod: booking.payment?.gateway || 'Stripe',
      processedAt: formatDateTime(booking.refundedAt || new Date()),
      bookingRef: booking.bookingRef,
      statusUrl: buildFrontendUrl(`/bookings/${booking.bookingRef}`),
    });
  }
}

module.exports = new BookingService();
