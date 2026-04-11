'use strict';
const ticketRepository = require('./ticket.repository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');
const QRCode = require('qrcode');

const ADMIN_ROLES = new Set([ROLES.ADMIN, ROLES.SUPER_ADMIN]);

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value?.toString === 'function' && value?.constructor?.name === 'ObjectId') {
    return value.toString();
  }

  return (
    value?._id?.toString?.()
    || value?.id?.toString?.()
    || value?.userId?.toString?.()
    || value?.user?.toString?.()
    || null
  );
};

const splitName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || 'Guest',
    lastName: parts.slice(1).join(' '),
  };
};

const buildAttendeeName = (attendee = {}, booking = {}, user = {}) =>
  [attendee.firstName, attendee.lastName].filter(Boolean).join(' ').trim()
  || booking.contactName
  || [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  || 'Guest';

const buildFallbackAttendee = (booking = {}) => ({
  ...splitName(booking.contactName),
  email: booking.contactEmail || '',
  phone: booking.contactPhone || '',
});

const sanitizeAttendee = (attendee = {}, fallback = {}) => ({
  firstName: attendee.firstName || fallback.firstName || 'Guest',
  lastName: attendee.lastName || fallback.lastName || '',
  email: attendee.email || fallback.email || '',
  phone: attendee.phone || fallback.phone || '',
});

class TicketService {
  async generateTicketsForBooking(booking) {
    const tickets = [];
    const fallbackAttendee = buildFallbackAttendee(booking);

    for (const item of booking.items || []) {
      for (let i = 0; i < item.quantity; i += 1) {
        const attendee = sanitizeAttendee(item.attendees?.[i], fallbackAttendee);
        const qrData = JSON.stringify({
          bookingRef: booking.bookingRef,
          ticketType: item.ticketTypeName,
          attendee: buildAttendeeName(attendee, booking),
          index: i,
        });
        let qrCode = '';

        try {
          qrCode = await QRCode.toDataURL(qrData);
        } catch {
          qrCode = '';
        }

        tickets.push({
          booking: booking._id,
          event: booking.event,
          user: booking.user,
          ticketType: item.ticketTypeId,
          ticketTypeName: item.ticketTypeName,
          price: item.unitPrice,
          currency: booking.currency || 'USD',
          seat: item.seats?.[i] || {},
          attendee,
          qrCode,
        });
      }
    }

    return ticketRepository.createMany(tickets);
  }

  async getMyTickets(userId, query = {}) {
    return ticketRepository.findByUserId({ userId, ...query });
  }

  async getTicketByCode(ticketCode, userId) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (getId(ticket.user) !== String(userId)) throw new ForbiddenError('Access denied.');
    return ticket;
  }

  async downloadTicket(ticketCode, userId) {
    return this.getTicketByCode(ticketCode, userId);
  }

  async validateTicket(ticketCode, staffUser) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');

    const staffId = getId(staffUser);
    const organizerId = getId(ticket.event?.organizer) || getId(ticket.booking?.organizer);

    if (!ADMIN_ROLES.has(staffUser?.role) && (!organizerId || organizerId !== staffId)) {
      throw new ForbiddenError('You can only validate tickets for your own events.');
    }

    if (ticket.status === 'used') throw new BadRequestError('Ticket already used.');
    if (ticket.status !== 'active') throw new BadRequestError(`Ticket status: ${ticket.status}`);

    await ticketRepository.updateByCode(ticketCode, { status: 'used', usedAt: new Date() });
    logger.info(`Ticket validated: ${ticketCode} by ${staffId}`);
    return ticketRepository.findByCode(ticketCode);
  }

  async getPublicVerification(ticketCode) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');

    const organizer = ticket.event?.organizerProfile || {};
    const organizerName =
      organizer.displayName
      || ticket.event?.organizer?.organizationName
      || [ticket.event?.organizer?.firstName, ticket.event?.organizer?.lastName].filter(Boolean).join(' ').trim()
      || 'Organizer';

    return {
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      isValid: ticket.status === 'active',
      usedAt: ticket.usedAt || null,
      ticketTypeName: ticket.ticketType?.name || ticket.ticketTypeName || 'Ticket',
      attendeeName: buildAttendeeName(ticket.attendee, ticket.booking, ticket.user),
      bookingRef: ticket.booking?.bookingRef || null,
      event: {
        title: ticket.event?.title || null,
        slug: ticket.event?.slug || null,
        startDate: ticket.event?.startDate || null,
        endDate: ticket.event?.endDate || null,
        location: ticket.event?.location || null,
        coverImage: ticket.event?.coverImage || null,
      },
      organizer: {
        name: organizerName,
        slug: organizer.slug || null,
        verificationStatus: organizer.verificationStatus || 'unverified',
        isTrusted: organizer.verificationStatus === 'verified',
        verifiedAt: organizer.verifiedAt || null,
        avatar: organizer.logo || null,
      },
    };
  }

  async transferTicket(ticketCode, userId, toEmail) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (getId(ticket.user) !== String(userId)) throw new ForbiddenError('Access denied.');
    if (ticket.status !== 'active') throw new BadRequestError('Only active tickets can be transferred.');

    const User = require('../users/user.model');
    const targetUser = await User.findOne({ email: toEmail.toLowerCase() });
    if (!targetUser) throw new NotFoundError('Target user not found.');

    return ticketRepository.updateByCode(ticketCode, {
      status: 'transferred',
      transferredTo: targetUser._id,
      transferredAt: new Date(),
    });
  }

  async cancelTicket(ticketCode, userId) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (getId(ticket.user) !== String(userId)) throw new ForbiddenError('Access denied.');
    if (ticket.status !== 'active') throw new BadRequestError('Only active tickets can be cancelled.');

    return ticketRepository.updateByCode(ticketCode, { status: 'cancelled', cancelledAt: new Date() });
  }
}

module.exports = new TicketService();
