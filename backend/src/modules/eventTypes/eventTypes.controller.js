// src/modules/eventTypes/eventTypes.controller.js
'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../common/utils/apiResponse');
const eventTypesService = require('./eventTypes.service');

class EventTypeController {
  // Public: active only (cached via route)
  getAll = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event types fetched.', { eventTypes: await eventTypesService.getAll() });
  });

  // Admin: all including inactive (auth header bypasses cache automatically)
  getAllAdmin = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event types fetched.', { eventTypes: await eventTypesService.getAllAdmin() });
  });

  getBySlug = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event type fetched.', { eventType: await eventTypesService.getBySlug(req.params.slug) });
  });

  create = asyncHandler(async (req, res) => {
    sendCreated(res, 'Event type created.', { eventType: await eventTypesService.create(req.body) });
  });

  update = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event type updated.', { eventType: await eventTypesService.update(req.params.slug, req.body) });
  });

  remove = asyncHandler(async (req, res) => {
    sendSuccess(res, 'Event type deleted.', await eventTypesService.remove(req.params.slug));
  });
}

module.exports = new EventTypeController();
