
/* ------------------ CONFIGURATION ------------------ */
const CONFIG = Object.freeze({
  LOCALE: "en-US",
  CURRENCY: "USD",
  SERVICE_FEE_PERCENT: 2.5,
  LOW_STOCK_THRESHOLD: 10,
  DEFAULTS: {
    bannerImage: "/images/placeholder-event.jpg",
    organizerLogo: "/images/placeholder-logo.png",
    category: "General",
    venue: "Venue TBA",
    city: "Location TBA",
  },
  STATUS: Object.freeze({
    UPCOMING: "UPCOMING",
    ONGOING: "ONGOING",
    COMPLETED: "COMPLETED",
    SOLD_OUT: "SOLD_OUT",
    LAST_CHANCE: "LAST_CHANCE",
    TBA: "TBA",
  }),
});

/* ------------------ HELPERS ------------------ */
export const formatCurrency = (val) =>
  new Intl.NumberFormat(CONFIG.LOCALE, { style: "currency", currency: CONFIG.CURRENCY }).format(val || 0);

export const normalizeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

export const stripHtml = (str) =>
  str?.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim() || "";

/* ------------------ INVENTORY ENGINE ------------------ */
export const analyzeInventory = (activities = []) => {
  const safeActivities = Array.isArray(activities) ? activities : [];

  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalStock = 0;

  const tiers = safeActivities.map((a) => {
    const price = Number(a.price) || 0;
    const stock = Number(a.availableTickets ?? a.ticketsAvailable ?? 0);
    const fee = +(price * (CONFIG.SERVICE_FEE_PERCENT / 100)).toFixed(2);
    const isAvailable = stock > 0 && a.status !== "sold out";

    if (isAvailable) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }

    totalStock += stock;

    return {
      ...a,
      rawPrice: price,
      serviceFee: fee,
      totalPrice: +(price + fee).toFixed(2),
      formattedPrice: formatCurrency(price),
      isAvailable,
      maxStock: stock,
    };
  });

  const hasInventory = totalStock > 0;
  const finalMin = minPrice === Infinity ? 0 : minPrice;
  const finalMax = maxPrice === -Infinity ? 0 : maxPrice;

  return {
    minPrice: finalMin,
    maxPrice: finalMax,
    totalStock,
    hasInventory,
    isLowStock: hasInventory && totalStock <= CONFIG.LOW_STOCK_THRESHOLD,
    tiers,
    priceDisplay:
      finalMin === finalMax ? formatCurrency(finalMin) : `From ${formatCurrency(finalMin)}`,
  };
};

/* ------------------ LOAD RAW EVENTS FROM BACKEND ------------------ */
let RAW_EVENT_DETAILS = [];
try {
  RAW_EVENT_DETAILS = await getEvents().then((res) => res.data || res);
} catch (err) {
  console.warn("Could not fetch events, using empty array", err);
  RAW_EVENT_DETAILS = [];
}

