// frontend/src/utils/browse/browseUtils.js
// Shared utility functions, constants, and mock data for the Browse section.
// Field names mirror the backend Event model (event.model.js).

/* ═══════════════════════════════════════════════════════════════
   ENUMS  (mirror backend EVENT_STATUS / VISIBILITY)
═══════════════════════════════════════════════════════════════ */
export const EVENT_STATUS = Object.freeze({
  DRAFT:     "draft",
  PENDING:   "pending",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
  POSTPONED: "postponed",
  COMPLETED: "completed",
  REJECTED:  "rejected",
});

export const VISIBILITY = Object.freeze({
  PUBLIC:   "public",
  PRIVATE:  "private",
  UNLISTED: "unlisted",
});

export const AGE_RESTRICTION = Object.freeze({
  ALL:   "all",
  TEEN:  "teen",
  ADULT: "adult",
});

/* ═══════════════════════════════════════════════════════════════
   STRING HELPERS
═══════════════════════════════════════════════════════════════ */
export const unslugify = (slug) =>
  slug
    ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "";

export const toSlug = (str) =>
  str.toLowerCase().replace(/[&\s]+/g, "-");

/* ═══════════════════════════════════════════════════════════════
   ROUTE LEVEL DETECTION
═══════════════════════════════════════════════════════════════ */
export const getLevel = (categorySlug, subCategorySlug, eventTypeSlug) => {
  if (eventTypeSlug)  return "eventType";
  if (subCategorySlug) return "subCategory";
  if (categorySlug)   return "category";
  return "root";
};

/* ═══════════════════════════════════════════════════════════════
   CAPACITY / PRICING HELPERS
   Field names align with backend: totalSold, totalCapacity, minPrice, maxPrice
═══════════════════════════════════════════════════════════════ */
// Accepts both API fields (totalSold/totalCapacity) and mock aliases (attendees/capacity)
export const spotsPercent = (attendees, capacity) =>
  !capacity ? 0 : Math.min(100, Math.round((attendees / capacity) * 100));

export const formatAttendees = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);

// Derive a priceLabel from a raw API event object
export const getPriceLabel = (event) => {
  if (event.priceLabel) return event.priceLabel; // already computed (mock or API)
  if (event.isFree || event.minPrice === 0) return "Free";
  const cur = event.currency ?? "BDT";
  if (event.minPrice === event.maxPrice) return `${cur} ${event.minPrice}`;
  return `${cur} ${event.minPrice} – ${event.maxPrice}`;
};

// spotsLeft — works with API (totalCapacity/totalSold/totalReserved) or mock alias
export const getSpotsLeft = (event) => {
  if (event.spotsLeft != null) return event.spotsLeft;
  if (!event.totalCapacity) return null;
  return Math.max(0, event.totalCapacity - (event.totalSold ?? 0) - (event.totalReserved ?? 0));
};

/* ═══════════════════════════════════════════════════════════════
   SECTION LABELS
═══════════════════════════════════════════════════════════════ */
export const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "";
  if (level === "category")    return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   ROUTE BUILDERS
═══════════════════════════════════════════════════════════════ */
export const buildEventUrl = (event) => {
  // API response uses populated slugs: category.slug, subcategory.slug, eventType.slug
  // Mock data uses flat fields: categorySlug, subCategorySlug, eventTypeSlug
  const cat  = event.categorySlug  ?? event.category?.slug  ?? event.category;
  const sub  = event.subCategorySlug ?? event.subcategory?.slug ?? event.subCategory ?? event.subcategory;
  const type = event.eventTypeSlug ?? event.eventType?.slug  ?? event.eventType;
  const slug = event.slug;
  if (cat && sub && type && slug) return `/${cat}/${sub}/${type}/${slug}`;
  if (slug) return `/events/${slug}`;
  return "/browse";
};

export const buildCategoryUrl    = (cat)           => `/${cat}`;
export const buildSubCategoryUrl = (cat, sub)       => `/${cat}/${sub}`;
export const buildEventTypeUrl   = (cat, sub, type) => `/${cat}/${sub}/${type}`;

