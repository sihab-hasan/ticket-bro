'use strict';
const eventRepository = require('./event.repository');
const Organizer = require('../organizers/organizer.model');
const TicketType = require('../tickets/ticketType.model');
const SeatSection = require('../tickets/seat_section.model');
const reviewRepository = require('../reviews/review.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');

const getId = (user) => user?._id?.toString() || user?.id || user?.userId;

class EventService {
  async _getEventBySlugOrThrow(slug) {
    const event = await eventRepository.findBySlug(slug);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  async _getEventByIdOrThrow(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found.');
    return event;
  }

  _isStaff(user) {
    return [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role);
  }

  _isOwner(event, user) {
    const organizerId = event.organizer?._id?.toString?.() || event.organizer?.toString?.();
    return organizerId === getId(user);
  }

  _canViewDirectLink(event) {
    return event.status === 'published' && ['public', 'unlisted'].includes(event.visibility);
  }

  _assertCanView(event, user) {
    if (this._canViewDirectLink(event)) {
      return;
    }

    if (user && (this._isStaff(user) || this._isOwner(event, user))) {
      return;
    }

    throw new NotFoundError('Event not found.');
  }

  _sanitizeEventPayload(data = {}, user, { isCreate = false } = {}) {
    const payload = { ...data };
    const isAdminLike = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role);

    if (payload.location) {
      const location = { ...payload.location };
      const coords = location.coordinates?.coordinates;
      const hasValidCoordinates = Array.isArray(coords)
        && coords.length === 2
        && coords.every((value) => Number.isFinite(value));

      if (hasValidCoordinates) {
        location.coordinates = {
          type: 'Point',
          coordinates: coords.map(Number),
        };
      } else {
        delete location.coordinates;
      }

      payload.location = location;
    }

    if (!isAdminLike) {
      if (payload.status === 'published') {
        payload.status = 'pending';
      }

      if (isCreate && !payload.status) {
        payload.status = 'draft';
      }

      if (payload.isFeatured !== undefined) delete payload.isFeatured;
      if (payload.isTrending !== undefined) delete payload.isTrending;
      if (payload.isSponsored !== undefined) delete payload.isSponsored;
      if (payload.isVerified !== undefined) delete payload.isVerified;
      if (payload.requiresApproval !== undefined) delete payload.requiresApproval;
      if (payload.moderatedBy !== undefined) delete payload.moderatedBy;
      if (payload.moderatedAt !== undefined) delete payload.moderatedAt;
      if (payload.rejectionReason !== undefined && payload.status !== 'rejected') {
        delete payload.rejectionReason;
      }
    }

    return payload;
  }

  async _resolveOrganizerProfileId(userId) {
    if (!userId) return undefined;

    const organizerProfile = await Organizer.findOne({ user: userId, deletedAt: null })
      .select('_id')
      .lean();

    return organizerProfile?._id;
  }

  async createEvent(data, user) {
    const organizerId = getId(user);
    const payload = this._sanitizeEventPayload(data, user, { isCreate: true });
    const organizerProfileId = await this._resolveOrganizerProfileId(organizerId);

    const event = await eventRepository.create({
      ...payload,
      organizer: organizerId,
      organizerProfile: payload.organizerProfile || organizerProfileId,
    });

    logger.info(`Event created: ${event._id} by ${organizerId}`);
    return event;
  }

  async getEvents(query = {}) {
    return eventRepository.findPublished(query);
  }

  async getFeaturedEvents(query = {}) {
    return eventRepository.findPublished({ ...query, isFeatured: true });
  }

  async getTrendingEvents(query = {}) {
    return eventRepository.findPublished({ ...query, sort: query.sort || '-trendScore -totalSold' });
  }

  async getUpcomingEvents(query = {}) {
    return eventRepository.findPublished({
      ...query,
      startDate: query.startDate || new Date().toISOString(),
      sort: query.sort || 'startDate',
    });
  }

  async getEventById(id, user) {
    const event = await this._getEventByIdOrThrow(id);
    this._assertCanView(event, user);
    return event;
  }

