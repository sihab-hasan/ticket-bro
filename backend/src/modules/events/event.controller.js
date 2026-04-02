'use strict';
const asyncHandler   = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const eventService   = require('./event.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class EventController {
  getEvents      = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getEvents(req.query)); });
  getEventBySlug = asyncHandler(async (req, res) => { sendSuccess(res, 'Event fetched.', { event: await eventService.getEventBySlug(req.params.slug) }); });
  getEventById   = asyncHandler(async (req, res) => { sendSuccess(res, 'Event fetched.', { event: await eventService.getEventById(req.params.id) }); });
  createEvent    = asyncHandler(async (req, res) => { sendCreated(res, 'Event created.', { event: await eventService.createEvent(req.body, req.user) }); });
  updateEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event updated.', { event: await eventService.updateEvent(req.params.id, req.body, req.user) }); });
  deleteEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event deleted.', await eventService.deleteEvent(req.params.id, req.user)); });
  publishEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Event published.', { event: await eventService.publishEvent(req.params.id, req.user) }); });
  cancelEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Event cancelled.', { event: await eventService.cancelEvent(req.params.id, req.user) }); });
  getOrgEvents   = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getOrganizerEvents(getId(req.user), req.query)); });
  getAllAdmin     = asyncHandler(async (req, res) => { sendSuccess(res, 'Events fetched.', await eventService.getAllEventsAdmin(req.query)); });
  approveEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Approved.', { event: await eventService.approveEvent(req.params.id) }); });
  rejectEvent    = asyncHandler(async (req, res) => { sendSuccess(res, 'Rejected.', { event: await eventService.rejectEvent(req.params.id, req.body.reason) }); });
  featureEvent   = asyncHandler(async (req, res) => { sendSuccess(res, 'Updated.', { event: await eventService.featureEvent(req.params.id, req.body.featured) }); });
}

module.exports = new EventController();
