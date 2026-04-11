'use strict';
const axios = require('axios');
const Event = require('../events/event.model');
const cacheService = require('../../infrastructure/cache/cacheService');
const logger = require('../../infrastructure/logger/logger');
const { BadRequestError } = require('../../common/errors/AppError');
const {
  formatResolvedLocation,
  pickCityName,
  roundCoordinate,
} = require('./location.utils');

const REVERSE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const reverseLookupMemory = new Map();

const getReverseCacheKey = (lat, lng) => `location:reverse:${lat}:${lng}`;

const getMemoryEntry = (key) => {
  const entry = reverseLookupMemory.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    reverseLookupMemory.delete(key);
    return null;
  }

  return entry.value;
};

const setMemoryEntry = (key, value) => {
  reverseLookupMemory.set(key, {
    value,
    expiresAt: Date.now() + REVERSE_CACHE_TTL_SECONDS * 1000,
  });
};

class LocationService {
  async getCities() {
    const cities = await Event.aggregate([
      {
        $match: {
          status: 'published',
          visibility: 'public',
          deletedAt: null,
          'location.city': { $exists: true, $ne: '' },
        },
      },
      { $group: { _id: '$location.city', country: { $first: '$location.country' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 100 },
    ]);
    return { cities };
  }

  async reverseGeocode(lat, lng) {
    const roundedLat = roundCoordinate(lat);
    const roundedLng = roundCoordinate(lng);

    if (!Number.isFinite(roundedLat) || !Number.isFinite(roundedLng)) {
      throw new BadRequestError('Valid latitude and longitude are required.');
    }

    const cacheKey = getReverseCacheKey(roundedLat, roundedLng);
    const memoryHit = getMemoryEntry(cacheKey);
    if (memoryHit) {
      return memoryHit;
    }

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      setMemoryEntry(cacheKey, cached);
      return cached;
    }

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          format: 'jsonv2',
          lat: roundedLat,
          lon: roundedLng,
          zoom: 10,
          addressdetails: 1,
        },
        timeout: 7000,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'TicketBro/1.0 (location reverse geocoding)',
        },
      });

      const address = response?.data?.address || {};
      const city = pickCityName(address);
      if (!city) {
        throw new BadRequestError('Unable to detect a nearby city for the provided coordinates.');
      }

      const location = formatResolvedLocation({
        city,
        state: address.state || address.region || address.state_district || '',
        country: address.country || '',
        lat: roundedLat,
        lng: roundedLng,
        addressLabel: response?.data?.display_name || '',
      });

      setMemoryEntry(cacheKey, location);
      await cacheService.set(cacheKey, location, REVERSE_CACHE_TTL_SECONDS);
      return location;
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }

      logger.warn('Reverse geocoding failed.', {
        error: error.message,
        lat: roundedLat,
        lng: roundedLng,
      });

      throw new BadRequestError('Unable to detect a nearby city for the provided coordinates.');
    }
  }
}
module.exports = new LocationService();
