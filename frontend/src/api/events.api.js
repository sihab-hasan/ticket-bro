import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  post,
  put,
  upload,
  pickEntity,
  pickList,
  pickPaginated,
} from "@/api/client";

const pickEvents = (payload) => {
  const result = pickPaginated("events")(payload);
  return {
    events: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

export const getAllEvents = (params, options = {}) =>
  get(ENDPOINTS.EVENTS.LIST, {
    params,
    headers: options.headers,
    signal: options.signal,
    select: pickEvents,
  });

export const getFeaturedEvents = (limit = 6) =>
  get(ENDPOINTS.EVENTS.FEATURED, {
    params: { limit },
    select: pickList("events"),
  });

export const getTrendingEvents = (limit = 8) =>
  get(ENDPOINTS.EVENTS.TRENDING, {
    params: { limit },
    select: pickList("events"),
  });

export const getOfferEvents = (params) =>
  get(ENDPOINTS.EVENTS.OFFERS, {
    params,
    select: (payload) => {
      const result = pickEvents(payload);
      return {
        ...result,
        summary: payload?.summary || {},
      };
    },
  });

export const getUpcomingEvents = (limit = 8) =>
  get(ENDPOINTS.EVENTS.UPCOMING, {
    params: { limit },
    select: pickList("events"),
  });

export const getAdminEvents = (params) =>
  get(ENDPOINTS.EVENTS.ADMIN_LIST, { params, select: pickEvents });

export const getEventBySlug = (slug, options = {}) =>
  get(ENDPOINTS.EVENTS.DETAIL(slug), {
    headers: options.headers,
    signal: options.signal,
    select: pickEntity("event"),
  });

export const getEventDetails = (slug) =>
  get(ENDPOINTS.EVENTS.DETAILS(slug), {
    select: pickEntity("event", "details"),
  });

export const getEventReviews = (slug, params) =>
  get(ENDPOINTS.EVENTS.REVIEWS(slug), {
    params,
    select: pickPaginated("reviews"),
  });

export const getEventTickets = (slug) =>
  get(ENDPOINTS.EVENTS.TICKETS(slug), {
    select: pickList("ticketTypes"),
  });

export const getRelatedEvents = (slug) =>
  get(ENDPOINTS.EVENTS.RELATED(slug), {
    select: pickList("events"),
  });

export const getTicketTypes = (slug) =>
  get(ENDPOINTS.EVENTS.TICKET_TYPES(slug), {
    select: pickList("ticketTypes"),
  });

export const getSeatSections = (slug) =>
  get(ENDPOINTS.EVENTS.SEAT_SECTIONS(slug), {
    select: pickList("sections"),
  });

export const getSeatMap = (slug) => get(ENDPOINTS.EVENTS.SEAT_MAP(slug));

export const getEventFacets = (params) =>
  get(ENDPOINTS.EVENTS.FACETS, {
    params,
    select: (payload) => payload?.facets || payload || {},
  });

export const getNearbyEvents = (lng, lat, radiusKm = 30) =>
  get(ENDPOINTS.EVENTS.NEARBY, {
    params: { lng, lat, radius: radiusKm },
    select: pickList("events"),
  });

export const getAllCategories = () =>
  get(ENDPOINTS.CATEGORIES.LIST, {
    select: pickList("categories"),
  });

export const getCategoryBySlug = (slug) =>
  get(ENDPOINTS.CATEGORIES.DETAIL(slug), {
    select: pickEntity("category"),
  });

export const getSubcategoriesByCategory = (slug) =>
  get(ENDPOINTS.CATEGORIES.SUBS(slug), {
    select: pickList("subcategories"),
  });

export const getCategoryData = async (slug) => {
  const [category, subcategories, result] = await Promise.all([
    getCategoryBySlug(slug),
    getSubcategoriesByCategory(slug),
    getAllEvents({
      category: slug,
      status: "published",
      visibility: "public",
      limit: 50,
    }),
  ]);

  if (!category) {
    return null;
  }

  const events = result?.events || [];
  const now = new Date();

  return {
    ...category,
    subcategories,
    featuredEvents: events.filter((event) => event.isFeatured).slice(0, 6),
    trendingEvents: [...events]
      .sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0))
      .slice(0, 6),
    upcomingEvents: events
      .filter((event) => new Date(event.startDate) > now)
      .slice(0, 8),
    stats: {
      totalEvents: events.length,
      totalTicketsSold: events.reduce(
        (sum, event) => sum + (event.totalSold || 0),
        0,
      ),
      averageRating:
        events.reduce((sum, event) => sum + (event.averageRating || 0), 0) /
        (events.length || 1),
    },
  };
};

