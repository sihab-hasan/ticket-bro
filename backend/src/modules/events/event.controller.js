'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const eventService = require('./event.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class EventController {
  getEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Events fetched.', await eventService.getEvents(req.query));
  });

  getFeaturedEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Featured events fetched.', await eventService.getFeaturedEvents(req.query));
  });

  getTrendingEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Trending events fetched.', await eventService.getTrendingEvents(req.query));
  });

  getOfferEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Offer events fetched.', await eventService.getOfferEvents(req.query));
  });

  getUpcomingEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Upcoming events fetched.', await eventService.getUpcomingEvents(req.query));
  });

  getEventBySlug = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event fetched.', { event: await eventService.getEventBySlug(req.params.slug, req.user) });
  });

  getEventDetails = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event details fetched.', { event: await eventService.getEventBySlug(req.params.slug, req.user) });
  });

  getEventById = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event fetched.', { event: await eventService.getEventById(req.params.id, req.user) });
  });

  getEventTickets = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event ticket types fetched.', await eventService.getEventTickets(req.params.slug, req.user));
  });

  getEventReviews = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event reviews fetched.', await eventService.getEventReviews(req.params.slug, req.query, req.user));
  });

  getRelatedEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Related events fetched.', await eventService.getRelatedEvents(req.params.slug, Number(req.query.limit || 6), req.user));
  });

  getTicketTypes = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Ticket types fetched.', { ticketTypes: await eventService.getTicketTypes(req.params.slug, req.user) });
  });

  getSeatSections = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Seat sections fetched.', { sections: await eventService.getSeatSections(req.params.slug, req.user) });
  });

  getSeatMap = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Seat map fetched.', await eventService.getSeatMap(req.params.slug, req.user));
  });

  trackView = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event view tracked.', await eventService.trackView(req.params.slug, req.user));
  });

  createEvent = asyncHandler(async (req, res) => {
    sendCreated(res, 'Event created.', { event: await eventService.createEvent(req.body, req.user) });
  });

  updateEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event updated.', { event: await eventService.updateEvent(req.params.slug, req.body, req.user) });
  });

  deleteEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event deleted.', await eventService.deleteEvent(req.params.slug, req.user));
  });

  publishEvent = asyncHandler(async (req, res) => {
    const event = await eventService.publishEvent(req.params.slug, req.user);
    const message = event?.status === 'pending' ? 'Event submitted for review.' : 'Event published.';
    sendSuccess(res, message, { event });
  });

  cancelEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event cancelled.', { event: await eventService.cancelEvent(req.params.slug, req.user) });
  });

  createTicketType = asyncHandler(async (req, res) => {
    sendCreated(res, 'Ticket type created.', { ticketType: await eventService.createTicketType(req.params.slug, req.body, req.user) });
  });

  updateTicketType = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Ticket type updated.', { ticketType: await eventService.updateTicketType(req.params.slug, req.params.id, req.body, req.user) });
  });

  deleteTicketType = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Ticket type deleted.', await eventService.deleteTicketType(req.params.slug, req.params.id, req.user));
  });

  createSeatSection = asyncHandler(async (req, res) => {
    sendCreated(res, 'Seat section created.', { section: await eventService.createSeatSection(req.params.slug, req.body, req.user) });
  });

  updateSeatSection = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Seat section updated.', { section: await eventService.updateSeatSection(req.params.slug, req.params.id, req.body, req.user) });
  });

  getOrgEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Events fetched.', await eventService.getOrganizerEvents(getId(req.user), req.query));
  });

  getAllAdmin = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Events fetched.', await eventService.getAllEventsAdmin(req.query));
  });

  adminGetAllEvents = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Events fetched.', await eventService.getAllEventsAdmin(req.query));
  });

  approveEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Approved.', { event: await eventService.approveEvent(req.params.slug, req.user) });
  });

  rejectEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Rejected.', { event: await eventService.rejectEvent(req.params.slug, req.body.reason, req.user) });
  });

  featureEvent = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Updated.', { event: await eventService.featureEvent(req.params.id, req.body.featured) });
  });

  // ── POST /events/:slug/images/cover ─────────────────────────────────────────
  uploadCoverImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No cover image uploaded. Send multipart/form-data with the "coverImage" field.',
      });
    }
    const event = await eventService.uploadCoverImage(req.params.slug, req.file, req.user);
    sendSuccess(res, 'Cover image updated.', { event });
  });

  // ── DELETE /events/:slug/images/cover ───────────────────────────────────────
  removeCoverImage = asyncHandler(async (req, res) => {
    const event = await eventService.removeCoverImage(req.params.slug, req.user);
    sendSuccess(res, 'Cover image removed.', { event });
  });

  // ── POST /events/:slug/images/gallery ───────────────────────────────────────
  uploadGalleryImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No gallery images uploaded. Send multipart/form-data with one or more "images" files.',
      });
    }
    const event = await eventService.uploadGalleryImages(req.params.slug, req.files, req.user);
    sendSuccess(res, 'Gallery images uploaded.', { event });
  });

  // ── DELETE /events/:slug/images/gallery ─────────────────────────────────────
  // Body: { url: "https://res.cloudinary.com/..." }
  removeGalleryImage = asyncHandler(async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: 'fail', message: 'Image URL is required.' });
    const event = await eventService.removeGalleryImage(req.params.slug, url, req.user);
    sendSuccess(res, 'Gallery image removed.', { event });
  });

  removeGalleryImages = asyncHandler(async (req, res) => {
    const { urls } = req.body;
    const event = await eventService.removeGalleryImages(req.params.slug, urls, req.user);
    sendSuccess(res, 'Gallery images removed.', { event });
  });

  reorderGalleryImages = asyncHandler(async (req, res) => {
    const event = await eventService.reorderGalleryImages(
      req.params.slug,
      req.body.images,
      req.user,
    );
    sendSuccess(res, 'Gallery order updated.', { event });
  });
}

module.exports = new EventController();
