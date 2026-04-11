// src/modules/eventTypes/eventTypes.service.js
'use strict';
const eventTypeRepository = require('./eventTypes.repository');
const { invalidateCachePatterns } = require('../../common/middleware/cache.middleware');
const { NotFoundError } = require('../../common/errors/AppError');

const EVENTTYPE_CACHE_PATTERNS = ['http-cache:GET:*/event-types*'];

class EventTypesService {
  async getAll(query = {})     { return eventTypeRepository.findAll(query); }
  async getAllAdmin(query = {}) { return eventTypeRepository.findAll({ ...query, includeInactive: true }); }

  async getBySlug(slug) {
    const et = await eventTypeRepository.findBySlug(slug);
    if (!et) throw new NotFoundError('Event type not found.');
    return et;
  }

  async create(data) {
    const result = await eventTypeRepository.create(data);
    await invalidateCachePatterns(EVENTTYPE_CACHE_PATTERNS);
    return result;
  }

  async update(slug, data) {
    const et = await eventTypeRepository.updateBySlug(slug, data);
    if (!et) throw new NotFoundError('Event type not found.');
    await invalidateCachePatterns(EVENTTYPE_CACHE_PATTERNS);
    return et;
  }

  async remove(slug) {
    const et = await eventTypeRepository.deleteBySlug(slug);
    if (!et) throw new NotFoundError('Event type not found.');
    await invalidateCachePatterns(EVENTTYPE_CACHE_PATTERNS);
    return { message: 'Event type deleted.' };
  }
}

module.exports = new EventTypesService();
