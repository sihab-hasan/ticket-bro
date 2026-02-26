export const queryKeys = {
  // ─── CATEGORIES ────────────────────────────────────────────
  categories: {
    all: () => ["categories"],
    lists: () => ["categories", "list"],
    detail: (slug) => ["categories", "detail", slug],
  },

  // ─── SUBCATEGORIES ─────────────────────────────────────────
  subcategories: {
    all: () => ["subcategories"],
    byCategory: (categorySlug) => ["subcategories", "list", categorySlug],
    detail: (categorySlug, subSlug) => [
      "subcategories",
      "detail",
      categorySlug,
      subSlug,
    ],
  },

  // ─── EVENT TYPES ───────────────────────────────────────────
  eventTypes: {
    all: () => ["eventTypes"],
    bySub: (categorySlug, subSlug) => [
      "eventTypes",
      "list",
      categorySlug,
      subSlug,
    ],
    detail: (categorySlug, subSlug, typeSlug) => [
      "eventTypes",
      "detail",
      categorySlug,
      subSlug,
      typeSlug,
    ],
  },

  // ─── EVENTS ────────────────────────────────────────────────
  events: {
    all: () => ["events"],
    lists: () => ["events", "list"],
    list: (filters) => ["events", "list", filters], // paginated list
    detail: (slug) => ["events", "detail", slug], // full event
    details: (slug) => ["events", "details", slug], // enriched details
    tickets: (slug) => ["events", "tickets", slug],
    reviews: (slug, params) => ["events", "reviews", slug, params],
    related: (slug) => ["events", "related", slug],
    featured: () => ["events", "featured"],
    trending: () => ["events", "trending"],
    upcoming: (params) => ["events", "upcoming", params],
  },
};
