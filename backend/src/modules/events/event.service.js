'use strict';
const eventRepository = require('./event.repository');
const eventImageService = require('./event.image.service');
const Organizer = require('../organizers/organizer.model');
const TicketType = require('../tickets/ticketType.model');
const SeatSection = require('../tickets/seat_section.model');
const reviewRepository = require('../reviews/review.repository');
const promotionRepository = require('../promotions/promotion.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../common/errors/AppError');
const { ROLES } = require('../../common/constants/roles');
const { invalidateCachePatterns } = require('../../common/middleware/cache.middleware');
const logger = require('../../infrastructure/logger/logger');

const getId = (user) => user?._id?.toString() || user?.id || user?.userId;

class EventService {
  async _invalidatePublicEventCaches() {
    await invalidateCachePatterns(['http-cache:GET:*/events*']);
  }

  _formatCurrency(amount, currency = 'BDT') {
    const safeAmount = Number(amount || 0);
    if (currency === 'BDT') {
      return `Taka ${safeAmount.toLocaleString()}`;
    }

    return `${currency} ${safeAmount.toLocaleString()}`;
  }

  _toPlainEvent(event) {
    if (!event) {
      return event;
    }

    if (typeof event.toObject === 'function') {
      return event.toObject({ virtuals: true });
    }

    return { ...event };
  }

  _getEventImageUrls(event = {}) {
    return [...new Set([
      event?.coverImage,
      ...(Array.isArray(event?.images) ? event.images : []),
    ].filter(Boolean))];
  }

  _normalizeImageReactions(imageReactions = []) {
    const reactionMap = new Map();

    imageReactions.forEach((entry) => {
      const imageUrl = String(entry?.imageUrl || '').trim();
      if (!imageUrl) {
        return;
      }

      const existingReactors = reactionMap.get(imageUrl) || new Set();
      const rawReactorIds = Array.isArray(entry?.reactorIds) ? entry.reactorIds : [];

      rawReactorIds.forEach((reactorId) => {
        const normalizedReactorId =
          reactorId?._id?.toString?.() ||
          reactorId?.id?.toString?.() ||
          reactorId?.toString?.() ||
          null;

        if (normalizedReactorId) {
          existingReactors.add(normalizedReactorId);
        }
      });

      reactionMap.set(imageUrl, existingReactors);
    });

    return Array.from(reactionMap.entries()).map(([imageUrl, reactorIds]) => ({
      imageUrl,
      reactorIds: Array.from(reactorIds),
    }));
  }

  _pruneImageReactionsForState(state = {}, imageReactions = []) {
    const validImageUrls = new Set(this._getEventImageUrls(state));
    return this._normalizeImageReactions(imageReactions).filter((entry) =>
      validImageUrls.has(entry.imageUrl)
    );
  }

  _buildImageReactionSummary(event = {}, user = null) {
    const userId = getId(user)?.toString?.() || null;
    const summary = {};
    const normalizedReactions = this._pruneImageReactionsForState(
      event,
      event?.imageReactions,
    );

    normalizedReactions.forEach((entry) => {
      const reactorIds = Array.isArray(entry?.reactorIds)
        ? entry.reactorIds.map((reactorId) => reactorId?.toString?.() || reactorId)
        : [];

      summary[entry.imageUrl] = {
        count: reactorIds.length,
        hasReacted: Boolean(userId && reactorIds.includes(userId)),
      };
    });

    this._getEventImageUrls(event).forEach((imageUrl) => {
      if (!summary[imageUrl]) {
        summary[imageUrl] = {
          count: 0,
          hasReacted: false,
        };
      }
    });

    return summary;
  }

  _serializeEvent(event, user = null) {
    if (!event) {
      return null;
    }

    const plainEvent = this._toPlainEvent(event);
    const imageReactions = this._pruneImageReactionsForState(
      plainEvent,
      plainEvent.imageReactions,
    );
    const serializedEvent = {
      ...plainEvent,
      imageReactionSummary: this._buildImageReactionSummary(
        { ...plainEvent, imageReactions },
        user,
      ),
    };

    delete serializedEvent.imageReactions;
    return serializedEvent;
  }

