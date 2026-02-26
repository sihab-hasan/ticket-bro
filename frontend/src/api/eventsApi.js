import client from "./client";

const eventsApi = {
  // ─── CATEGORIES ────────────────────────────────────────────
  getCategories: () => client.get("/categories"),

  getCategoryBySlug: (slug) => client.get(`/categories/${slug}`),

  // ─── SUBCATEGORIES ─────────────────────────────────────────
  getSubcategories: (categorySlug) =>
    client.get(`/categories/${categorySlug}/subcategories`),

  getSubcategoryBySlug: (categorySlug, subSlug) =>
    client.get(`/categories/${categorySlug}/subcategories/${subSlug}`),

  // ─── EVENT TYPES ───────────────────────────────────────────
  getEventTypes: (categorySlug, subSlug) =>
    client.get(
      `/categories/${categorySlug}/subcategories/${subSlug}/event-types`,
    ),

  getEventTypeBySlug: (categorySlug, subSlug, typeSlug) =>
    client.get(
      `/categories/${categorySlug}/subcategories/${subSlug}/event-types/${typeSlug}`,
    ),

  // ─── EVENTS ────────────────────────────────────────────────
  getEvents: (params = {}) => client.get("/events", { params }),
  // params: { categorySlug, subSlug, typeSlug, page, limit, sort, search, filters }

  getEventBySlug: (slug) => client.get(`/events/${slug}`),

  getFeaturedEvents: () => client.get("/events/featured"),

  getTrendingEvents: () => client.get("/events/trending"),

  getUpcomingEvents: (params) => client.get("/events/upcoming", { params }),

  getRelatedEvents: (eventSlug, limit = 6) =>
    client.get(`/events/${eventSlug}/related`, { params: { limit } }),

  // ─── EVENT DETAILS (full enriched data) ────────────────────
  getEventDetails: (slug) => client.get(`/events/${slug}/details`),
  // Returns: event + tickets + venue + organizer + reviews summary

  getEventTickets: (slug) => client.get(`/events/${slug}/tickets`),

  getEventReviews: (slug, params) =>
    client.get(`/events/${slug}/reviews`, { params }),
};

export default eventsApi;
