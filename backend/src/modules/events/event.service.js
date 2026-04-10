'use strict';
const eventRepository = require('./event.repository');
const Organizer = require('../organizers/organizer.model');
const TicketType = require('../tickets/ticketType.model');
const SeatSection = require('../tickets/seat_section.model');
const reviewRepository = require('../reviews/review.repository');
const promotionRepository = require('../promotions/promotion.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const logger = require('../../infrastructure/logger/logger');

const getId = (user) => user?._id?.toString() || user?.id || user?.userId;

class EventService {
  _formatCurrency(amount, currency = 'BDT') {
    const safeAmount = Number(amount || 0);
    if (currency === 'BDT') {
      return `Taka ${safeAmount.toLocaleString()}`;
    }

    return `${currency} ${safeAmount.toLocaleString()}`;
  }

  _buildOfferMeta(promotion, event) {
    const basePrice = Math.max(Number(event?.minPrice || event?.maxPrice || 0), 0);
    const currency = event?.currency || 'BDT';
    let estimatedDiscount = 0;

    if (promotion.type === 'percentage') {
      estimatedDiscount = basePrice > 0 ? (basePrice * Number(promotion.value || 0)) / 100 : 0;
    } else {
      estimatedDiscount = Number(promotion.value || 0);
    }

    if (promotion.maxDiscount !== null && promotion.maxDiscount !== undefined) {
      estimatedDiscount = Math.min(estimatedDiscount, Number(promotion.maxDiscount || 0));
    }

    estimatedDiscount = Math.round(estimatedDiscount * 100) / 100;

    const estimatedDiscountPercent = basePrice > 0
      ? Math.min(100, Math.round((estimatedDiscount / basePrice) * 100))
      : promotion.type === 'percentage'
        ? Math.round(Number(promotion.value || 0))
        : 0;

    const remainingUses = promotion.maxUses !== null && promotion.maxUses !== undefined
      ? Math.max(0, Number(promotion.maxUses || 0) - Number(promotion.usedCount || 0))
      : null;

    const badge = promotion.type === 'percentage'
      ? `${Math.round(Number(promotion.value || 0))}% OFF`
      : `${this._formatCurrency(estimatedDiscount || promotion.value || 0, currency)} OFF`;

    const label = promotion.type === 'percentage'
      ? `Save ${Math.round(Number(promotion.value || 0))}% with code ${promotion.code}`
      : `Save ${this._formatCurrency(estimatedDiscount || promotion.value || 0, currency)} with code ${promotion.code}`;

    return {
      kind: 'promotion',
      code: promotion.code,
      type: promotion.type,
      value: Number(promotion.value || 0),
      badge,
      label,
      estimatedDiscount,
      estimatedDiscountPercent,
      minAmount: Number(promotion.minAmount || 0),
      expiresAt: promotion.endDate || null,
      remainingUses,
      isLimited: remainingUses !== null,
      sortScore: estimatedDiscountPercent * 1000 + estimatedDiscount,
    };
  }

  _buildFreeOfferMeta(event) {
    return {
      kind: 'free',
      code: null,
      type: 'free',
      value: 0,
      badge: 'FREE',
      label: 'Free entry available',
      estimatedDiscount: Number(event?.minPrice || 0),
      estimatedDiscountPercent: 100,
      minAmount: 0,
      expiresAt: event?.startDate || null,
      remainingUses: null,
      isLimited: false,
      sortScore: 100000,
    };
  }

  _compareOfferItems(a, b, sort = '') {
    if (sort === 'startDate') {
      return new Date(a.event?.startDate || 0) - new Date(b.event?.startDate || 0);
    }

    if (sort === '-startDate') {
      return new Date(b.event?.startDate || 0) - new Date(a.event?.startDate || 0);
    }

    if (sort === '-createdAt') {
      return new Date(b.offer?.expiresAt || b.event?.createdAt || 0) - new Date(a.offer?.expiresAt || a.event?.createdAt || 0);
    }

    return (
      Number(b.offer?.sortScore || 0) - Number(a.offer?.sortScore || 0) ||
      Number(b.event?.trendScore || 0) - Number(a.event?.trendScore || 0) ||
      new Date(a.event?.startDate || 0) - new Date(b.event?.startDate || 0)
    );
  }

  _matchesSearch(text, search) {
    return String(text || '').toLowerCase().includes(search);
  }

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
    const userId = getId(user);
    if (!userId) {
      return false;
    }

    if (typeof event?.isManagedBy === 'function') {
      return event.isManagedBy(userId);
    }

    const organizerId = event.organizer?._id?.toString?.() || event.organizer?.toString?.();
    const coOrganizerIds = Array.isArray(event?.coOrganizers)
      ? event.coOrganizers.map((member) => member?._id?.toString?.() || member?.toString?.())
      : [];

    return organizerId === userId || coOrganizerIds.includes(userId);
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

    if (Array.isArray(payload.coOrganizers)) {
      const ownerId = getId(user);
      payload.coOrganizers = [...new Set(
        payload.coOrganizers
          .map((member) => member?._id?.toString?.() || member?.id?.toString?.() || member?.toString?.())
          .filter(Boolean),
      )].filter((memberId) => memberId !== ownerId);
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
    return eventRepository.findPublished({
      ...query,
      startDate: query.startDate || new Date().toISOString(),
      sort: query.sort || '-isTrending -trendScore -totalSold startDate',
    });
  }

  async getOfferEvents(query = {}) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const normalizedSearch = String(query.search || '').trim().toLowerCase();
    const offerMap = new Map();

    const promotions = await promotionRepository.findPublicEventOffers({
      category: query.category,
    });

    promotions.forEach((promotion) => {
      const event = promotion.event;
      if (!event?._id) return;

      const offer = this._buildOfferMeta(promotion, event);
      const key = event._id.toString();
      const existing = offerMap.get(key);

      if (!existing || offer.sortScore > existing.offer.sortScore) {
        offerMap.set(key, {
          event: { ...event, offer },
          offer,
        });
      }
    });

    if (offerMap.size < limit) {
      const freeCandidates = await eventRepository.findPublished({
        category: query.category,
        organizer: query.organizer,
        isFree: true,
        startDate: query.startDate || new Date().toISOString(),
        sort: 'startDate',
        page: 1,
        limit: Math.max(limit * 2, 12),
      });

      (freeCandidates.events || []).forEach((event) => {
        const key = event?._id?.toString?.();
        if (!key || offerMap.has(key)) {
          return;
        }

        const offer = this._buildFreeOfferMeta(event);
        offerMap.set(key, {
          event: { ...event, offer },
          offer,
        });
      });
    }

    let items = Array.from(offerMap.values());

    if (query.organizer) {
      items = items.filter(({ event }) => {
        const organizerId = event?.organizer?._id?.toString?.() || event?.organizer?.toString?.();
        return organizerId === String(query.organizer);
      });
    }

    if (query.startDate) {
      const start = new Date(query.startDate).getTime();
      items = items.filter(({ event }) => new Date(event?.startDate || 0).getTime() >= start);
    }

    if (query.endDate) {
      const end = new Date(query.endDate).getTime();
      items = items.filter(({ event }) => new Date(event?.endDate || 0).getTime() <= end);
    }

    if (normalizedSearch) {
      items = items.filter(({ event, offer }) => (
        this._matchesSearch(event?.title, normalizedSearch) ||
        this._matchesSearch(event?.description, normalizedSearch) ||
        this._matchesSearch(event?.category?.name, normalizedSearch) ||
        this._matchesSearch(event?.organizerProfile?.displayName || event?.organizer?.organizationName, normalizedSearch) ||
        this._matchesSearch(offer?.code, normalizedSearch)
      ));
    }

    items.sort((a, b) => this._compareOfferItems(a, b, query.sort));

    const total = items.length;
    const pagedItems = items
      .slice((page - 1) * limit, page * limit)
      .map(({ event }) => event);

    const expiringSoon = items.filter(({ offer }) => {
      if (!offer?.expiresAt) return false;
      const expiresAt = new Date(offer.expiresAt).getTime();
      const now = Date.now();
      const inAWeek = now + 7 * 24 * 60 * 60 * 1000;
      return expiresAt >= now && expiresAt <= inAWeek;
    }).length;

    const promotionCount = items.filter(({ offer }) => offer?.kind === 'promotion').length;
    const freeCount = items.filter(({ offer }) => offer?.kind === 'free').length;
    const averageDiscountPercent = promotionCount
      ? Math.round(
        items
          .filter(({ offer }) => offer?.kind === 'promotion')
          .reduce((sum, { offer }) => sum + Number(offer?.estimatedDiscountPercent || 0), 0) / promotionCount,
      )
      : 0;

    return {
      events: pagedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalOffers: total,
        promotionCount,
        freeCount,
        averageDiscountPercent,
        expiringSoon,
      },
    };
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

    const canManage = Boolean(user && (this._isStaff(user) || this._isOwner(event, user)));
    const filter = {
      event: event._id,
      deletedAt: null,
    };

    if (!canManage) {
      filter.isActive = true;
    }

    return TicketType.find(filter)
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

    const locationType = event?.location?.type || 'physical';

    if (['online', 'hybrid'].includes(locationType) && !event?.location?.onlineUrl?.trim()) {
      missing.push('online event link');
    }

    if (['physical', 'hybrid'].includes(locationType) && !event?.location?.name?.trim()) {
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
