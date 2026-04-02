'use strict';
const ticketRepository = require('./ticket.repository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../common/errors/AppError');
const logger = require('../../infrastructure/logger/logger');
const QRCode = require('qrcode');

const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class TicketService {

  async generateTicketsForBooking(booking) {
    const tickets = [];
    for (const item of booking.items) {
      for (let i = 0; i < item.quantity; i++) {
        const attendee = item.attendees?.[i] || {};
        const qrData   = JSON.stringify({ bookingRef: booking.bookingRef, ticketType: item.ticketTypeName, index: i });
        let qrCode = '';
        try { qrCode = await QRCode.toDataURL(qrData); } catch { /* fallback */ }

        tickets.push({
          booking:        booking._id,
          event:          booking.event,
          user:           booking.user,
          ticketType:     item.ticketTypeId,
          ticketTypeName: item.ticketTypeName,
          price:          item.unitPrice,
          currency:       booking.currency || 'USD',
          seat:           item.seats?.[i] || {},
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
    if (ticket.user._id.toString() !== userId.toString()) throw new ForbiddenError('Access denied.');
    return ticket;
  }

  async downloadTicket(ticketCode, userId) {
    return this.getTicketByCode(ticketCode, userId);
  }

  async validateTicket(ticketCode, staffUser) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (ticket.status === 'used') throw new BadRequestError('Ticket already used.');
    if (ticket.status !== 'active') throw new BadRequestError(`Ticket status: ${ticket.status}`);

    const updated = await ticketRepository.updateByCode(ticketCode, { status: 'used', usedAt: new Date() });
    logger.info(`Ticket validated: ${ticketCode} by ${getId(staffUser)}`);
    return updated;
  }

  async transferTicket(ticketCode, userId, toEmail) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (ticket.user._id.toString() !== userId.toString()) throw new ForbiddenError('Access denied.');
    if (ticket.status !== 'active') throw new BadRequestError('Only active tickets can be transferred.');

    const User = require('../users/user.model');
    const targetUser = await User.findOne({ email: toEmail.toLowerCase() });
    if (!targetUser) throw new NotFoundError('Target user not found.');

    const updated = await ticketRepository.updateByCode(ticketCode, {
      status: 'transferred',
      transferredTo: targetUser._id,
      transferredAt: new Date(),
    });
    return updated;
  }

  async cancelTicket(ticketCode, userId) {
    const ticket = await ticketRepository.findByCode(ticketCode);
    if (!ticket) throw new NotFoundError('Ticket not found.');
    if (ticket.user._id.toString() !== userId.toString()) throw new ForbiddenError('Access denied.');
    if (ticket.status !== 'active') throw new BadRequestError('Only active tickets can be cancelled.');

    return ticketRepository.updateByCode(ticketCode, { status: 'cancelled', cancelledAt: new Date() });
  }
}

module.exports = new TicketService();
