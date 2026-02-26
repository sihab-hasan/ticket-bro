// frontend/src/pages/browse/sections/NearbySection.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  Bookmark,
  BookmarkCheck,
  Ticket,
  BadgeCheck,
  Navigation,
  Locate,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useLocation } from "@/context/LocationContext";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const unslugify = (slug) =>
  slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

const getLevel = (categorySlug, subCategorySlug, eventTypeSlug) => {
  if (eventTypeSlug) return "eventType";
  if (subCategorySlug) return "subCategory";
  if (categorySlug) return "category";
  return "root";
};

const spotsPercent = (attendees, capacity) =>
  Math.min(100, Math.round((attendees / capacity) * 100));

/* ═══════════════════════════════════════════════════════════════
   NEARBY AREAS PER CITY
   Maps selectedLocation.id → list of nearby areas within that city.
   In production: derive from geolocation API or user's selected area.
═══════════════════════════════════════════════════════════════ */
const CITY_AREAS = {
  dhaka: ["Gulshan", "Dhanmondi", "Banani", "Mirpur", "Uttara", "Motijheel"],
  chittagong: ["GEC Circle", "Agrabad", "Patenga", "Nasirabad", "Pahartali"],
  sylhet: ["Zindabazar", "Ambarkhana", "Subidbazar", "Shahjalal"],
  rajshahi: ["Shaheb Bazar", "Uposhohor", "Kazla"],
  khulna: ["Sonadanga", "Boyra", "Daulatpur"],
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL
   Each event has a `area` (neighbourhood) and `distanceKm`.
   In production: GET /api/events/nearby?lat=23.8&lng=90.4&radius=5&category=music
═══════════════════════════════════════════════════════════════ */
const ALL_NEARBY = [
  {
    id: 601,
    slug: "synthwave-night-dhaka",
    title: "Synthwave Night: Neon Dreams",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    organizer: "Noir Events",
    verified: true,
    date: "Fri, Mar 21, 2025",
    time: "9:00 PM",
    venue: "Club Noir",
    area: "Gulshan",
    city: "dhaka",
    distanceKm: 0.8,
    price: 600,
    priceLabel: "৳600",
    rating: 4.6,
    reviewCount: 87,
    attendees: 210,
    capacity: 300,
    spotsLeft: 90,
    image:
      "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=600&q=80",
    tags: ["Electronic", "Club"],
  },
  {
    id: 602,
    slug: "beats-bass-dhaka",
    title: "Beats & Bass — Dhaka Edition",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    organizer: "Bassline Productions",
    verified: true,
    date: "Fri, Mar 28, 2025",
    time: "10:00 PM",
    venue: "Sky Lounge",
    area: "Banani",
    city: "dhaka",
    distanceKm: 1.2,
    price: 800,
    priceLabel: "৳800",
    rating: 4.5,
    reviewCount: 73,
    attendees: 180,
    capacity: 250,
    spotsLeft: 70,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    tags: ["EDM", "Bass"],
  },
  {
    id: 603,
    slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    organizer: "Café Harmony",
    verified: false,
    date: "Sun, Mar 23, 2025",
    time: "7:00 PM",
    venue: "Café Harmony",
    area: "Gulshan",
    city: "dhaka",
    distanceKm: 1.5,
    price: 350,
    priceLabel: "৳350",
    rating: 4.6,
    reviewCount: 55,
    attendees: 60,
    capacity: 80,
    spotsLeft: 20,
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80",
    tags: ["Acoustic", "Café"],
  },
  {
    id: 604,
    slug: "open-mic-friday",
    title: "Friday Open Mic Dhaka",
    category: "music",
    subCategory: "open-mic",
    eventType: "music",
    organizer: "Stage Fright Events",
    verified: false,
    date: "Fri, Mar 28, 2025",
    time: "7:00 PM",
    venue: "Café Uprising",
    area: "Dhanmondi",
    city: "dhaka",
    distanceKm: 2.1,
    price: 0,
    priceLabel: "Free",
    rating: 4.4,
    reviewCount: 62,
    attendees: 95,
    capacity: 150,
    spotsLeft: 55,
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
    tags: ["Open Mic", "Free"],
  },
  {
    id: 605,
    slug: "solo-acoustic-night",
    title: "Solo Acoustic Night",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    organizer: "Acoustic Studio BD",
    verified: false,
    date: "Thu, Mar 20, 2025",
    time: "8:00 PM",
    venue: "The Alley",
    area: "Dhanmondi",
    city: "dhaka",
    distanceKm: 2.4,
    price: 400,
    priceLabel: "৳400",
    rating: 4.5,
    reviewCount: 48,
    attendees: 80,
    capacity: 120,
    spotsLeft: 40,
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
    tags: ["Acoustic", "Solo"],
  },
  {
    id: 606,
    slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    organizer: "SoundWave BD",
    verified: true,
    date: "Sat, Mar 22, 2025",
    time: "4:00 PM",
    venue: "Hatirjheel Amphitheatre",
    area: "Hatirjheel",
    city: "dhaka",
    distanceKm: 3.2,
    price: 900,
    priceLabel: "৳900",
    rating: 4.7,
    reviewCount: 98,
    attendees: 720,
    capacity: 900,
    spotsLeft: 180,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    tags: ["Music", "Outdoor"],
  },
  {
    id: 607,
    slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "Rock Circuit BD",
    verified: true,
    date: "Sat, Apr 12, 2025",
    time: "6:00 PM",
    venue: "Osmani Memorial Hall",
    area: "Mirpur",
    city: "dhaka",
    distanceKm: 4.5,
    price: 600,
    priceLabel: "৳600",
    rating: 4.8,
    reviewCount: 134,
    attendees: 850,
    capacity: 1200,
    spotsLeft: 350,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    tags: ["Live Bands", "Battle"],
  },
  {
    id: 608,
    slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "Arena Live",
    verified: true,
    date: "Sat, Mar 29, 2025",
    time: "5:00 PM",
    venue: "Bangabandhu Stadium",
    area: "Motijheel",
    city: "dhaka",
    distanceKm: 5.8,
    price: 2500,
    priceLabel: "৳2,500",
    rating: 4.9,
    reviewCount: 312,
    attendees: 14500,
    capacity: 20000,
    spotsLeft: 5500,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",
    tags: ["Rock", "Stadium"],
  },
  {
    id: 609,
    slug: "ctg-jazz-night-new",
    title: "Chittagong Jazz Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "CTG Jazz Club",
    verified: true,
    date: "Sat, May 24, 2025",
    time: "7:30 PM",
    venue: "Hotel Agrabad",
    area: "Agrabad",
    city: "chittagong",
    distanceKm: 1.1,
    price: 600,
    priceLabel: "৳600",
    rating: 4.7,
    reviewCount: 66,
    attendees: 280,
    capacity: 400,
    spotsLeft: 120,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    tags: ["Jazz", "Night"],
  },
  {
    id: 610,
    slug: "sylhet-open-air-concert",
    title: "Sylhet Open Air Concert",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "Sylhet Live Events",
    verified: true,
    date: "Sun, May 18, 2025",
    time: "5:00 PM",
    venue: "Sylhet Stadium",
    area: "Ambarkhana",
    city: "sylhet",
    distanceKm: 0.9,
    price: 800,
    priceLabel: "৳800",
    rating: 4.7,
    reviewCount: 66,
    attendees: 15,
    capacity: 3000,
    spotsLeft: 2985,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",
    tags: ["Open Air", "Concert"],
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION — sorted by distanceKm asc
═══════════════════════════════════════════════════════════════ */
const getNearby = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_NEARBY].sort((a, b) => a.distanceKm - b.distanceKm);

  if (locationId && locationId !== "current") {
    pool = pool.filter((e) => e.city === locationId);
  }
  if (level === "root") return pool.slice(0, 6);
  if (level === "category")
    return pool.filter((e) => e.category === categorySlug).slice(0, 6);
  if (level === "subCategory")
    return pool
      .filter(
        (e) => e.category === categorySlug && e.subCategory === subCategorySlug,
      )
      .slice(0, 6);
  if (level === "eventType")
    return pool
      .filter(
        (e) =>
          e.category === categorySlug &&
          e.subCategory === subCategorySlug &&
          e.eventType === eventTypeSlug,
      )
      .slice(0, 6);
  return [];
};

const getSectionTitle = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
) => {
  if (level === "root") return "Nearby Events";
  if (level === "category") return `Nearby ${unslugify(categorySlug)} Events`;
  if (level === "subCategory")
    return `Nearby ${unslugify(subCategorySlug)} Events`;
  if (level === "eventType") return `Nearby ${unslugify(eventTypeSlug)} Events`;
  return "Nearby Events";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root") return "";
  if (level === "category") return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   DISTANCE BADGE
═══════════════════════════════════════════════════════════════ */
const DistanceBadge = ({ km }) => {
  const label =
    km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)} km away`;
  const close = km <= 1;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
      style={{
        background: close ? "var(--foreground)" : "var(--secondary)",
        borderColor: close ? "var(--foreground)" : "var(--border)",
        color: close ? "var(--background)" : "var(--muted-foreground)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Navigation size={8} />
      {label}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AREA FILTER CHIPS
   Quick filter by neighbourhood within the selected city
═══════════════════════════════════════════════════════════════ */
const AreaChips = ({ cityId, activeArea, onAreaChange }) => {
  const areas = CITY_AREAS[cityId] || [];
  if (areas.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      <button
        onClick={() => onAreaChange(null)}
        className="text-xs font-medium px-3 py-1 rounded-full border "
        style={{
          background: !activeArea ? "var(--foreground)" : "var(--background)",
          borderColor: !activeArea ? "var(--foreground)" : "var(--border)",
          color: !activeArea ? "var(--background)" : "var(--muted-foreground)",
          fontFamily: "var(--font-sans)",
        }}
      >
        All Areas
      </button>
      {areas.map((area) => (
        <button
          key={area}
          onClick={() => onAreaChange(area === activeArea ? null : area)}
          className="text-xs font-medium px-3 py-1 rounded-full border "
          style={{
            background:
              activeArea === area ? "var(--foreground)" : "var(--background)",
            borderColor:
              activeArea === area ? "var(--foreground)" : "var(--border)",
            color:
              activeArea === area
                ? "var(--background)"
                : "var(--muted-foreground)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {area}
        </button>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEARBY CARD — horizontal with distance badge prominent
═══════════════════════════════════════════════════════════════ */
const NearbyCard = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 rounded shrink-0 overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {event.price === 0 && (
          <span
            className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "var(--font-brand)",
            }}
          >
            Free
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:underline"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {event.title}
              {event.verified && (
                <BadgeCheck size={11} className="inline ml-1 text-foreground" />
              )}
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                onSave(event.id);
              }}
              className="shrink-0"
              aria-label={saved ? "Unsave" : "Save"}
            >
              {saved ? (
                <BookmarkCheck size={13} className="text-foreground" />
              ) : (
                <Bookmark
                  size={13}
                  className="text-muted-foreground hover:text-foreground "
                />
              )}
            </button>
          </div>

          {/* Distance + area */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <DistanceBadge km={event.distanceKm} />
            <span
              className="flex items-center gap-1 text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <MapPin size={10} />
              {event.area}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className="flex items-center gap-1 text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <Calendar size={10} />
              {event.date}
            </span>
            <span
              className="flex items-center gap-1 text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <Clock size={10} />
              {event.time}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-foreground fill-foreground" />
              <span
                className="text-[11px] font-semibold text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {event.rating}
              </span>
              <span
                className="text-[11px] text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                ({event.reviewCount})
              </span>
            </div>
            <div className="w-10 h-0.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background:
                    pct > 85 ? "var(--destructive)" : "var(--foreground)",
                }}
              />
            </div>
            <span
              className="text-[10px] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {event.spotsLeft} left
            </span>
          </div>
          <span
            className="text-sm font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ locationLabel, levelLabel }) => (
  <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-center">
    <Locate size={24} className="text-muted-foreground mb-3" />
    <p
      className="text-sm font-semibold text-foreground mb-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      No {levelLabel} events nearby in {locationLabel}
    </p>
    <p
      className="text-xs text-muted-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Try changing your location or expanding the area filter.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   NEARBY SECTION
═══════════════════════════════════════════════════════════════ */
const NearbySection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();
  const [savedIds, setSavedIds] = useState(new Set());
  const [activeArea, setActiveArea] = useState(null);

  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const levelLabel = getLevelLabel(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
  );

  let events = getNearby(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    locationId,
  );

  // Apply area filter
  if (activeArea) {
    events = events.filter((e) => e.area === activeArea);
  }

  const sectionTitle = getSectionTitle(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
  );

  const viewAllTo =
    level === "root"
      ? "/browse"
      : level === "category"
        ? `/browse/${categorySlug}`
        : level === "subCategory"
          ? `/browse/${categorySlug}/${subCategorySlug}`
          : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const col1 = events.slice(0, 3);
  const col2 = events.slice(3, 6);

  return (
    <section
      className="w-full bg-background"
      aria-label="Nearby events"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Navigation size={16} className="text-foreground" />
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sectionTitle}
                </h2>
              </div>
              <p
                className="text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Events close to you in {locationLabel}
              </p>
            </div>
            <Link
              to={viewAllTo}
              className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline shrink-0 ml-4"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {/* Area filter chips */}
          <AreaChips
            cityId={locationId}
            activeArea={activeArea}
            onAreaChange={setActiveArea}
          />

          {/* Content */}
          {events.length === 0 ? (
            <EmptyState locationLabel={locationLabel} levelLabel={levelLabel} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                {col1.map((event) => (
                  <NearbyCard
                    key={event.id}
                    event={event}
                    saved={savedIds.has(event.id)}
                    onSave={toggleSave}
                  />
                ))}
              </div>
              {col2.length > 0 && (
                <div className="flex flex-col gap-3">
                  {col2.map((event) => (
                    <NearbyCard
                      key={event.id}
                      event={event}
                      saved={savedIds.has(event.id)}
                      onSave={toggleSave}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default NearbySection;