export const getSubcategoryData = async (categorySlug, subcategorySlug) => {
  const [category, subcategories, result] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcategoriesByCategory(categorySlug),
    getAllEvents({
      category: categorySlug,
      subcategory: subcategorySlug,
      status: "published",
      visibility: "public",
      limit: 50,
    }),
  ]);

  const subcategory = subcategories.find(
    (item) => item.slug === subcategorySlug,
  );

  if (!category || !subcategory) {
    return null;
  }

  const events = result?.events || [];
  const now = new Date();

  return {
    ...subcategory,
    category,
    events,
    upcomingEvents: events
      .filter((event) => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    pastEvents: events
      .filter((event) => new Date(event.endDate) < now)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate)),
    featuredEvents: events.filter((event) => event.isFeatured).slice(0, 4),
    totalEvents: events.length,
  };
};

export const searchEvents = (query, filters = {}) =>
  get(ENDPOINTS.SEARCH.ROOT, {
    params: { q: query, ...filters },
    select: (payload) => payload?.results || [],
  });

export const getPopularCities = () =>
  get(ENDPOINTS.LOCATIONS.CITIES, {
    select: pickList("cities"),
  });

export const getEventById = async (id) => {
  try {
    return await getEventBySlug(id);
  } catch {
    return null;
  }
};

export const createEvent = (data) =>
  post(ENDPOINTS.EVENTS.CREATE, data, { select: pickEntity("event") });

export const updateEvent = (slug, data) =>
  put(ENDPOINTS.EVENTS.UPDATE(slug), data, { select: pickEntity("event") });

export const deleteEvent = (slug) => del(ENDPOINTS.EVENTS.DELETE(slug));

export const publishEvent = (slug) =>
  post(ENDPOINTS.EVENTS.PUBLISH(slug), {}, { select: pickEntity("event") });

export const cancelEvent = (slug, data) =>
  post(ENDPOINTS.EVENTS.CANCEL(slug), data || {}, {
    select: pickEntity("event"),
  });

export const toggleEventImageReaction = (slug, url) =>
  post(
    ENDPOINTS.EVENTS.IMAGE_REACTION(slug),
    { url },
    {
      select: (payload) => ({
        event: pickEntity("event")(payload),
        reaction: payload?.reaction || null,
      }),
    },
  );

export const approveEvent = (slug) =>
  put(ENDPOINTS.EVENTS.APPROVE(slug), {}, { select: pickEntity("event") });

export const rejectEvent = (slug, data) =>
  put(ENDPOINTS.EVENTS.REJECT(slug), data || {}, {
    select: pickEntity("event"),
  });

// NOTE: The backend currently does not support postponing events. If this feature
// is required in the future, implement the corresponding endpoint on the server
// and reintroduce this helper. See `event.routes.js` for available actions.
// export const postponeEvent = (slug, data) =>
//   post(`/events/${slug}/postpone`, data);

export const createTicketType = (slug, data) =>
  post(ENDPOINTS.EVENTS.TICKET_TYPES(slug), data, {
    select: pickEntity("ticketType", "ticket"),
  });

export const updateTicketType = (slug, id, data) =>
  put(ENDPOINTS.EVENTS.TICKET_TYPE(slug, id), data, {
    select: pickEntity("ticketType", "ticket"),
  });

export const deleteTicketType = (slug, id) =>
  del(ENDPOINTS.EVENTS.TICKET_TYPE(slug, id));

export const createSeatSection = (slug, data) =>
  post(ENDPOINTS.EVENTS.SEAT_SECTIONS(slug), data);