/* ═══════════════════════════════════════════════════════════════
   FILTER EVENTS BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
export const filterEventsByContext = (
  pool, level, categorySlug, subCategorySlug, eventTypeSlug, locationId
) => {
  let filtered = [...pool];

  // Location filter — supports both flat mock field and nested API location.city
  if (locationId && locationId !== "all") {
    filtered = filtered.filter((e) =>
      (e.city ?? e.location?.city) === locationId
    );
  }

  // Browse level filter
  const cat  = (e) => e.categorySlug    ?? e.category?.slug    ?? e.category;
  const sub  = (e) => e.subCategorySlug ?? e.subcategory?.slug ?? e.subCategory ?? e.subcategory;
  const type = (e) => e.eventTypeSlug   ?? e.eventType?.slug   ?? e.eventType;

  if (level === "category") {
    filtered = filtered.filter((e) => cat(e) === categorySlug);
  } else if (level === "subCategory") {
    filtered = filtered.filter(
      (e) => cat(e) === categorySlug && sub(e) === subCategorySlug
    );
  } else if (level === "eventType") {
    filtered = filtered.filter(
      (e) => cat(e) === categorySlug && sub(e) === subCategorySlug && type(e) === eventTypeSlug
    );
  }

  return filtered;
};

/* ═══════════════════════════════════════════════════════════════
   MASTER EVENTS DATA POOL
   Single source of truth for all browse sections.
   In production: replace with API calls (each section already
   shows the correct GET endpoint in its comment).
═══════════════════════════════════════════════════════════════ */
export const MASTER_EVENTS = [
  // ── Music / Festivals ─────────────────────────────────────
  {
    id: 1,
    slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival 2025",
    category: "music", categorySlug: "music",
    subCategory: "festivals", subCategorySlug: "festivals",
    eventType: "multi-day", eventTypeSlug: "multi-day",
    organizer: "Bangladesh Jazz Foundation", verified: true,
    date: "Sat, Mar 15", time: "6:00 PM",
    venue: "ICCB, Agargaon", city: "dhaka",
    price: 1200, priceLabel: "৳1,200",
    rating: 4.8, reviewCount: 124, attendees: 843, capacity: 1000, spotsLeft: 157,
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    tags: ["Jazz", "Festival"],
    trendScore: 85, listedAt: "2025-03-01T09:00:00Z",
  },
  {
    id: 2,
    slug: "synthwave-night-dhaka",
    title: "Synthwave Night: Neon Dreams",
    category: "music", categorySlug: "music",
    subCategory: "club-nights", subCategorySlug: "club-nights",
    eventType: "dj-sets", eventTypeSlug: "dj-sets",
    organizer: "Noir Events", verified: true,
    date: "Fri, Mar 21", time: "9:00 PM",
    venue: "Club Noir, Gulshan", city: "dhaka",
    price: 600, priceLabel: "৳600",
    rating: 4.6, reviewCount: 87, attendees: 210, capacity: 300, spotsLeft: 90,
    image: "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=600&q=80",
    tags: ["Electronic", "Club"],
    trendScore: 91, listedAt: "2025-03-05T09:00:00Z",
  },
  {
    id: 3,
    slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh 2025",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "live-bands", eventTypeSlug: "live-bands",
    organizer: "Arena Live", verified: true,
    date: "Sat, Mar 29", time: "5:00 PM",
    venue: "Bangabandhu National Stadium", city: "dhaka",
    price: 2500, priceLabel: "৳2,500",
    rating: 4.9, reviewCount: 312, attendees: 14500, capacity: 20000, spotsLeft: 5500,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",
    tags: ["Rock", "Stadium"],
    trendScore: 99, listedAt: "2025-02-20T09:00:00Z",
  },
  {
    id: 4,
    slug: "solo-acoustic-night",
    title: "Solo Acoustic Night",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "solo-artists", eventTypeSlug: "solo-artists",
    organizer: "Acoustic Studio BD", verified: false,
    date: "Thu, Mar 20", time: "8:00 PM",
    venue: "The Alley, Dhanmondi", city: "dhaka",
    price: 400, priceLabel: "৳400",
    rating: 4.5, reviewCount: 48, attendees: 80, capacity: 120, spotsLeft: 40,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
    tags: ["Acoustic", "Solo"],
    trendScore: 60, listedAt: "2025-03-08T09:00:00Z",
  },
  {
    id: 5,
    slug: "open-mic-friday",
    title: "Friday Open Mic Dhaka",
    category: "music", categorySlug: "music",
    subCategory: "open-mic", subCategorySlug: "open-mic",
    eventType: "music", eventTypeSlug: "music",
    organizer: "Stage Fright Events", verified: false,
    date: "Fri, Mar 28", time: "7:00 PM",
    venue: "Café Uprising, Dhanmondi", city: "dhaka",
    price: 0, priceLabel: "Free",
    rating: 4.4, reviewCount: 62, attendees: 95, capacity: 150, spotsLeft: 55,
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
    tags: ["Open Mic", "Free"],
    trendScore: 72, listedAt: "2025-03-09T09:00:00Z",
  },
  {
    id: 6,
    slug: "live-bands-showdown",
    title: "Live Bands Showdown 2025",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "live-bands", eventTypeSlug: "live-bands",
    organizer: "BandHub BD", verified: true,
    date: "Sat, Apr 5", time: "6:00 PM",
    venue: "Bashundhara City Arena", city: "dhaka",
    price: 1500, priceLabel: "৳1,500",
    rating: 4.8, reviewCount: 175, attendees: 2100, capacity: 3000, spotsLeft: 900,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    tags: ["Live Bands", "Rock"],
    trendScore: 88, listedAt: "2025-02-28T09:00:00Z",
  },
  {
    id: 7,
    slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music", categorySlug: "music",
    subCategory: "festivals", subCategorySlug: "festivals",
    eventType: "multi-day", eventTypeSlug: "multi-day",
    organizer: "SoundWave BD", verified: true,
    date: "Sat, Mar 22", time: "4:00 PM",
    venue: "Hatirjheel Amphitheatre", city: "dhaka",
    price: 900, priceLabel: "৳900",
    rating: 4.7, reviewCount: 98, attendees: 720, capacity: 900, spotsLeft: 180,
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    tags: ["Music", "Outdoor"],
    trendScore: 95, listedAt: "2025-03-03T09:00:00Z",
  },
  {
    id: 8,
    slug: "beats-bass-dhaka",
    title: "Beats & Bass — Dhaka Edition",
    category: "music", categorySlug: "music",
    subCategory: "club-nights", subCategorySlug: "club-nights",
    eventType: "dj-sets", eventTypeSlug: "dj-sets",
    organizer: "Bassline Productions", verified: true,
    date: "Fri, Mar 28", time: "10:00 PM",
    venue: "Sky Lounge, Banani", city: "dhaka",
    price: 800, priceLabel: "৳800",
    rating: 4.5, reviewCount: 73, attendees: 180, capacity: 250, spotsLeft: 70,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    tags: ["EDM", "Club"],
    trendScore: 78, listedAt: "2025-03-07T09:00:00Z",
  },
  {
    id: 9,
    slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "solo-artists", eventTypeSlug: "solo-artists",
    organizer: "Café Harmony", verified: false,
    date: "Sun, Mar 23", time: "7:00 PM",
    venue: "Café Harmony, Gulshan", city: "dhaka",
    price: 350, priceLabel: "৳350",
    rating: 4.6, reviewCount: 55, attendees: 60, capacity: 80, spotsLeft: 20,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80",
    tags: ["Acoustic", "Café"],
    trendScore: 80, listedAt: "2025-03-06T09:00:00Z",
  },
  {
    id: 10,
    slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "live-bands", eventTypeSlug: "live-bands",
    organizer: "Rock Circuit BD", verified: true,
    date: "Sat, Apr 12", time: "6:00 PM",
    venue: "Osmani Memorial Hall", city: "dhaka",
    price: 600, priceLabel: "৳600",
    rating: 4.8, reviewCount: 134, attendees: 850, capacity: 1200, spotsLeft: 350,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    tags: ["Live Bands", "Battle"],
    trendScore: 93, listedAt: "2025-02-25T09:00:00Z",
  },
  // ── Sports ────────────────────────────────────────────────
  {
    id: 11,
    slug: "bd-premier-league-final",
    title: "BD Premier League Final",
    category: "sports", categorySlug: "sports",
    subCategory: "football", subCategorySlug: "football",
    eventType: "league-matches", eventTypeSlug: "league-matches",
    organizer: "BFF", verified: true,
    date: "Fri, Mar 14", time: "7:00 PM",
    venue: "Bangabandhu National Stadium", city: "dhaka",
    price: 500, priceLabel: "৳500",
    rating: 4.7, reviewCount: 203, attendees: 18000, capacity: 20000, spotsLeft: 2000,
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80",
    tags: ["Football", "League"],
    trendScore: 97, listedAt: "2025-02-10T09:00:00Z",
  },
  // ── Arts & Culture ────────────────────────────────────────
  {
    id: 12,
    slug: "dhaka-theatre-gala",
    title: "Dhaka Theatre Gala Night",
    category: "arts-culture", categorySlug: "arts-culture",
    subCategory: "theatre", subCategorySlug: "theatre",
    eventType: "drama", eventTypeSlug: "drama",
    organizer: "National Theatre BD", verified: true,
    date: "Sat, Mar 22", time: "7:30 PM",
    venue: "National Theatre, Shahbag", city: "dhaka",
    price: 800, priceLabel: "৳800",
    rating: 4.7, reviewCount: 91, attendees: 380, capacity: 500, spotsLeft: 120,
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",
    tags: ["Theatre", "Drama"],
    trendScore: 82, listedAt: "2025-02-15T09:00:00Z",
  },
  // ── Other cities ──────────────────────────────────────────
  {
    id: 13,
    slug: "chittagong-rock-fest",
    title: "Chittagong Rock Fest 2025",
    category: "music", categorySlug: "music",
    subCategory: "festivals", subCategorySlug: "festivals",
    eventType: "outdoor", eventTypeSlug: "outdoor",
    organizer: "CTG Music Society", verified: true,
    date: "Sat, Apr 19", time: "5:00 PM",
    venue: "MA Aziz Stadium, Chittagong", city: "chittagong",
    price: 1000, priceLabel: "৳1,000",
    rating: 4.9, reviewCount: 201, attendees: 4200, capacity: 6000, spotsLeft: 1800,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80",
    tags: ["Rock", "Festival"],
    trendScore: 94, listedAt: "2025-02-18T09:00:00Z",
  },
  {
    id: 14,
    slug: "sylhet-classical-night",
    title: "Sylhet Classical Music Night",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "live-bands", eventTypeSlug: "live-bands",
    organizer: "Sylhet Arts Council", verified: true,
    date: "Fri, Apr 11", time: "7:00 PM",
    venue: "Osmani Museum Hall, Sylhet", city: "sylhet",
    price: 500, priceLabel: "৳500",
    rating: 4.7, reviewCount: 66, attendees: 280, capacity: 400, spotsLeft: 120,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
    tags: ["Classical", "Live"],
    trendScore: 70, listedAt: "2025-02-22T09:00:00Z",
  },
  {
    id: 15,
    slug: "open-mic-star-search",
    title: "Open Mic Star Search",
    category: "music", categorySlug: "music",
    subCategory: "open-mic", subCategorySlug: "open-mic",
    eventType: "music", eventTypeSlug: "music",
    organizer: "Spotlight Events", verified: false,
    date: "Fri, Apr 4", time: "7:30 PM",
    venue: "The Stage, Dhanmondi", city: "dhaka",
    price: 0, priceLabel: "Free",
    rating: 4.3, reviewCount: 41, attendees: 110, capacity: 200, spotsLeft: 90,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
    tags: ["Open Mic", "Free"],
    trendScore: 65, listedAt: "2025-03-10T09:00:00Z",
  },
  {
    id: 16,
    slug: "jazz-brunch-sunday",
    title: "Sunday Jazz Brunch",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "solo-artists", eventTypeSlug: "solo-artists",
    organizer: "Melody Café", verified: false,
    date: "Sun, Apr 6", time: "11:00 AM",
    venue: "Melody Café, Gulshan", city: "dhaka",
    price: 500, priceLabel: "৳500",
    rating: 4.4, reviewCount: 33, attendees: 45, capacity: 60, spotsLeft: 15,
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
    tags: ["Jazz", "Brunch"],
    trendScore: 55, listedAt: "2025-03-11T09:00:00Z",
  },
  {
    id: 17,
    slug: "indie-night-dhaka-2025",
    title: "Indie Night Dhaka 2025",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "live-bands", eventTypeSlug: "live-bands",
    organizer: "Indie Collective BD", verified: true,
    date: "Fri, May 2", time: "7:00 PM",
    venue: "The Warehouse, Tejgaon", city: "dhaka",
    price: 700, priceLabel: "৳700",
    rating: 0, reviewCount: 0, attendees: 12, capacity: 400, spotsLeft: 388,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    tags: ["Indie", "Live", "New"],
    trendScore: 45, listedAt: "2025-03-11T09:00:00Z",
    isNew: true,
  },
  // ── London ────────────────────────────────────────────────
  {
    id: 18,
    slug: "london-jazz-night",
    title: "London Jazz Night",
    category: "music", categorySlug: "music",
    subCategory: "concerts", subCategorySlug: "concerts",
    eventType: "solo-artists", eventTypeSlug: "solo-artists",
    organizer: "Ronnie Scott's", verified: true,
    date: "Sat, Apr 5", time: "8:00 PM",
    venue: "Ronnie Scott's, Soho", city: "london",
    price: 3500, priceLabel: "৳3,500",
    rating: 4.9, reviewCount: 520, attendees: 150, capacity: 200, spotsLeft: 50,
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
    tags: ["Jazz", "Intimate"],
    trendScore: 89, listedAt: "2025-02-28T09:00:00Z",
  },
  {
    id: 19,
    slug: "hyde-park-festival",
    title: "Hyde Park Summer Festival",
    category: "music", categorySlug: "music",
    subCategory: "festivals", subCategorySlug: "festivals",
    eventType: "outdoor", eventTypeSlug: "outdoor",
    organizer: "AEG Presents", verified: true,
    date: "Sat, Jun 14", time: "2:00 PM",
    venue: "Hyde Park, London", city: "london",
    price: 8000, priceLabel: "৳8,000",
    rating: 4.8, reviewCount: 1204, attendees: 55000, capacity: 65000, spotsLeft: 10000,
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    tags: ["Festival", "Outdoor"],
    trendScore: 96, listedAt: "2025-01-10T09:00:00Z",
  },
  // ── Dubai ─────────────────────────────────────────────────
  {
    id: 20,
    slug: "dubai-global-village-festival",
    title: "Dubai Global Village Night",
    category: "music", categorySlug: "music",
    subCategory: "festivals", subCategorySlug: "festivals",
    eventType: "multi-day", eventTypeSlug: "multi-day",
    organizer: "Global Village Dubai", verified: true,
    date: "Fri, Apr 25", time: "5:00 PM",
    venue: "Global Village, Dubai", city: "dubai",
    price: 5000, priceLabel: "৳5,000",
    rating: 4.7, reviewCount: 340, attendees: 8000, capacity: 15000, spotsLeft: 7000,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",
    tags: ["Global", "Festival"],
    trendScore: 86, listedAt: "2025-02-01T09:00:00Z",
  },
  // ── Technology ────────────────────────────────────────────
  {
    id: 21,
    slug: "dhaka-tech-summit-2025",
    title: "Dhaka Tech Summit 2025",
    category: "technology", categorySlug: "technology",
    subCategory: "hackathons", subCategorySlug: "hackathons",
    eventType: "hackathons", eventTypeSlug: "hackathons",
    organizer: "TechHub BD", verified: true,
    date: "Fri, May 9", time: "9:00 AM",
    venue: "Bashundhara City, Dhaka", city: "dhaka",
    price: 1500, priceLabel: "৳1,500",
    rating: 4.6, reviewCount: 89, attendees: 600, capacity: 1000, spotsLeft: 400,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    tags: ["Tech", "Summit"],
    trendScore: 77, listedAt: "2025-03-01T09:00:00Z",
  },
  // ── Health & Wellness ─────────────────────────────────────
  {
    id: 22,
    slug: "sunrise-yoga-dhaka",
    title: "Sunrise Yoga by the Lake",
    category: "health", categorySlug: "health",
    subCategory: "yoga", subCategorySlug: "yoga",
    eventType: "hatha", eventTypeSlug: "hatha",
    organizer: "Zen Space BD", verified: true,
    date: "Sat, Mar 22", time: "6:00 AM",
    venue: "Hatirjheel, Dhaka", city: "dhaka",
    price: 300, priceLabel: "৳300",
    rating: 4.8, reviewCount: 72, attendees: 45, capacity: 60, spotsLeft: 15,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    tags: ["Yoga", "Wellness"],
    trendScore: 74, listedAt: "2025-03-04T09:00:00Z",
  },
];

