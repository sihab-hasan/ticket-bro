'use strict';
const asyncHandler = require('../../common/utils/asyncHandler');
const { sendSuccess } = require('../../common/utils/apiResponse');
const locationService = require('./location.service');

const toSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeCity = (city) => ({
  slug: city.slug || toSlug(city.name || city.label || city._id),
  name: city.name || city.label || city._id,
  state: city.state || '',
  country: city.country || '',
  count: Number(city.count || 0),
});

class LocationController {
  getAll      = asyncHandler(async (_req, res) => {
    const { cities } = await locationService.getCities();
    const locations = cities.map((city) => normalizeCity(city));
    sendSuccess(res, 'Locations fetched.', { locations });
  });

  getCities   = asyncHandler(async (_req, res) => {
    const { cities } = await locationService.getCities();
    const normalized = cities.map((city) => normalizeCity(city));
    sendSuccess(res, 'Cities fetched.', { cities: normalized });
  });

  getCountries= asyncHandler(async (_req, res) => {
    const { cities } = await locationService.getCities();
    const countriesMap = cities.reduce((acc, city) => {
      const name = city.country || 'Unknown';
      const slug = toSlug(name);
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
    const locations = cities.map((city) => normalizeCity(city));
    const location = locations.find((city) => city.slug === req.params.slug) || null;
    sendSuccess(res, 'Location fetched.', { location });
  });
}
module.exports = new LocationController();