  _serializeEventList(result, user = null) {
    if (!result?.events) {
      return result;
    }

    return {
      ...result,
      events: result.events.map((event) => this._serializeEvent(event, user)),
    };
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

  _matchesOrganizerProfileOwner(event, organizerProfileId) {
    if (!organizerProfileId) {
      return false;
    }

    const normalizedOrganizerProfileId = organizerProfileId.toString();
    const eventOrganizerProfileId =
      event?.organizerProfile?._id?.toString?.() ||
      event?.organizerProfile?.id?.toString?.() ||
      event?.organizerProfile?.toString?.() ||
      null;
    const eventOrganizerId =
      event?.organizer?._id?.toString?.() ||
      event?.organizer?.id?.toString?.() ||
      event?.organizer?.toString?.() ||
      null;

    return (
      eventOrganizerProfileId === normalizedOrganizerProfileId ||
      eventOrganizerId === normalizedOrganizerProfileId
    );
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

    // Event images are managed through dedicated Cloudinary upload endpoints.
    // Ignore direct URL mutation through the generic create/update payloads.
    if (payload.coverImage !== undefined) delete payload.coverImage;
    if (payload.images !== undefined) delete payload.images;

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

    await this._invalidatePublicEventCaches();
    logger.info(`Event created: ${event._id} by ${organizerId}`);
    return this._serializeEvent(event, user);
  }

  async getEvents(query = {}, user = null) {
    return this._serializeEventList(
      await eventRepository.findPublished(query),
      user,
    );
  }

  async getFeaturedEvents(query = {}, user = null) {
    return this._serializeEventList(
      await eventRepository.findPublished({ ...query, isFeatured: true }),
      user,
    );
  }

  async getTrendingEvents(query = {}, user = null) {
    return this._serializeEventList(
      await eventRepository.findPublished({
        ...query,
        startDate: query.startDate || new Date().toISOString(),
        sort: query.sort || '-isTrending -trendScore -totalSold startDate',
      }),
      user,
    );
  }

  async getOfferEvents(query = {}, user = null) {
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

    return this._serializeEventList({
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
    }, user);
  }

  async getUpcomingEvents(query = {}, user = null) {
    return this._serializeEventList(
      await eventRepository.findPublished({
        ...query,
        startDate: query.startDate || new Date().toISOString(),
        sort: query.sort || 'startDate',
      }),
      user,
    );
  }

  async getEventById(id, user) {
    const event = await this._getEventByIdOrThrow(id);
    this._assertCanView(event, user);
    return this._serializeEvent(event, user);
  }

  async getEventBySlug(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);
    return this._serializeEvent(event, user);
  }

