'use strict';
const Waitlist = require('./waitlist.model');
const { BadRequestError, NotFoundError } = require('../../common/errors/AppError');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class WaitlistService {
  async join(userId, { eventId, ticketTypeId, quantity = 1 }) {
    const exists = await Waitlist.findOne({ event: eventId, user: userId, status: 'waiting' });
    if (exists) throw new BadRequestError('Already on waitlist for this event.');
    const count = await Waitlist.countDocuments({ event: eventId, status: 'waiting' });
    return new Waitlist({ event: eventId, ticketType: ticketTypeId, user: userId, quantity, position: count + 1 }).save();
  }

  async leave(userId, eventId) {
    const entry = await Waitlist.findOneAndDelete({ event: eventId, user: userId, status: 'waiting' });
    if (!entry) throw new NotFoundError('Waitlist entry not found.');
    return { message: 'Removed from waitlist.' };
  }

  async getPosition(userId, eventId) {
    const entry = await Waitlist.findOne({ event: eventId, user: userId, status: 'waiting' });
    if (!entry) throw new NotFoundError('Not on waitlist.');
    return { position: entry.position, status: entry.status };
  }

  async notifyNext(eventId, ticketTypeId, slots = 1) {
    const entries = await Waitlist.find({ event: eventId, ticketType: ticketTypeId, status: 'waiting' })
      .sort('position').limit(slots);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h to complete booking
    for (const e of entries) {
      e.status = 'notified';
      e.notifiedAt = new Date();
      e.expiresAt  = expiresAt;
      await e.save();
    }
    return entries;
  }
}
module.exports = new WaitlistService();
