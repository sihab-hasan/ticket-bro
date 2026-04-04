'use strict';
const Ticket     = require('./ticket.model');
const TicketType = require('./ticketType.model');

class TicketRepository {
  async create(data)   { return new Ticket(data).save(); }
  async createMany(arr){ return Ticket.insertMany(arr); }

  async findByCode(ticketCode) {
    return Ticket.findOne({ ticketCode, deletedAt: null })
      .populate('event', 'title slug startDate endDate location')
      .populate('user', 'firstName lastName email')
      .populate('ticketType')
      .select('+qrCode').exec();
  }

  async findByBookingId(bookingId) {
    return Ticket.find({ booking: bookingId, deletedAt: null })
      .populate('event', 'title slug startDate')
      .select('+qrCode').lean();
  }

  async findByUserId({ userId, page = 1, limit = 20, sort = '-createdAt' }) {
    const filter = { user: userId, deletedAt: null };
    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('event', 'title slug startDate endDate coverImage')
        .populate('ticketType', 'name type')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Ticket.countDocuments(filter),
    ]);
    return { tickets, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async updateById(id, data) {
    return Ticket.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async updateByCode(ticketCode, data) {
    return Ticket.findOneAndUpdate({ ticketCode }, { $set: data }, { new: true }).exec();
  }

  // Ticket Types
  async findTypesByEvent(eventId) {
    return TicketType.find({ event: eventId, isActive: true, deletedAt: null }).sort('sortOrder').lean();
  }

  async findTypeById(id) {
    return TicketType.findOne({ _id: id, deletedAt: null }).exec();
  }

  async createType(data)       { return new TicketType(data).save(); }
  async updateType(id, data)   { return TicketType.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec(); }
  async incrementSold(id, qty) { return TicketType.findByIdAndUpdate(id, { $inc: { sold: qty } }).exec(); }
  async decrementSold(id, qty) { return TicketType.findByIdAndUpdate(id, { $inc: { sold: -qty } }).exec(); }

  /**
   * Increment the number of reserved seats for a given ticket type.
   * Reserving tickets reduces the available stock without marking them as sold.
   * @param {String|ObjectId} id - TicketType ID
   * @param {Number} qty - Quantity to reserve
   */
  async incrementReserved(id, qty) {
    return TicketType.findByIdAndUpdate(id, { $inc: { reserved: qty } }, { new: true }).exec();
  }

  /**
   * Decrement the number of reserved seats for a given ticket type.
   * When a booking is confirmed or cancelled, reserved counts should be adjusted accordingly.
   * @param {String|ObjectId} id - TicketType ID
   * @param {Number} qty - Quantity to reduce
   */
  async decrementReserved(id, qty) {
    return TicketType.findByIdAndUpdate(id, { $inc: { reserved: -qty } }, { new: true }).exec();
  }
}

module.exports = new TicketRepository();