/* ------------------ MAIN EVENT MAPPING ------------------ */
export const EVENTS = Object.freeze(
  (RAW_EVENT_DETAILS || [])
    .map((e) => {
      if (!e) return null;

      const start = normalizeDate(e.date?.start ?? e.startDate);
      const end = normalizeDate(e.date?.end ?? e.endDate) || start;
      const now = new Date();
      const inv = analyzeInventory(e.activities ?? e.tickets ?? []);

      // Determine status
      let status = CONFIG.STATUS.TBA;
      if (!inv.hasInventory) status = CONFIG.STATUS.SOLD_OUT;
      else if (inv.isLowStock) status = CONFIG.STATUS.LAST_CHANCE;
      else if (start && now < start) status = CONFIG.STATUS.UPCOMING;
      else if (start && end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        status = now > endOfDay ? CONFIG.STATUS.COMPLETED : CONFIG.STATUS.ONGOING;
      }

      const cleanShortDesc =
        stripHtml(e.shortDescription) ||
        stripHtml(e.fullDescription?.substring(0, 160));
      const tags = [...new Set(Array.isArray(e.tags) ? e.tags : [])];

      return {
        id: e.id,
        slug: e.slug || `event-${e.id}`,
        title: e.title?.trim() || "Untitled Experience",
        category: e.category || CONFIG.DEFAULTS.category,
        type: e.type || "General",
        tags,
        featured: !!e.featured ?? !!e.isFeatured,
        searchStr: [
          e.title,
          e.category,
          e.type,
          e.location?.city,
          e.location?.venue,
          e.organizer?.name,
          ...tags,
        ].filter(Boolean).join(" ").toLowerCase(),

        schedule: {
          start: start ? start.toISOString() : null,
          end: end ? end.toISOString() : null,
          durationDays: start && end ? Math.max(1, Math.ceil((end - start) / 86400000)) : 1,
          formattedDate: start
            ? start.toLocaleDateString(CONFIG.LOCALE, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date TBA",
          startTime: start
            ? start.toLocaleTimeString(CONFIG.LOCALE, { hour: "2-digit", minute: "2-digit" })
            : "TBA",
        },

        location: {
          venue: e.location?.venue || CONFIG.DEFAULTS.venue,
          city: e.location?.city || CONFIG.DEFAULTS.city,
          address: e.location?.address || "",
          mapUrl: e.location?.mapLink || null,
          coordinates: e.location?.coordinates || { lat: 0, lng: 0 },
        },

        ticketing: {
          status,
          isAvailable: inv.hasInventory,
          totalStock: inv.totalStock,
          priceDisplay: inv.priceDisplay,
          priceRange: { min: inv.minPrice, max: inv.maxPrice },
          tiers: inv.tiers,
        },

        media: {
          banner: e.bannerImage || CONFIG.DEFAULTS.bannerImage,
          organizer: {
            name: e.organizer?.name || "Official Organizer",
            logo: e.organizer?.logo || CONFIG.DEFAULTS.organizerLogo,
            website: e.organizer?.website || null,
          },
        },

        description: { short: cleanShortDesc, full: e.fullDescription || "" },
        updatedAt: new Date().toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dateA = a.schedule.start ? new Date(a.schedule.start) : new Date(8640000000000000);
      const dateB = b.schedule.start ? new Date(b.schedule.start) : new Date(8640000000000000);
      return dateA - dateB;
    })
);

/* ------------------ SEARCH & FILTER HELPERS ------------------ */
export const GET_ALL_CITIES = () => {
  const cities = EVENTS.map((event) => event.location.city).filter(Boolean);
  return ["All Cities", ...new Set(cities)].sort();
};

export const GET_ALL_CITIES_WITH_COUNTS = () => {
  const cityNames = GET_ALL_CITIES();
  return cityNames.map((name) => ({
    name,
    events:
      name === "All Cities"
        ? EVENTS.length
        : EVENTS.filter((e) => e.location.city === name).length,
  }));
};

export const GET_ALL_CATEGORIES = () => {
  const categories = EVENTS.map((e) => e.category).filter(Boolean);
  return ["All Categories", ...new Set(categories)].sort();
};

export const GET_ALL_ORGANIZERS = () => {
  const organizers = EVENTS.map((e) => e.media.organizer.name).filter(Boolean);
  return ["All Organizers", ...new Set(organizers)].sort();
};

export const getFilteredEvents = ({
  searchQuery = "",
  city = "All Cities",
  category = "All Categories",
  sortBy = "date_asc",
}) => {
  let filtered = [...EVENTS];

  if (city !== "All Cities") filtered = filtered.filter((e) => e.location.city === city);
  if (category !== "All Categories") filtered = filtered.filter((e) => e.category === category);
  if (searchQuery.trim()) {
    const term = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((e) => e.searchStr.includes(term));
  }

  return filtered.sort((a, b) => {
    const dA = a.schedule.start ? new Date(a.schedule.start) : 0;
    const dB = b.schedule.start ? new Date(b.schedule.start) : 0;
    return sortBy === "date_desc" ? dB - dA : dA - dB;
  });
};
