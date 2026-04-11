import { normalizeLocationOption } from "@/utils/browse.utils";

export const DEFAULT_RADIUS_KM = 30;

export const ALL_LOCATION = Object.freeze({
  mode: "all",
  id: "all",
  slug: "all",
  label: "All Cities",
  country: "",
  flag: "Location",
  coords: null,
  radiusKm: DEFAULT_RADIUS_KM,
  source: "default",
});

const toNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

export const normalizeCoords = (coords) => {
  if (!coords || typeof coords !== "object") {
    return null;
  }

  const lat = toNumber(coords.lat);
  const lng = toNumber(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

export const toManualLocationSelection = (location, source = "manual") => {
  const normalized = normalizeLocationOption(location);
  if (!normalized?.slug) {
    return { ...ALL_LOCATION };
  }

  return {
    ...normalized,
    mode: "city",
    id: normalized.slug,
    coords: null,
    radiusKm: DEFAULT_RADIUS_KM,
    source,
  };
};

export const toCurrentLocationSelection = (location, coords) => {
  const base = toManualLocationSelection(location, "gps");
  const safeCoords = normalizeCoords(coords);

  if (!safeCoords || base.mode === "all") {
    return { ...ALL_LOCATION };
  }

  return {
    ...base,
    mode: "current",
    id: "current",
    coords: safeCoords,
    flag: "📍",
    source: "gps",
  };
};

export const normalizeStoredLocation = (value) => {
  if (!value || typeof value !== "object") {
    return { ...ALL_LOCATION };
  }

  if (value.mode === "all" || value.id === "all" || value.slug === "all") {
    return { ...ALL_LOCATION };
  }

  const base = toManualLocationSelection(value, value.source || "manual");
  if (base.mode === "all") {
    return { ...ALL_LOCATION };
  }

  const safeCoords = normalizeCoords(value.coords);
  if (value.mode === "current") {
    if (!safeCoords) {
      return { ...ALL_LOCATION };
    }

    return {
      ...base,
      mode: "current",
      id: "current",
      coords: safeCoords,
      flag: value.flag || "📍",
      radiusKm: Number(value.radiusKm || DEFAULT_RADIUS_KM),
      source: "gps",
    };
  }

  if (value.id === "current" && !safeCoords) {
    return { ...ALL_LOCATION };
  }

  return {
    ...base,
    mode: "city",
    radiusKm: Number(value.radiusKm || DEFAULT_RADIUS_KM),
    source: value.source || "manual",
  };
};

export const reconcileSelectionWithLocations = (selection, locations = []) => {
  const normalizedSelection = normalizeStoredLocation(selection);
  if (normalizedSelection.mode === "all") {
    return normalizedSelection;
  }

  const matched = locations.find((location) => location.slug === normalizedSelection.slug);
  if (!matched) {
    return normalizedSelection;
  }

  if (normalizedSelection.mode === "current") {
    return {
      ...matched,
      mode: "current",
      id: "current",
      coords: normalizedSelection.coords,
      radiusKm: normalizedSelection.radiusKm || DEFAULT_RADIUS_KM,
      flag: "📍",
      source: "gps",
    };
  }

  return {
    ...matched,
    mode: "city",
    id: matched.slug,
    coords: null,
    radiusKm: normalizedSelection.radiusKm || DEFAULT_RADIUS_KM,
    source: normalizedSelection.source || "manual",
  };
};

export const matchesLocationOption = (selectedLocation, location) => {
  if (!selectedLocation || selectedLocation.mode !== "city") {
    return false;
  }

  return selectedLocation.slug === location.slug;
};

export const getLocationQueryValue = (location) => {
  if (!location || location.mode === "all") {
    return "";
  }

  return location.label || location.slug || "";
};

export const calculateDistanceKm = (from, to) => {
  const start = normalizeCoords(from);
  const end = normalizeCoords(to);
  if (!start || !end) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
