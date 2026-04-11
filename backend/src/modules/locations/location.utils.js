'use strict';

const escapeRegex = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeLocationText = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const toLocationSlug = (value = '') => {
  const source = String(value || '').trim();
  if (!source) {
    return '';
  }

  return normalizeLocationText(source)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const buildFlexibleExactRegex = (value = '') => {
  const normalized = normalizeLocationText(value);
  if (!normalized) {
    return null;
  }

  const parts = normalized.split(' ').filter(Boolean);
  if (!parts.length) {
    return null;
  }

  return new RegExp(`^${parts.map(escapeRegex).join('[\\s-]+')}$`, 'i');
};

const pickCityName = (address = {}) =>
  address.city
  || address.town
  || address.village
  || address.municipality
  || address.suburb
  || address.city_district
  || address.county
  || '';

const roundCoordinate = (value) =>
  Math.round(Number(value) * 1000) / 1000;

const formatResolvedLocation = ({
  city = '',
  state = '',
  country = '',
  lat,
  lng,
  addressLabel = '',
} = {}) => {
  const safeCity = String(city || '').trim();
  const safeState = String(state || '').trim();
  const safeCountry = String(country || '').trim();
  const label = safeCity || safeState || safeCountry || 'Unknown location';

  return {
    city: safeCity,
    state: safeState,
    country: safeCountry,
    label,
    slug: toLocationSlug(safeCity || label),
    addressLabel: addressLabel || [safeCity, safeState, safeCountry].filter(Boolean).join(', '),
    coordinates: {
      lat: Number(lat),
      lng: Number(lng),
    },
  };
};

const normalizeLocationOption = (location = {}) => {
  const name = String(location?.name || location?.label || location?._id || '').trim();

  return {
    slug: location?.slug || toLocationSlug(name),
    name,
    state: String(location?.state || '').trim(),
    country: String(location?.country || '').trim(),
    count: Number(location?.count || 0),
  };
};

module.exports = {
  buildFlexibleExactRegex,
  formatResolvedLocation,
  normalizeLocationOption,
  normalizeLocationText,
  pickCityName,
  roundCoordinate,
  toLocationSlug,
};
