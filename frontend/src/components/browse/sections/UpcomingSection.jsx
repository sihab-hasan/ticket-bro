// frontend/src/pages/browse/sections/UpcomingSection.jsx
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
  CalendarClock,
  Timer,
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
   COUNTDOWN HELPER
   Returns { days, hours, mins } until eventDate string
═══════════════════════════════════════════════════════════════ */
const getCountdown = (dateStr, timeStr) => {
  const combined = new Date(`${dateStr} ${timeStr}`);
  const diffMs = combined.getTime() - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, mins };
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL
   Sorted by eventDate ascending (soonest first).
   In production: GET /api/events/upcoming?category=music&sub=concerts&type=live-bands&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_UPCOMING = [
  {
    id: 301,
    slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival 2025",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    organizer: "Bangladesh Jazz Foundation",
    verified: true,
    dateStr: "2025-03-15",
    timeStr: "18:00",
    date: "Sat, Mar 15, 2025",
    time: "6:00 PM",
    venue: "ICCB, Agargaon",
    city: "dhaka",
    price: 1200,
    priceLabel: "৳1,200",
    rating: 4.8,
    reviewCount: 124,
    attendees: 843,
    capacity: 1000,
    spotsLeft: 157,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    tags: ["Jazz", "Festival"],
  },
  {
    id: 302,
    slug: "solo-acoustic-night",
    title: "Solo Acoustic Night",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    organizer: "Acoustic Studio BD",
    verified: false,
    dateStr: "2025-03-20",
    timeStr: "20:00",
    date: "Thu, Mar 20, 2025",
    time: "8:00 PM",
    venue: "The Alley, Dhanmondi",
    city: "dhaka",
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
    id: 303,
    slug: "synthwave-night-dhaka",
    title: "Synthwave Night: Neon Dreams",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    organizer: "Noir Events",
    verified: true,
    dateStr: "2025-03-21",
    timeStr: "21:00",
    date: "Fri, Mar 21, 2025",
    time: "9:00 PM",
    venue: "Club Noir, Gulshan",
    city: "dhaka",
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
    id: 304,
    slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    organizer: "SoundWave BD",
    verified: true,
    dateStr: "2025-03-22",
    timeStr: "16:00",
    date: "Sat, Mar 22, 2025",
    time: "4:00 PM",
    venue: "Hatirjheel Amphitheatre",
    city: "dhaka",
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
    id: 305,
    slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    organizer: "Café Harmony",
    verified: false,
    dateStr: "2025-03-23",
    timeStr: "19:00",
    date: "Sun, Mar 23, 2025",
    time: "7:00 PM",
    venue: "Café Harmony, Gulshan",
    city: "dhaka",
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
    id: 306,
    slug: "open-mic-friday",
    title: "Friday Open Mic Dhaka",
    category: "music",
    subCategory: "open-mic",
    eventType: "music",
    organizer: "Stage Fright Events",
    verified: false,
    dateStr: "2025-03-28",
    timeStr: "19:00",
    date: "Fri, Mar 28, 2025",
    time: "7:00 PM",
    venue: "Café Uprising, Dhanmondi",
    city: "dhaka",
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
    id: 307,
    slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "Arena Live",
    verified: true,
    dateStr: "2025-03-29",
    timeStr: "17:00",
    date: "Sat, Mar 29, 2025",
    time: "5:00 PM",
    venue: "Bangabandhu Stadium",
    city: "dhaka",
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
    id: 308,
    slug: "live-bands-showdown",
    title: "Live Bands Showdown 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "BandHub BD",
    verified: true,
    dateStr: "2025-04-05",
    timeStr: "18:00",
    date: "Sat, Apr 5, 2025",
    time: "6:00 PM",
    venue: "Bashundhara City Arena",
    city: "dhaka",
    price: 1500,
    priceLabel: "৳1,500",
    rating: 4.8,
    reviewCount: 175,
    attendees: 2100,
    capacity: 3000,
    spotsLeft: 900,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    tags: ["Live Bands", "Rock"],
  },
  {
    id: 309,
    slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "Rock Circuit BD",
    verified: true,
    dateStr: "2025-04-12",
    timeStr: "18:00",
    date: "Sat, Apr 12, 2025",
    time: "6:00 PM",
    venue: "Osmani Memorial Hall",
    city: "dhaka",
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
    id: 310,
    slug: "chittagong-rock-fest",
    title: "Chittagong Rock Fest 2025",
    category: "music",
    subCategory: "festivals",
    eventType: "outdoor",
    organizer: "CTG Music Society",
    verified: true,
    dateStr: "2025-04-19",
    timeStr: "17:00",
    date: "Sat, Apr 19, 2025",
    time: "5:00 PM",
    venue: "MA Aziz Stadium, Chittagong",
    city: "chittagong",
    price: 1000,
    priceLabel: "৳1,000",
    rating: 4.9,
    reviewCount: 201,
    attendees: 4200,
    capacity: 6000,
    spotsLeft: 1800,
    image:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80",
    tags: ["Rock", "Festival"],
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getUpcoming = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_UPCOMING].sort(
    (a, b) => new Date(a.dateStr) - new Date(b.dateStr),
  );

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
  if (level === "root") return "Upcoming Events";
  if (level === "category") return `Upcoming ${unslugify(categorySlug)} Events`;
  if (level === "subCategory")
    return `Upcoming ${unslugify(subCategorySlug)} Events`;
  if (level === "eventType")
    return `Upcoming ${unslugify(eventTypeSlug)} Events`;
  return "Upcoming Events";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root") return "";
  if (level === "category") return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   COUNTDOWN PILL
═══════════════════════════════════════════════════════════════ */
const CountdownPill = ({ dateStr, timeStr }) => {
  const cd = getCountdown(dateStr, timeStr);
  if (!cd)
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
        style={{
          borderColor: "var(--destructive)",
          color: "var(--destructive)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <Timer size={9} /> Starting soon
      </span>
    );

  const label =
    cd.days > 0
      ? `In ${cd.days}d ${cd.hours}h`
      : cd.hours > 0
        ? `In ${cd.hours}h ${cd.mins}m`
        : `In ${cd.mins}m`;

  const urgent = cd.days === 0;

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
      style={{
        borderColor: urgent ? "var(--destructive)" : "var(--border)",
        color: urgent ? "var(--destructive)" : "var(--muted-foreground)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Timer size={9} /> {label}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   UPCOMING CARD — horizontal timeline style
═══════════════════════════════════════════════════════════════ */
const UpcomingCard = ({ event, saved, onSave, isLast }) => {
  const pct = spotsPercent(event.attendees, event.capacity);

  // Parse date for the date-block display
  const dateObj = new Date(event.dateStr);
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });

  return (
    <div className="flex gap-4 group">
      {/* Date block + timeline line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="flex flex-col items-center justify-center w-12 h-14 rounded-md border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <span
            className="text-[10px] font-medium uppercase text-muted-foreground leading-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {dayName}
          </span>
          <span
            className="text-xl font-extrabold text-foreground leading-none mt-0.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {dayNum}
          </span>
          <span
            className="text-[10px] font-medium uppercase text-muted-foreground leading-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {monthName}
          </span>
        </div>
        {/* Timeline connector */}
        {!isLast && (
          <div
            className="w-px flex-1 mt-1.5"
            style={{ background: "var(--border)", minHeight: "16px" }}
          />
        )}
      </div>

      {/* Card */}
      <Link
        to={`/events/${event.slug}`}
        className="flex-1 min-w-0 flex gap-3 mb-4 p-3 rounded-lg border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
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
                  <BadgeCheck
                    size={11}
                    className="inline ml-1 text-foreground"
                  />
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

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
              <span
                className="flex items-center gap-1 text-[11px] text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Clock size={10} />
                {event.time}
              </span>
              <span
                className="flex items-center gap-1 text-[11px] text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <MapPin size={10} />
                <span className="truncate max-w-[140px]">{event.venue}</span>
              </span>
            </div>

            {/* Countdown pill */}
            <CountdownPill dateStr={event.dateStr} timeStr={event.timeStr} />
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
              {/* Mini capacity */}
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
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ locationLabel, levelLabel }) => (
  <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-center">
    <CalendarClock size={24} className="text-muted-foreground mb-3" />
    <p
      className="text-sm font-semibold text-foreground mb-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      No upcoming {levelLabel} events in {locationLabel}
    </p>
    <p
      className="text-xs text-muted-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Try changing your location or check back soon.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   UPCOMING SECTION
═══════════════════════════════════════════════════════════════ */
const UpcomingSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();
  const [savedIds, setSavedIds] = useState(new Set());

  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const levelLabel = getLevelLabel(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
  );

  const events = getUpcoming(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    locationId,
  );
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

  // Split into 2 columns
  const col1 = events.filter((_, i) => i % 2 === 0);
  const col2 = events.filter((_, i) => i % 2 !== 0);

  return (
    <section
      className="w-full bg-background"
      aria-label="Upcoming events"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock size={16} className="text-foreground" />
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
                Don't miss what's coming up in {locationLabel}
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

          {/* Content */}
          {events.length === 0 ? (
            <EmptyState locationLabel={locationLabel} levelLabel={levelLabel} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {/* Col 1 */}
              <div>
                {col1.map((event, i) => (
                  <UpcomingCard
                    key={event.id}
                    event={event}
                    saved={savedIds.has(event.id)}
                    onSave={toggleSave}
                    isLast={i === col1.length - 1}
                  />
                ))}
              </div>
              {/* Col 2 */}
              {col2.length > 0 && (
                <div>
                  {col2.map((event, i) => (
                    <UpcomingCard
                      key={event.id}
                      event={event}
                      saved={savedIds.has(event.id)}
                      onSave={toggleSave}
                      isLast={i === col2.length - 1}
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

export default UpcomingSection;
