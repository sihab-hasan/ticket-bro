'use strict';
const asyncHandler   = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const eventService   = require('./event.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class EventController {
  getEvents      = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getEvents(req.query)); });
  getFeaturedEvents = asyncHandler(async (req, res) => { sendSuccess(res, 'Featured events fetched.', await eventService.getFeaturedEvents(req.query)); });
  getTrendingEvents = asyncHandler(async (req, res) => { sendSuccess(res, 'Trending events fetched.', await eventService.getTrendingEvents(req.query)); });
  getUpcomingEvents = asyncHandler(async (req, res) => { sendSuccess(res, 'Upcoming events fetched.', await eventService.getUpcomingEvents(req.query)); });
  getEventBySlug = asyncHandler(async (req, res) => { sendSuccess(res, 'Event fetched.', { event: await eventService.getEventBySlug(req.params.slug) }); });
  getEventDetails = asyncHandler(async (req, res) => { sendSuccess(res, 'Event details fetched.', { event: await eventService.getEventBySlug(req.params.slug) }); });
  getEventById   = asyncHandler(async (req, res) => { sendSuccess(res, 'Event fetched.', { event: await eventService.getEventById(req.params.id) }); });
  getEventTickets = asyncHandler(async (req, res) => { sendSuccess(res, 'Event ticket types fetched.', await eventService.getEventTickets(req.params.slug)); });
  getEventReviews = asyncHandler(async (req, res) => { sendSuccess(res, 'Event reviews fetched.', await eventService.getEventReviews(req.params.slug, req.query)); });
  getRelatedEvents = asyncHandler(async (req, res) => { sendSuccess(res, 'Related events fetched.', await eventService.getRelatedEvents(req.params.slug, Number(req.query.limit || 6))); });
  getTicketTypes = asyncHandler(async (req, res) => { sendSuccess(res, 'Ticket types fetched.', { ticketTypes: await eventService.getTicketTypes(req.params.slug) }); });
  getSeatSections = asyncHandler(async (req, res) => { sendSuccess(res, 'Seat sections fetched.', { sections: await eventService.getSeatSections(req.params.slug) }); });
  getSeatMap = asyncHandler(async (req, res) => { sendSuccess(res, 'Seat map fetched.', await eventService.getSeatMap(req.params.slug)); });
  createEvent    = asyncHandler(async (req, res) => { sendCreated(res, 'Event created.', { event: await eventService.createEvent(req.body, req.user) }); });
  updateEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event updated.', { event: await eventService.updateEvent(req.params.slug, req.body, req.user) }); });
  deleteEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event deleted.', await eventService.deleteEvent(req.params.slug, req.user)); });
  publishEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Event published.', { event: await eventService.publishEvent(req.params.slug, req.user) }); });
  cancelEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event cancelled.', { event: await eventService.cancelEvent(req.params.slug, req.user) }); });
  createTicketType = asyncHandler(async (req, res) => { sendCreated(res, 'Ticket type created.', { ticketType: await eventService.createTicketType(req.params.slug, req.body, req.user) }); });
  updateTicketType = asyncHandler(async (req, res) => { sendSuccess(res, 'Ticket type updated.', { ticketType: await eventService.updateTicketType(req.params.slug, req.params.id, req.body, req.user) }); });
  deleteTicketType = asyncHandler(async (req, res) => { sendSuccess(res, 'Ticket type deleted.', await eventService.deleteTicketType(req.params.slug, req.params.id, req.user)); });
  createSeatSection = asyncHandler(async (req, res) => { sendCreated(res, 'Seat section created.', { section: await eventService.createSeatSection(req.params.slug, req.body, req.user) }); });
  updateSeatSection = asyncHandler(async (req, res) => { sendSuccess(res, 'Seat section updated.', { section: await eventService.updateSeatSection(req.params.slug, req.params.id, req.body, req.user) }); });
  getOrgEvents   = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getOrganizerEvents(getId(req.user), req.query)); });
  getAllAdmin     = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getAllEventsAdmin(req.query)); });
  adminGetAllEvents = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getAllEventsAdmin(req.query)); });
  approveEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Approved.', { event: await eventService.approveEvent(req.params.slug) }); });
  rejectEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Rejected.', { event: await eventService.rejectEvent(req.params.slug, req.body.reason) }); });
  featureEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Updated.', { event: await eventService.featureEvent(req.params.id, req.body.featured) }); });
}

module.exports = new EventController();