/* ═══════════════════════════════════════════════════════════════
   normalizeEvent
   Adapter that maps a raw API response (backend Event model)
   to the flat shape that all browse UI components expect.
   Call this once after fetching from the API so every component
   can work with the same field names as the mock data.
═══════════════════════════════════════════════════════════════ */
export const normalizeEvent = (e) => ({
  // ── Identity ──────────────────────────────────────────────
  id:    e._id ?? e.id,
  slug:  e.slug,
  title: e.title,

  // ── Taxonomy slugs (flattened from populated refs) ────────
  categorySlug:    e.category?.slug    ?? e.categorySlug,
  subCategorySlug: e.subcategory?.slug ?? e.subCategorySlug,
  eventTypeSlug:   e.eventType?.slug   ?? e.eventTypeSlug,

  // ── Organizer ─────────────────────────────────────────────
  organizer: e.organizerProfile?.displayName ?? e.organizer?.name ?? e.organizer,
  verified:  e.isVerified ?? e.verified ?? false,

  // ── Schedule ──────────────────────────────────────────────
  date:  e.date ?? (e.startDate ? new Date(e.startDate).toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric" }) : ""),
  time:  e.time ?? (e.startDate ? new Date(e.startDate).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" }) : ""),
  startDate: e.startDate,
  endDate:   e.endDate,
  durationMinutes: e.durationMinutes ?? null,

  // ── Location ──────────────────────────────────────────────
  venue: e.venue ?? e.location?.name ?? "",
  city:  e.city  ?? e.location?.city ?? "",
  locationType: e.location?.type ?? "physical",

  // ── Media ─────────────────────────────────────────────────
  image: e.image ?? e.coverImage ?? e.thumbnail ?? "",

  // ── Pricing ───────────────────────────────────────────────
  isFree:     e.isFree  ?? e.price === 0 ?? false,
  price:      e.price   ?? e.minPrice    ?? 0,
  minPrice:   e.minPrice ?? e.price      ?? 0,
  maxPrice:   e.maxPrice ?? e.price      ?? 0,
  currency:   e.currency ?? "BDT",
  priceLabel: getPriceLabel(e),

  // ── Capacity ──────────────────────────────────────────────
  attendees:      e.attendees      ?? e.totalSold       ?? 0,
  capacity:       e.capacity       ?? e.totalCapacity   ?? 0,
  totalReserved:  e.totalReserved  ?? 0,
  spotsLeft:      getSpotsLeft(e)  ?? 0,

  // ── Ratings & analytics ───────────────────────────────────
  rating:         e.rating         ?? e.averageRating   ?? 0,
  reviewCount:    e.reviewCount    ?? 0,
  trendScore:     e.trendScore     ?? 0,
  viewCount:      e.viewCount      ?? 0,
  uniqueViewCount:e.uniqueViewCount ?? 0,
  likeCount:      e.likeCount      ?? 0,
  bookmarkCount:  e.bookmarkCount  ?? 0,

  // ── Status / flags ────────────────────────────────────────
  status:         e.status         ?? EVENT_STATUS.PUBLISHED,
  visibility:     e.visibility     ?? VISIBILITY.PUBLIC,
  ageRestriction: e.ageRestriction ?? AGE_RESTRICTION.ALL,
  isFeatured:     e.isFeatured     ?? false,
  isTrending:     e.isTrending     ?? false,
  isSponsored:    e.isSponsored    ?? false,
  isSoldOut:      getSpotsLeft(e) === 0,
  requiresApproval: e.requiresApproval ?? false,

  // ── Timestamps ────────────────────────────────────────────
  listedAt:    e.listedAt    ?? e.publishedAt ?? e.createdAt,
  publishedAt: e.publishedAt ?? null,

  // ── Tags ─────────────────────────────────────────────────
  // API returns ObjectId refs; mock data has plain strings. Normalize to strings.
  tags: (e.tags ?? []).map((t) => (typeof t === "string" ? t : t.name ?? "")),
});
