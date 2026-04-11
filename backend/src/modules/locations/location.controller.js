'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const locationService = require('./location.service');
const {
  normalizeLocationOption,
  toLocationSlug,
} = require('./location.utils');

class LocationController {
  getAll      = asyncHandler(async (_req, res) => {
    const { cities } = await locationService.getCities();
    const locations = cities.map((city) => normalizeLocationOption(city));
    sendSuccess(res, 'Locations fetched.', { locations });
  });

  getCities   = asyncHandler(async (_req, res) => {
    const { cities } = await locationService.getCities();
    const normalized = cities.map((city) => normalizeLocationOption(city));
    sendSuccess(res, 'Cities fetched.', { cities: normalized });
  });

  getCountries= asyncHandler(async (_req, res) => {
    const { cities } = await locationService.getCities();
    const countriesMap = cities.reduce((acc, city) => {
      const name = city.country || 'Unknown';
      const slug = toLocationSlug(name);
      const entry = acc.get(slug) || { slug, name, count: 0 };
      entry.count += Number(city.count || 0);
      acc.set(slug, entry);
      return acc;
    }, new Map());

    sendSuccess(res, 'Countries fetched.', {
      countries: Array.from(countriesMap.values()).sort((a, b) => b.count - a.count),
    });
  });

  getBySlug   = asyncHandler(async (req, res) => {
    const { cities } = await locationService.getCities();
    const locations = cities.map((city) => normalizeLocationOption(city));
    const location = locations.find((city) => city.slug === req.params.slug) || null;
    sendSuccess(res, 'Location fetched.', { location });
  });

  reverseGeocode = asyncHandler(async (req, res) => {
    const location = await locationService.reverseGeocode(req.query.lat, req.query.lng);
    sendSuccess(res, 'Location resolved.', { location });
  });
}
module.exports = new LocationController();