  async updateEvent(slug, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    const payload = this._sanitizeEventPayload(data, user);
    if (!payload.organizerProfile) {
      payload.organizerProfile = event.organizerProfile?._id || event.organizerProfile || await this._resolveOrganizerProfileId(getId(user));
    }

    const updatedEvent = await eventRepository.updateById(event._id, payload);
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  // ── Cover image (Cloudinary) ─────────────────────────────────────────────────
  async uploadCoverImage(slug, file, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);
    const url = await eventImageService.uploadCover(file.buffer, event._id.toString());
    // Delete old cover if it was a different URL (stable public_id means same URL on overwrite)
    if (event.coverImage && event.coverImage !== url) {
      await eventImageService.deleteCover(event.coverImage);
    }
    const updatedEvent = await eventRepository.updateById(event._id, {
      coverImage: url,
      imageReactions: this._pruneImageReactionsForState(
        { ...event, coverImage: url },
        event.imageReactions,
      ),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async removeCoverImage(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);
    if (event.coverImage) await eventImageService.deleteCover(event.coverImage);
    const updatedEvent = await eventRepository.updateById(event._id, {
      coverImage: null,
      imageReactions: this._pruneImageReactionsForState(
        { ...event, coverImage: null },
        event.imageReactions,
      ),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  // ── Gallery images (Cloudinary) ──────────────────────────────────────────────
  async uploadGalleryImages(slug, files, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);
    const existing = Array.isArray(event.images) ? event.images : [];
    const incomingFiles = Array.isArray(files) ? files : [];
    const remainingSlots = Math.max(0, 10 - existing.length);

    if (!incomingFiles.length) {
      throw new BadRequestError('No gallery images were uploaded.');
    }

    if (incomingFiles.length > remainingSlots) {
      throw new BadRequestError(
        remainingSlots > 0
          ? `You can upload ${remainingSlots} more gallery image${remainingSlots === 1 ? '' : 's'}.`
          : 'This event already has the maximum of 10 gallery images.',
      );
    }

    const newUrls = await eventImageService.uploadGallery(incomingFiles, event._id.toString());
    const nextImages = [...existing, ...newUrls];
    const updatedEvent = await eventRepository.updateById(event._id, {
      images: nextImages,
      imageReactions: this._pruneImageReactionsForState(
        { ...event, images: nextImages },
        event.imageReactions,
      ),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async removeGalleryImage(slug, imageUrl, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);
    await eventImageService.deleteGalleryImage(imageUrl);
    const updated = (event.images || []).filter((u) => u !== imageUrl);
    const updatedEvent = await eventRepository.updateById(event._id, {
      images: updated,
      imageReactions: this._pruneImageReactionsForState(
        { ...event, images: updated },
        event.imageReactions,
      ),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async removeGalleryImages(slug, imageUrls = [], user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    const currentImages = Array.isArray(event.images) ? event.images.filter(Boolean) : [];
    const removableUrls = [...new Set(imageUrls.filter(Boolean))]
      .filter((url) => currentImages.includes(url));

    if (!removableUrls.length) {
      return this._serializeEvent(event, user);
    }

    await eventImageService.deleteGallery(removableUrls);
    const removableSet = new Set(removableUrls);
    const nextImages = currentImages.filter((url) => !removableSet.has(url));
    const updatedEvent = await eventRepository.updateById(event._id, {
      images: nextImages,
      imageReactions: this._pruneImageReactionsForState(
        { ...event, images: nextImages },
        event.imageReactions,
      ),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async reorderGalleryImages(slug, orderedUrls = [], user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    const currentImages = Array.isArray(event.images) ? event.images.filter(Boolean) : [];
    const nextImages = Array.isArray(orderedUrls) ? orderedUrls.filter(Boolean) : [];

    if (currentImages.length !== nextImages.length) {
      throw new BadRequestError('Gallery order must include every current image exactly once.');
    }

    const currentSet = new Set(currentImages);
    const nextSet = new Set(nextImages);

    if (currentSet.size !== nextSet.size || currentImages.some((url) => !nextSet.has(url))) {
      throw new BadRequestError('Gallery order contains invalid image URLs.');
    }

    const updatedEvent = await eventRepository.updateById(event._id, {
      images: nextImages,
      imageReactions: this._pruneImageReactionsForState(
        { ...event, images: nextImages },
        event.imageReactions,
      ),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async toggleImageReaction(slug, imageUrl, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);

    const normalizedImageUrl = String(imageUrl || '').trim();
    const validImageUrls = new Set(this._getEventImageUrls(event));

    if (!normalizedImageUrl || !validImageUrls.has(normalizedImageUrl)) {
      throw new BadRequestError('This image is not available for reactions.');
    }

    const userId = getId(user);
    if (!userId) {
      throw new ForbiddenError('You must be logged in to react to a photo.');
    }

    const nextImageReactions = this._normalizeImageReactions(event.imageReactions);
    const targetReaction = nextImageReactions.find(
      (entry) => entry.imageUrl === normalizedImageUrl,
    );

    if (!targetReaction) {
      nextImageReactions.push({
        imageUrl: normalizedImageUrl,
        reactorIds: [userId],
      });
    } else if (targetReaction.reactorIds.includes(userId)) {
      targetReaction.reactorIds = targetReaction.reactorIds.filter(
        (reactorId) => reactorId !== userId,
      );
    } else {
      targetReaction.reactorIds = [...targetReaction.reactorIds, userId];
    }

    const updatedEvent = await eventRepository.updateById(event._id, {
      imageReactions: this._pruneImageReactionsForState(event, nextImageReactions),
    });
    await this._invalidatePublicEventCaches();

    const serializedEvent = this._serializeEvent(updatedEvent, user);

    return {
      event: serializedEvent,
      reaction: {
        imageUrl: normalizedImageUrl,
        ...(serializedEvent.imageReactionSummary?.[normalizedImageUrl] || {
          count: 0,
          hasReacted: false,
        }),
      },
    };
  }

  async deleteEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);
    await eventRepository.softDeleteById(event._id);
    await this._invalidatePublicEventCaches();
    return { message: 'Event deleted.' };
  }

  async publishEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role)) {
      if (event.status === 'published') {
        throw new BadRequestError('Event already published.');
      }

      const updatedEvent = await eventRepository.updateById(event._id, {
        status: 'published',
        publishedAt: new Date(),
        moderatedBy: getId(user),
        moderatedAt: new Date(),
        rejectionReason: '',
      });
      await this._invalidatePublicEventCaches();
      return this._serializeEvent(updatedEvent, user);
    }

    if (event.status === 'pending') {
      throw new BadRequestError('Event is already awaiting review.');
    }

    await this._assertReadyForReview(event);

    const updatedEvent = await eventRepository.updateById(event._id, {
      status: 'pending',
      rejectionReason: '',
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async cancelEvent(slug, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);
    const updatedEvent = await eventRepository.updateById(event._id, { status: 'cancelled' });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async getOrganizerEvents(organizerId, query = {}, user = null) {
    return this._serializeEventList(
      await eventRepository.findByOrganizer(organizerId, query),
      user,
    );
  }

  async getAllEventsAdmin(query = {}, user = null) {
    return this._serializeEventList(await eventRepository.findAll(query), user);
  }

  async getRelatedEvents(slug, limit = 6, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    this._assertCanView(event, user);

    return this._serializeEventList(
      await eventRepository.findPublished({
        category: event.category?._id || event.category,
        excludeId: event._id,
        page: 1,
        limit,
        sort: 'startDate',
      }),
      user,
    );
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
    await this._assertCanManage(event, user);

    const ticketType = await TicketType.create({
      event: event._id,
      ...this._pickTicketTypeFields(data),
    });

    await this._syncEventPricingSummary(event._id);
    await this._invalidatePublicEventCaches();
    return ticketType;
  }

  async updateTicketType(slug, ticketTypeId, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    const ticketType = await TicketType.findOneAndUpdate(
      { _id: ticketTypeId, event: event._id, deletedAt: null },
      { $set: this._pickTicketTypeFields(data) },
      { new: true, runValidators: true },
    ).exec();

    if (!ticketType) throw new NotFoundError('Ticket type not found.');

    await this._syncEventPricingSummary(event._id);
    await this._invalidatePublicEventCaches();
    return ticketType;
  }

  async deleteTicketType(slug, ticketTypeId, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    const ticketType = await TicketType.findOneAndUpdate(
      { _id: ticketTypeId, event: event._id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { new: true },
    ).exec();

    if (!ticketType) throw new NotFoundError('Ticket type not found.');

    await this._syncEventPricingSummary(event._id);
    await this._invalidatePublicEventCaches();
    return { message: 'Ticket type deleted.' };
  }

  async createSeatSection(slug, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

    return SeatSection.create({
      eventId: event._id,
      name: data.name,
      capacity: data.capacity,
      color: data.color,
    });
  }

  async updateSeatSection(slug, sectionId, data, user) {
    const event = await this._getEventBySlugOrThrow(slug);
    await this._assertCanManage(event, user);

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
    const updatedEvent = await eventRepository.updateById(event._id, {
      status: 'published',
      publishedAt: new Date(),
      moderatedBy: getId(actor),
      moderatedAt: new Date(),
      rejectionReason: '',
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, actor);
  }

  async rejectEvent(slug, reason = '', actor) {
    const event = await this._getEventBySlugOrThrow(slug);
    const updatedEvent = await eventRepository.updateById(event._id, {
      status: 'rejected',
      rejectionReason: reason,
      moderatedBy: getId(actor),
      moderatedAt: new Date(),
    });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, actor);
  }

  async featureEvent(id, featured = true, user = null) {
    const updatedEvent = await eventRepository.updateById(id, { isFeatured: featured });
    await this._invalidatePublicEventCaches();
    return this._serializeEvent(updatedEvent, user);
  }

  async getStats() {
    return eventRepository.getStats();
  }

  async _assertCanManage(event, user) {
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role);

    if (isAdmin || this._isOwner(event, user)) {
      return;
    }

    const userId = getId(user);
    const organizerProfileId =
      user?.organizerProfile?._id?.toString?.() ||
      user?.organizerProfile?.id?.toString?.() ||
      user?.organizerProfile?.toString?.() ||
      await this._resolveOrganizerProfileId(userId);

    if (this._matchesOrganizerProfileOwner(event, organizerProfileId)) {
      return;
    }

    throw new ForbiddenError('Access denied.');
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
