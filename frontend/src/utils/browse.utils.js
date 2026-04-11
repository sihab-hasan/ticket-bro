import {
  Baby,
  Briefcase,
  CalendarRange,
  Cpu,
  GraduationCap,
  Handshake,
  HeartPulse,
  Music2,
  Palette,
  Sparkles,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";

const CATEGORY_ICON_MAP = {
  music: Music2,
  sports: Trophy,
  "arts-culture": Palette,
  "food-drink": UtensilsCrossed,
  business: Briefcase,
  education: GraduationCap,
  health: HeartPulse,
  technology: Cpu,
  "kids-family": Baby,
  community: Handshake,
};

const CATEGORY_ACCENT_MAP = {
  music: { bg: "rgba(59,130,246,0.08)", text: "#93c5fd" },
  sports: { bg: "rgba(34,197,94,0.08)", text: "#86efac" },
  "arts-culture": { bg: "rgba(168,85,247,0.08)", text: "#d8b4fe" },
  "food-drink": { bg: "rgba(249,115,22,0.08)", text: "#fdba74" },
  business: { bg: "rgba(99,102,241,0.08)", text: "#a5b4fc" },
  education: { bg: "rgba(20,184,166,0.08)", text: "#5eead4" },
  health: { bg: "rgba(236,72,153,0.08)", text: "#f9a8d4" },
  technology: { bg: "rgba(163,230,53,0.08)", text: "#a3e635" },
  "kids-family": { bg: "rgba(251,191,36,0.08)", text: "#fde68a" },
  community: { bg: "rgba(239,68,68,0.08)", text: "#fca5a5" },
};

const AGE_LABELS = {
  all: "All Ages",
  teen: "13+",
  adult: "18+",
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const uniqueBy = (items, keySelector) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keySelector(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const normalizeTaxonomy = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return { _id: value, id: value, name: value, slug: value };
  }

  return {
    ...value,
    id: value.id || value._id,
    name: value.name || value.label || value.slug,
    slug: value.slug || value.name || value.id || value._id,
  };
};

const buildDisplayName = (person) => {
  if (!person) {
    return "";
  }

  if (person.displayName) {
    return person.displayName;
  }

  if (person.organizationName) {
    return person.organizationName;
  }

  if (person.name) {
    return person.name;
  }

  if (person.fullName) {
    return person.fullName;
  }

  return [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
};

const normalizeOrganizer = (organizer, organizerProfile) => {
  const profileName = buildDisplayName(organizerProfile);
  const userName = buildDisplayName(organizer);
  const name = profileName || userName || "Organizer";

  // organizer = populated User doc { _id, firstName, lastName, email, avatar }
  // organizerProfile = Organizer model doc { _id, displayName, user, ... }
  // For chat we need the User._id — preserve it explicitly before spreads overwrite _id
  const userAccountId =
    organizer?._id?.toString?.() ||
    organizer?.id?.toString?.() ||
    organizerProfile?.user?._id?.toString?.() ||
    organizerProfile?.user?.toString?.() ||
    null;

  return {
    ...organizer,
    ...organizerProfile,
    _id: organizerProfile?._id || organizer?._id,
    id: organizerProfile?.id || organizer?.id || organizerProfile?._id || organizer?._id,
    // userId = the User account _id (needed to open a chat conversation)
    userId: userAccountId,
    name,
    displayName: organizerProfile?.displayName || organizer?.displayName || name,
    slug: organizerProfile?.slug || organizer?.slug || organizerProfile?._id || organizer?._id,
    avatar: organizerProfile?.logo || organizer?.avatar || null,
    cover: organizerProfile?.coverImage || organizer?.coverImage || null,
    bio: organizerProfile?.bio || organizer?.bio || "",
    email: organizerProfile?.email || organizer?.email || "",
    phone: organizerProfile?.phone || organizer?.phone || "",
    website: organizerProfile?.website || organizer?.website || "",
    verificationStatus:
      organizerProfile?.verificationStatus ||
      organizer?.verificationStatus ||
      (organizer?.isVerified ? "verified" : "unverified"),
    isVerified:
      organizerProfile?.verificationStatus === "verified" ||
      organizer?.verificationStatus === "verified" ||
      organizer?.isVerified ||
      false,
    socials:
      organizerProfile?.socials ||
      organizerProfile?.socialLinks ||
      organizer?.socials ||
      organizer?.socialLinks ||
      {},
    totalEvents:
      organizerProfile?.eventCount || organizerProfile?.totalEvents || organizer?.totalEvents || 0,
    totalAttendees:
      organizerProfile?.totalAttendees || organizer?.totalAttendees || 0,
    averageRating:
      organizerProfile?.averageRating || organizer?.averageRating || organizer?.rating || 0,
    reviewCount:
      organizerProfile?.reviewCount || organizer?.reviewCount || 0,
  };
};

export const formatCurrency = (amount, currency = "BDT") => {
  const safeAmount = Number(amount || 0);
  if (currency === "BDT") {
    return `Taka ${safeAmount.toLocaleString()}`;
  }
  return `${currency} ${safeAmount.toLocaleString()}`;
};

export const normalizeTicketType = (ticket, currency = "BDT") => {
  const quantity = Number(ticket?.quantity || 0);
  const sold = Number(ticket?.sold || 0);
  const reserved = Number(ticket?.reserved || 0);
  const availableCount = Math.max(0, quantity - sold - reserved);
  const isSoldOut = ticket?.isSoldOut ?? availableCount === 0;

  return {
    ...ticket,
    id: ticket?.id || ticket?._id,
    label: ticket?.label || ticket?.name || "Ticket",
    currency: ticket?.currency || currency,
    price: Number(ticket?.price || 0),
    availableCount,
    available: ticket?.available ?? (!isSoldOut && ticket?.isActive !== false),
    isSoldOut,
    perks: Array.isArray(ticket?.perks)
      ? ticket.perks
      : Array.isArray(ticket?.benefits)
        ? ticket.benefits
        : [],
  };
};

export const normalizeEvent = (event = {}) => {
  const totalCapacity = Number(event.totalCapacity || 0);
  const totalSold = Number(event.totalSold || 0);
  const totalReserved = Number(event.totalReserved || 0);
  const soldPercentage = totalCapacity
    ? Math.round(((totalSold + totalReserved) / totalCapacity) * 100)
    : 0;
  const spotsLeft = totalCapacity
    ? Math.max(0, totalCapacity - totalSold - totalReserved)
    : null;
  const isSoldOut = spotsLeft === 0 && totalCapacity > 0;
  const currency = event.currency || "BDT";
  const minPrice = Number(event.minPrice || 0);
  const maxPrice = Number(event.maxPrice || 0);
  const isFree = Boolean(event.isFree || (minPrice === 0 && maxPrice === 0));
  const coordinates = event.location?.coordinates?.coordinates || [];
  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  const location = {
    ...event.location,
    latLng:
      Number.isFinite(lat) && Number.isFinite(lng)
        ? { lat, lng }
        : event.location?.latLng || null,
    isOnline: event.location?.type === "online",
    isHybrid: event.location?.type === "hybrid",
    typeLabel:
      event.location?.type === "online"
        ? "Online"
        : event.location?.type === "hybrid"
          ? "Hybrid"
          : "In Person",
  };
  const organizer = normalizeOrganizer(event.organizer, event.organizerProfile);
  const images = uniqueBy(
    [event.coverImage, ...(event.images || [])].filter(Boolean),
    (image) => image,
  );

  return {
    ...event,
    _id: event._id || event.id,
    id: event.id || event._id,
    category: normalizeTaxonomy(event.category),
    subcategory: normalizeTaxonomy(event.subcategory),
    eventType: normalizeTaxonomy(event.eventType),
    organizer,
    organizerProfile: organizer,
    tags: Array.isArray(event.tags) ? event.tags.map(normalizeTaxonomy) : [],
    images,
    coverImage: event.coverImage || images[0] || null,
    location,
    totalCapacity,
    totalSold,
    totalReserved,
    soldPercentage,
    spotsLeft,
    isSoldOut,
    isFree,
    minPrice,
    maxPrice,
    currency,
    priceLabel: isFree
      ? "Free"
      : minPrice === maxPrice
        ? formatCurrency(minPrice, currency)
        : `${formatCurrency(minPrice, currency)} - ${formatCurrency(maxPrice, currency)}`,
    canPurchase: event.canPurchase ?? (event.status === "published" && !isSoldOut),
    isUpcoming:
      event.isUpcoming ??
      (event.startDate ? new Date(event.startDate).getTime() > Date.now() : false),
    isPast:
      event.isPast ??
      (event.endDate ? new Date(event.endDate).getTime() < Date.now() : false),
    ageLabel: AGE_LABELS[event.ageRestriction] || AGE_LABELS.all,
    tickets: Array.isArray(event.tickets)
      ? event.tickets.map((ticket) => normalizeTicketType(ticket, currency))
      : [],
  };
};

export const normalizeLocationOption = (city) => {
  const name = city?.name || city?.label || city?._id || "";
  const slug = city?.slug || String(name).toLowerCase().replace(/\s+/g, "-");
  return {
    ...city,
    id: city?.id || slug,
    slug,
    label: name,
    country: city?.country || "",
    count: Number(city?.count || 0),
    flag: city?.flag || "Location",
  };
};

export const normalizeBrowseReview = (review, event) => {
  const authorName =
    buildDisplayName(review?.user) || buildDisplayName(review?.author) || "Guest";
  return {
    id: review?._id || review?.id,
    reviewer: authorName,
    author: authorName,
    avatar: authorName[0]?.toUpperCase() || "G",
    initial: authorName[0]?.toUpperCase() || "G",
    rating: Number(review?.rating || review?.averageRating || 0),
    averageRating: Number(review?.rating || review?.averageRating || 0),
    title: review?.title || "",
    body: review?.body || review?.text || "",
    text: review?.body || review?.text || "",
    helpful: Number(review?.helpful || 0),
    verified: Boolean(review?.isVerified || review?.verified),
    createdAt: review?.createdAt || review?.date,
    date: review?.createdAt || review?.date,
    eventTitle: event?.title || review?.eventTitle || "Event",
    city: event?.location?.city || "",
    categorySlug: event?.category?.slug || "",
    subcategorySlug: event?.subcategory?.slug || "",
    eventTypeSlug: event?.eventType?.slug || "",
  };
};

const withinWindow = (date, start, end) => {
  if (!date) {
    return false;
  }
  const value = new Date(date).getTime();
  return value >= start.getTime() && value <= end.getTime();
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const matchesDateFilter = (event, value) => {
  if (!value || !event?.startDate) {
    return true;
  }

  const date = new Date(event.startDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (value) {
    case "today":
      return sameDay(date, startOfToday);
    case "tomorrow": {
      const tomorrow = new Date(startOfToday.getTime() + DAY_IN_MS);
      return sameDay(date, tomorrow);
    }
    case "this-week": {
      const end = new Date(startOfToday.getTime() + 7 * DAY_IN_MS - 1);
      return withinWindow(date, startOfToday, end);
    }
    case "this-weekend": {
      const day = startOfToday.getDay();
      const saturdayOffset = (6 - day + 7) % 7;
      const saturday = new Date(startOfToday.getTime() + saturdayOffset * DAY_IN_MS);
      const sunday = new Date(saturday.getTime() + DAY_IN_MS + (DAY_IN_MS - 1));
      return withinWindow(date, saturday, sunday);
    }
    case "this-month":
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    case "next-month": {
      const month = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return (
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth()
      );
    }
    default:
      return true;
  }
};

const matchesPriceFilter = (event, value) => {
  if (!value) {
    return true;
  }

  const price = Number(event?.minPrice || 0);
  switch (value) {
    case "free":
      return event?.isFree;
    case "under-500":
      return !event?.isFree && price < 500;
    case "500-1000":
      return price >= 500 && price <= 1000;
    case "1000-2500":
      return price >= 1000 && price <= 2500;
    case "2500-plus":
      return price >= 2500;
    default:
      return true;
  }
};

const matchesFormatFilter = (event, value) => {
  if (!value) {
    return true;
  }

  const type = event?.location?.type || "physical";
  if (value === "in-person") {
    return type === "physical";
  }
  return type === value;
};

const matchesTimeFilter = (event, value) => {
  if (!value || !event?.startDate) {
    return true;
  }

  const hour = new Date(event.startDate).getHours();
  if (value === "morning") return hour >= 6 && hour < 12;
  if (value === "afternoon") return hour >= 12 && hour < 17;
  if (value === "evening") return hour >= 17 && hour < 21;
  if (value === "night") return hour >= 21 || hour < 6;
  return true;
};

export const applyBrowseFilters = (events, filters = {}) => {
  const filtered = events.filter((event) => {
    if (!matchesDateFilter(event, filters.date)) return false;
    if (!matchesPriceFilter(event, filters.price)) return false;
    if (!matchesFormatFilter(event, filters.format)) return false;
    if (!matchesTimeFilter(event, filters.time)) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "date-asc":
      sorted.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      break;
    case "date-desc":
      sorted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      break;
    case "price-asc":
      sorted.sort((a, b) => Number(a.minPrice || 0) - Number(b.minPrice || 0));
      break;
    case "price-desc":
      sorted.sort((a, b) => Number(b.maxPrice || 0) - Number(a.maxPrice || 0));
      break;
    case "rating":
      sorted.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
      break;
    case "popular":
      sorted.sort((a, b) => Number(b.totalSold || 0) - Number(a.totalSold || 0));
      break;
    case "relevance":
    default:
      sorted.sort((a, b) => {
        const scoreA = Number(a.isFeatured || 0) * 100 + Number(a.trendScore || 0);
        const scoreB = Number(b.isFeatured || 0) * 100 + Number(b.trendScore || 0);
        return scoreB - scoreA;
      });
      break;
  }

  return sorted;
};

export const buildFacetCounts = (events) => {
  const counts = {
    date: {
      today: 0,
      tomorrow: 0,
      "this-week": 0,
      "this-weekend": 0,
      "this-month": 0,
      "next-month": 0,
    },
    price: {
      free: 0,
      "under-500": 0,
      "500-1000": 0,
      "1000-2500": 0,
      "2500-plus": 0,
    },
    format: {
      "in-person": 0,
      online: 0,
      hybrid: 0,
    },
    time: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
  };

  events.forEach((event) => {
    Object.keys(counts.date).forEach((key) => {
      if (matchesDateFilter(event, key)) counts.date[key] += 1;
    });
    Object.keys(counts.price).forEach((key) => {
      if (matchesPriceFilter(event, key)) counts.price[key] += 1;
    });
    Object.keys(counts.format).forEach((key) => {
      if (matchesFormatFilter(event, key)) counts.format[key] += 1;
    });
    Object.keys(counts.time).forEach((key) => {
      if (matchesTimeFilter(event, key)) counts.time[key] += 1;
    });
  });

  return counts;
};

export const getCategoryIcon = (slug) =>
  CATEGORY_ICON_MAP[slug] || CalendarRange;

export const getCategoryAccent = (slug) =>
  CATEGORY_ACCENT_MAP[slug] || {
    bg: "rgba(163,230,53,0.08)",
    text: "#a3e635",
  };

export const buildCategoryMap = ({ categories = [], subcategories = [], events = [] }) => {
  const now = Date.now();
  const nextWeek = now + 7 * DAY_IN_MS;
  const subcategoriesByCategory = subcategories.reduce((acc, subcategory) => {
    const categoryId = subcategory?.category?._id || subcategory?.category?.id || subcategory?.category || "";
    if (!acc.has(categoryId)) {
      acc.set(categoryId, []);
    }
    acc.get(categoryId).push(subcategory);
    return acc;
  }, new Map());

  return categories.reduce((acc, category) => {
    const categoryId = category._id || category.id;
    const categoryEvents = events.filter((event) => event.category?.slug === category.slug);
    const categorySubcategories = (subcategoriesByCategory.get(categoryId) || []).map((subcategory) => {
      const eventTypes = uniqueBy(
        categoryEvents
          .filter((event) => event.subcategory?.slug === subcategory.slug)
          .map((event) => event.eventType)
          .filter(Boolean),
        (eventType) => eventType.slug,
      );

      return {
        ...subcategory,
        id: subcategory.id || subcategory._id,
        label: subcategory.name,
        count: categoryEvents.filter((event) => event.subcategory?.slug === subcategory.slug).length,
        eventTypes,
      };
    });

    acc[category.slug] = {
      ...category,
      id: category.id || category._id,
      label: category.name,
      description: category.description || "",
      icon: getCategoryIcon(category.slug),
      accent: getCategoryAccent(category.slug),
      totalEvents: categoryEvents.length,
      thisWeek: categoryEvents.filter((event) => {
        const start = new Date(event.startDate).getTime();
        return Number.isFinite(start) && start >= now && start <= nextWeek;
      }).length,
      subcategories: categorySubcategories,
    };

    return acc;
  }, {});
};

export const buildBrowseNavigation = ({ categories = [], subcategories = [], events = [] }) => {
  const map = buildCategoryMap({ categories, subcategories, events });
  return Object.values(map).map((category) => ({
    id: category.id,
    name: category.label,
    slug: category.slug,
    categories: category.subcategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      slug: subcategory.slug,
      subcategories: (subcategory.eventTypes || []).map((eventType) => ({
        id: eventType.id || eventType._id,
        name: eventType.name,
        slug: eventType.slug,
      })),
    })),
  }));
};

export const buildBrowseStats = (events) => {
  const cities = new Set(events.map((event) => event.location?.city).filter(Boolean));
  const organizers = new Set(events.map((event) => event.organizer?.id).filter(Boolean));
  const ratingTotal = events.reduce((sum, event) => sum + Number(event.averageRating || 0), 0);

  return {
    events: events.length,
    organizers: organizers.size,
    cities: cities.size,
    ticketsSold: events.reduce((sum, event) => sum + Number(event.totalSold || 0), 0),
    avgRating: events.length ? ratingTotal / events.length : 0,
  };
};

export const pickBrowseReviewCandidates = (events) =>
  uniqueBy(
    [...events]
      .sort((a, b) => {
        const scoreA = Number(a.averageRating || 0) * 10 + Number(a.reviewCount || 0);
        const scoreB = Number(b.averageRating || 0) * 10 + Number(b.reviewCount || 0);
        return scoreB - scoreA;
      })
      .filter((event) => event.slug)
      .slice(0, 6),
    (event) => event.slug,
  );

export const browseFallbackIcon = Sparkles;
