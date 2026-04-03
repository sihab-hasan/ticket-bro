'use strict';
const eventRepository = require('./event.repository');
const TicketType = require('../tickets/ticketType.model');
const SeatSection = require('../tickets/seat_section.model');
const reviewRepository = require('../reviews/review.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class EventService {
  async _getEventBySlugOrThrow(slug) {
    const event = await eventRepository.findBySlug(slug);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async createEvent(data, user) {
    const event = await eventRepository.create({ ...data, organizer: getId(user) });
    logger.info(`Event created: ${event._id} by ${getId(user)}`);
    return event;
  }

  async getEvents(query = {}) { return eventRepository.findPublished(query); }
  async getFeaturedEvents(query = {}) { return eventRepository.findPublished({ ...query, isFeatured: true }); }
  async getTrendingEvents(query = {}) { return eventRepository.findPublished({ ...query, sort: query.sort || '-trendScore -totalSold' }); }
  async getUpcomingEvents(query = {}) { return eventRepository.findPublished({ ...query, startDate: query.startDate || new Date().toISOString(), sort: query.sort || 'startDate' }); }

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async getEventBySlug(slug) {
    return this._getEventBySlugOrThrow(slug);
  }

  async updateEvent(slug, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);
    return eventRepository.updateById(event._id, data);
  }

  async deleteEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);
    await eventRepository.softDeleteById(event._id);
    return { message: 'Event deleted.' };
  }

  async publishEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);
    if (event.status === 'published') throw new BadRequestError('Event already published.');
    return eventRepository.updateById(event._id, { status: 'published', publishedAt: new Date() });
  }

  async cancelEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);
    return eventRepository.updateById(event._id, { status: 'cancelled' });
  }

  async getOrganizerEvents(organizerId, query = {}) { return eventRepository.findByOrganizer(organizerId, query); }

  async getAllEventsAdmin(query = {}) { return eventRepository.findAll(query); }

  async getRelatedEvents(slug, limit = 6) {
    const event = await this._getEventBySlugOrThrow(slug);
    return eventRepository.findPublished({
      category: event.category?._id || event.category,
      excludeId: event._id,
      page: 1,
      limit,
      sort: 'startDate',
    });
  }

  async getTicketTypes(slug) {
    const event = await this._getEventBySlugOrThrow(slug);
    return TicketType.find({
      event: event._id,
      deletedAt: null,
      isActive: true,
    })
      .sort('sortOrder price')
      .lean();
  }

  async getEventTickets(slug) {
    const ticketTypes = await this.getTicketTypes(slug);
    return { ticketTypes };
  }

  async getEventReviews(slug, query = {}) {
    const event = await this._getEventBySlugOrThrow(slug);
    return reviewRepository.findByEventId({ eventId: event._id, ...query });
  }

  async getSeatSections(slug) {
    const event = await this._getEventBySlugOrThrow(slug);
    return SeatSection.find({ eventId: event._id }).sort('name').lean();
  }

  async getSeatMap(slug) {
    const sections = await this.getSeatSections(slug);
    return { sections, seats: [] };
  }

  async createTicketType(slug, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);

    const ticketType = await TicketType.create({
      event: event._id,
      ...this._pickTicketTypeFields(data),
    });

    await this._syncEventPricingSummary(event._id);
    return ticketType;
  }

  async updateTicketType(slug, ticketTypeId, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);

    const ticketType = await TicketType.findOneAndUpdate(
      { _id: ticketTypeId, event: event._id, deletedAt: null },
      { $set: this._pickTicketTypeFields(data) },
      { new: true, runValidators: true },
    ).exec();

    if (!ticketType) throw new NotFoundError('Ticket type not found.');

    await this._syncEventPricingSummary(event._id);
    return ticketType;
  }

  async deleteTicketType(slug, ticketTypeId, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);

    const ticketType = await TicketType.findOneAndUpdate(
      { _id: ticketTypeId, event: event._id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { new: true },
    ).exec();

    if (!ticketType) throw new NotFoundError('Ticket type not found.');

    await this._syncEventPricingSummary(event._id);
    return { message: 'Ticket type deleted.' };
  }

  async createSeatSection(slug, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);

    return SeatSection.create({
      eventId: event._id,
      name: data.name,
      capacity: data.capacity,
      color: data.color,
    });
  }

  async updateSeatSection(slug, sectionId, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);

    const section = await SeatSection.findOneAndUpdate(
      { _id: sectionId, eventId: event._id },
      {
        $set: {
          name: data.name,
          capacity: data.capacity,
          color: data.color,
        },
      },
      { new: true, runValidators: true },
    ).exec();

    if (!section) throw new NotFoundError('Seat section not found.');
    return section;
  }

  async approveEvent(slug) {
    const event = await this._getEventBySlugOrThrow(slug);
    return eventRepository.updateById(event._id, { status: 'published', approvedAt: new Date() });
  }

  async rejectEvent(slug, reason = '') {
    const event = await this._getEventBySlugOrThrow(slug);
    return eventRepository.updateById(event._id, { status: 'rejected', rejectedReason: reason });
  }

  async featureEvent(id, featured = true) { return eventRepository.updateById(id, { isFeatured: featured }); }

  async getStats() { return eventRepository.getStats(); }

  _assertCanManage(event, user) {
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role);
    const organizerId = event.organizer?._id?.toString?.() || event.organizer?.toString?.();

    if (!isAdmin && organizerId !== getId(user)) {
      throw new ForbiddenError('Access denied.');
    }
  }

  _pickTicketTypeFields(data) {
    return {
      name: data.name,
      description: data.description,
      type: data.type,
      price: data.price,
      quantity: data.quantity,
      sold: data.sold,
      reserved: data.reserved,
      maxPerOrder: data.maxPerOrder,
      minPerOrder: data.minPerOrder,
      salesStart: data.salesStart,
      salesEnd: data.salesEnd,
      isActive: data.isActive,
      benefits: data.benefits,
      color: data.color,
      sortOrder: data.sortOrder,
    };
  }

  async _syncEventPricingSummary(eventId) {
    const ticketTypes = await TicketType.find({
      event: eventId,
      deletedAt: null,
      isActive: true,
    })
      .select('price quantity')
      .lean();

    if (!ticketTypes.length) {
      await eventRepository.updateById(eventId, {
        isFree: true,
        minPrice: 0,
        maxPrice: 0,
        totalCapacity: 0,
      });
      return;
    }

    const prices = ticketTypes.map((ticketType) => Number(ticketType.price || 0));
    const totalCapacity = ticketTypes.reduce(
      (sum, ticketType) => sum + Number(ticketType.quantity || 0),
      0,
    );

    await eventRepository.updateById(eventId, {
      isFree: prices.every((price) => price === 0),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      totalCapacity,
    });
  }
}

module.exports = new EventService();