export const updateSeatSection = (slug, id, data) =>
  put(ENDPOINTS.EVENTS.SEAT_SECTION(slug, id), data);

// NOTE: The backend currently has no endpoints for liking, bookmarking or sharing
// events. These helper functions were previously defined but led to 404 errors.
// To avoid broken API calls, they have been commented out. If the backend adds
// support for these interactions, reintroduce the corresponding functions.
// export const likeEvent = (slug) => post(ENDPOINTS.EVENTS.LIKE(slug), {});
// export const bookmarkEvent = (slug) => post(ENDPOINTS.EVENTS.BOOKMARK(slug), {});
// export const unbookmarkEvent = (slug) => del(ENDPOINTS.EVENTS.BOOKMARK(slug));
// export const shareEvent = (slug) => post(ENDPOINTS.EVENTS.SHARE(slug), {});

export const trackEventView = async (slug) => {
  try {
    return await post(ENDPOINTS.EVENTS.VIEW(slug), {});
  } catch {
    return null;
  }
};

// ── Image Upload API (Cloudinary) ─────────────────────────────────────────────

/**
 * Upload or replace the cover image for an event.
 * @param {string} slug  Event slug
 * @param {File}   file  File object from input[type=file]
 */
export const uploadCoverImage = (slug, file) => {
  const form = new FormData();
  form.append("coverImage", file);
  return upload(ENDPOINTS.EVENTS.COVER_IMAGE(slug), form, {
    select: (p) => p?.event ?? p,
  });
};

/** Remove the cover image for an event. */
export const removeCoverImage = (slug) =>
  del(ENDPOINTS.EVENTS.COVER_IMAGE(slug), {
    select: (p) => p?.event ?? p,
  });

/**
 * Upload one or more gallery images for an event.
 * @param {string}   slug   Event slug
 * @param {File[]}   files  Array of File objects
 */
export const uploadGalleryImages = (slug, files) => {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  return upload(ENDPOINTS.EVENTS.GALLERY_IMAGES(slug), form, {
    select: (p) => p?.event ?? p,
  });
};

/**
 * Remove a single gallery image by its Cloudinary URL.
 * @param {string} slug      Event slug
 * @param {string} imageUrl  Full Cloudinary URL to remove
 */
export const removeGalleryImage = (slug, imageUrl) =>
  del(ENDPOINTS.EVENTS.GALLERY_IMAGES(slug), {
    data: { url: imageUrl },
    select: (p) => p?.event ?? p,
  });

export const removeGalleryImages = (slug, imageUrls) =>
  del(ENDPOINTS.EVENTS.GALLERY_IMAGE_BATCH(slug), {
    data: { urls: imageUrls },
    select: (p) => p?.event ?? p,
  });

export const reorderGalleryImages = (slug, orderedUrls) =>
  put(
    ENDPOINTS.EVENTS.GALLERY_IMAGE_ORDER(slug),
    { images: orderedUrls },
    {
      select: (p) => p?.event ?? p,
    },
  );

export default {
  getAllEvents,
  getFeaturedEvents,
  getTrendingEvents,
  getOfferEvents,
  getUpcomingEvents,
  getAdminEvents,
  getEventBySlug,
  getEventById,
  getEventDetails,
  getEventReviews,
  getEventTickets,
  getRelatedEvents,
  getTicketTypes,
  getSeatSections,
  getSeatMap,
  getEventFacets,
  getNearbyEvents,
  searchEvents,
  getAllCategories,
  getCategoryBySlug,
  getCategoryData,
  getSubcategoriesByCategory,
  getSubcategoryData,
  getPopularCities,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  toggleEventImageReaction,
  approveEvent,
  rejectEvent,
  // postponeEvent,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  createSeatSection,
  updateSeatSection,
  // likeEvent,
  // bookmarkEvent,
  // unbookmarkEvent,
  // shareEvent,
  trackEventView,
  // Image uploads (Cloudinary)
  uploadCoverImage,
  removeCoverImage,
  uploadGalleryImages,
  removeGalleryImage,
  removeGalleryImages,
  reorderGalleryImages,
};
