'use strict';
const eventRepository = require('./event.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');
const getId = (u) => u?._id?.toString() || u?.id || u?.userId;

class EventService {
  async createEvent(data, user) {
    const event = await eventRepository.create({ ...data, organizer: getId(user) });
    logger.info(`Event created: ${event._id} by ${getId(user)}`);
    return event;
  }

  async getEvents(query = {}) { return eventRepository.findPublished(query); }

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async getEventBySlug(slug) {
    const event = await eventRepository.findBySlug(slug);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async updateEvent(id, data, user) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role);
    if (!isAdmin && event.organizer._id.toString() !== getId(user)) throw new ForbiddenError('Access denied.');
    return eventRepository.updateById(id, data);
  }

  async deleteEvent(id, user) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role);
    if (!isAdmin && event.organizer._id.toString() !== getId(user)) throw new ForbiddenError('Access denied.');
    await eventRepository.softDeleteById(id);
    return { message: 'Event deleted.' };
  }

  async publishEvent(id, user) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    if (event.organizer._id.toString() !== getId(user) && ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role)) throw new ForbiddenError('Access denied.');
    if (event.status === 'published') throw new BadRequestError('Event already published.');
    return eventRepository.updateById(id, { status: 'published', publishedAt: new Date() });
  }

  async cancelEvent(id, user) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    if (event.organizer._id.toString() !== getId(user) && ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role)) throw new ForbiddenError('Access denied.');
    return eventRepository.updateById(id, { status: 'cancelled' });
  }

  async getOrganizerEvents(organizerId, query = {}) { return eventRepository.findByOrganizer(organizerId, query); }

  async getAllEventsAdmin(query = {}) { return eventRepository.findAll(query); }

  async approveEvent(id) { return eventRepository.updateById(id, { status: 'published', approvedAt: new Date() }); }

  async rejectEvent(id, reason = '') { return eventRepository.updateById(id, { status: 'rejected', rejectedReason: reason }); }

  async featureEvent(id, featured = true) { return eventRepository.updateById(id, { isFeatured: featured }); }

  async getStats() { return eventRepository.getStats(); }
}

module.exports = new EventService();