  async getEventBySlug(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);
    return event;
  }

  async updateEvent(slug, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);

    const payload = this._sanitizeEventPayload(data, user);
    if (!payload.organizerProfile) {
      payload.organizerProfile = event.organizerProfile?._id || event.organizerProfile || await this._resolveOrganizerProfileId(getId(user));
    }

    return eventRepository.updateById(event._id, payload);
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

    if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role)) {
      if (event.status === 'published') {
        throw new BadRequestError('Event already published.');
      }

      return eventRepository.updateById(event._id, {
        status: 'published',
        publishedAt: new Date(),
        moderatedBy: getId(user),
        moderatedAt: new Date(),
        rejectionReason: '',
      });
    }

    if (event.status === 'pending') {
      throw new BadRequestError('Event is already awaiting review.');
    }

    await this._assertReadyForReview(event);

    return eventRepository.updateById(event._id, {
      status: 'pending',
      rejectionReason: '',
    });
  }

  async cancelEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanManage(event, user);
    return eventRepository.updateById(event._id, { status: 'cancelled' });
  }

  async getOrganizerEvents(organizerId, query = {}) {
    return eventRepository.findByOrganizer(organizerId, query);
  }

  async getAllEventsAdmin(query = {}) {
    return eventRepository.findAll(query);
  }

  async getRelatedEvents(slug, limit = 6, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);

    return eventRepository.findPublished({
      category: event.category?._id || event.category,
      excludeId: event._id,
      page: 1,
      limit,
      sort: 'startDate',
    });
  }

  async getTicketTypes(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);

    return TicketType.find({
      event: event._id,
      deletedAt: null,
      isActive: true,
    })
      .sort('sortOrder price')
      .lean();
  }

  async getEventTickets(slug, user) {
    const ticketTypes = await this.getTicketTypes(slug, user);
    return { ticketTypes };
  }

  async getEventReviews(slug, query = {}, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);
    return reviewRepository.findByEventId({ eventId: event._id, ...query });
  }

  async getSeatSections(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);
    return SeatSection.find({ eventId: event._id }).sort('name').lean();
  }

  async getSeatMap(slug, user) {
    const sections = await this.getSeatSections(slug, user);
    return { sections, seats: [] };
  }

  async trackView(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);
    await eventRepository.incrementViewCount(event._id);
    return { viewCount: Number(event.viewCount || 0) + 1 };
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

  async approveEvent(slug, actor) {
    const event = await this._getEventBySlugOrThrow(slug);
    return eventRepository.updateById(event._id, {
      status: 'published',
      publishedAt: new Date(),
      moderatedBy: getId(actor),
      moderatedAt: new Date(),
      rejectionReason: '',
    });
  }

  async rejectEvent(slug, reason = '', actor) {
    const event = await this._getEventBySlugOrThrow(slug);
    return eventRepository.updateById(event._id, {
      status: 'rejected',
      rejectionReason: reason,
      moderatedBy: getId(actor),
      moderatedAt: new Date(),
    });
  }

  async featureEvent(id, featured = true) {
    return eventRepository.updateById(id, { isFeatured: featured });
  }

  async getStats() {
    return eventRepository.getStats();
  }

  _assertCanManage(event, user) {
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role);

    if (!isAdmin && !this._isOwner(event, user)) {
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

  async _assertReadyForReview(event) {
    const missing = [];

    if (!event?.title?.trim()) missing.push('title');
    if (!event?.description?.trim()) missing.push('description');
    if (!event?.category) missing.push('category');
    if (!event?.startDate) missing.push('start date');
    if (!event?.endDate) missing.push('end date');

    if (event?.startDate && event?.endDate && new Date(event.endDate) <= new Date(event.startDate)) {
      throw new BadRequestError('Event end date must be after the start date before submission.');
    }

    const isOnline = event?.location?.type === 'online' || event?.location?.type === 'hybrid';
    if (isOnline) {
      if (!event?.location?.onlineUrl?.trim()) missing.push('online event link');
    } else if (!event?.location?.name?.trim()) {
      missing.push('venue name');
    }

    const activeTicketCount = await TicketType.countDocuments({
      event: event._id,
      deletedAt: null,
      isActive: true,
    });

    if (!activeTicketCount) missing.push('at least one active ticket type');

    if (missing.length) {
      throw new BadRequestError(
        `Complete the draft before submitting for review: ${missing.join(', ')}.`
      );
    }
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
