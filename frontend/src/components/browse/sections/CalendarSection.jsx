// frontend/src/pages/browse/sections/CalendarSection.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  Star,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Ticket,
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const toDateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const today = new Date();

/* ═══════════════════════════════════════════════════════════════
   MOCK EVENTS POOL — keyed by ISO date string
   In production: GET /api/events/calendar?month=2025-03&category=music&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_EVENTS = [
  {
    id: 1,
    slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival 2025",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    city: "dhaka",
    dateKey: "2025-03-15",
    time: "6:00 PM",
    venue: "ICCB, Agargaon",
    price: 1200,
    priceLabel: "৳1,200",
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
  },
  {
    id: 2,
    slug: "solo-acoustic-night",
    title: "Solo Acoustic Night",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    city: "dhaka",
    dateKey: "2025-03-20",
    time: "8:00 PM",
    venue: "The Alley, Dhanmondi",
    price: 400,
    priceLabel: "৳400",
    rating: 4.5,
    reviewCount: 48,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  },
  {
    id: 3,
    slug: "synthwave-night-dhaka",
    title: "Synthwave Night: Neon Dreams",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    city: "dhaka",
    dateKey: "2025-03-21",
    time: "9:00 PM",
    venue: "Club Noir, Gulshan",
    price: 600,
    priceLabel: "৳600",
    rating: 4.6,
    reviewCount: 87,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=400&q=80",
  },
  {
    id: 4,
    slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    city: "dhaka",
    dateKey: "2025-03-22",
    time: "4:00 PM",
    venue: "Hatirjheel Amphitheatre",
    price: 900,
    priceLabel: "৳900",
    rating: 4.7,
    reviewCount: 98,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
  },
  {
    id: 5,
    slug: "dhaka-theatre-gala",
    title: "Dhaka Theatre Gala Night",
    category: "arts-culture",
    subCategory: "theatre",
    eventType: "drama",
    city: "dhaka",
    dateKey: "2025-03-22",
    time: "7:30 PM",
    venue: "National Theatre, Shahbag",
    price: 800,
    priceLabel: "৳800",
    rating: 4.7,
    reviewCount: 91,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&q=80",
  },
  {
    id: 6,
    slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    city: "dhaka",
    dateKey: "2025-03-23",
    time: "7:00 PM",
    venue: "Café Harmony, Gulshan",
    price: 350,
    priceLabel: "৳350",
    rating: 4.6,
    reviewCount: 55,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&q=80",
  },
  {
    id: 7,
    slug: "open-mic-friday",
    title: "Friday Open Mic Dhaka",
    category: "music",
    subCategory: "open-mic",
    eventType: "music",
    city: "dhaka",
    dateKey: "2025-03-28",
    time: "7:00 PM",
    venue: "Café Uprising, Dhanmondi",
    price: 0,
    priceLabel: "Free",
    rating: 4.4,
    reviewCount: 62,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80",
  },
  {
    id: 8,
    slug: "beats-bass-dhaka",
    title: "Beats & Bass — Dhaka",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    city: "dhaka",
    dateKey: "2025-03-28",
    time: "10:00 PM",
    venue: "Sky Lounge, Banani",
    price: 800,
    priceLabel: "৳800",
    rating: 4.5,
    reviewCount: 73,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
  },
  {
    id: 9,
    slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "dhaka",
    dateKey: "2025-03-29",
    time: "5:00 PM",
    venue: "Bangabandhu Stadium",
    price: 2500,
    priceLabel: "৳2,500",
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80",
  },
  {
    id: 10,
    slug: "live-bands-showdown",
    title: "Live Bands Showdown 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "dhaka",
    dateKey: "2025-04-05",
    time: "6:00 PM",
    venue: "Bashundhara City Arena",
    price: 1500,
    priceLabel: "৳1,500",
    rating: 4.8,
    reviewCount: 175,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
  },
  {
    id: 11,
    slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "dhaka",
    dateKey: "2025-04-12",
    time: "6:00 PM",
    venue: "Osmani Memorial Hall",
    price: 600,
    priceLabel: "৳600",
    rating: 4.8,
    reviewCount: 134,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
  },
  {
    id: 12,
    slug: "chittagong-rock-fest",
    title: "Chittagong Rock Fest 2025",
    category: "music",
    subCategory: "festivals",
    eventType: "outdoor",
    city: "chittagong",
    dateKey: "2025-04-19",
    time: "5:00 PM",
    venue: "MA Aziz Stadium, Chittagong",
    price: 1000,
    priceLabel: "৳1,000",
    rating: 4.9,
    reviewCount: 201,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80",
  },
  {
    id: 13,
    slug: "sylhet-open-air-concert",
    title: "Sylhet Open Air Concert",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    city: "sylhet",
    dateKey: "2025-05-18",
    time: "5:00 PM",
    venue: "Sylhet Stadium",
    price: 800,
    priceLabel: "৳800",
    rating: 4.7,
    reviewCount: 66,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80",
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER EVENTS BY LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getEvents = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_EVENTS];
  if (locationId && locationId !== "current")
    pool = pool.filter((e) => e.city === locationId);
  if (level === "category")
    pool = pool.filter((e) => e.category === categorySlug);
  if (level === "subCategory")
    pool = pool.filter(
      (e) => e.category === categorySlug && e.subCategory === subCategorySlug,
    );
  if (level === "eventType")
    pool = pool.filter(
      (e) =>
        e.category === categorySlug &&
        e.subCategory === subCategorySlug &&
        e.eventType === eventTypeSlug,
    );
  return pool;
};

// Build a map: { "2025-03-22": [event, event], ... }
const buildDateMap = (events) => {
  const map = {};
  events.forEach((e) => {
    if (!map[e.dateKey]) map[e.dateKey] = [];
    map[e.dateKey].push(e);
  });
  return map;
};

const getSectionTitle = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
) => {
  if (level === "root") return "Explore Events by Date";
  if (level === "category")
    return `Explore ${unslugify(categorySlug)} Events by Date`;
  if (level === "subCategory")
    return `Explore ${unslugify(subCategorySlug)} Events by Date`;
  return `Explore ${unslugify(eventTypeSlug)} Events by Date`;
};

/* ═══════════════════════════════════════════════════════════════
   CALENDAR GRID
═══════════════════════════════════════════════════════════════ */
const CalendarGrid = ({ year, month, dateMap, selectedDate, onSelectDate }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div className="w-full">
      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold uppercase text-muted-foreground py-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const key = toDateKey(year, month, day);
          const hasEvents = !!dateMap[key]?.length;
          const count = dateMap[key]?.length || 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          const isPast = new Date(key) < new Date(todayKey);

          return (
            <button
              key={key}
              onClick={() => hasEvents && onSelectDate(isSelected ? null : key)}
              disabled={!hasEvents}
              className="relative flex flex-col items-center justify-center rounded-md aspect-square text-xs  disabled:cursor-default"
              style={{
                background: isSelected
                  ? "var(--foreground)"
                  : isToday
                    ? "var(--secondary)"
                    : "transparent",
                color: isSelected
                  ? "var(--background)"
                  : isPast && !hasEvents
                    ? "var(--muted-foreground)"
                    : "var(--foreground)",
                fontWeight: isToday || isSelected ? 700 : 400,
                fontFamily: "var(--font-sans)",
                opacity: isPast && !hasEvents ? 0.4 : 1,
                border:
                  isToday && !isSelected
                    ? "1px solid var(--border)"
                    : "1px solid transparent",
              }}
            >
              {day}
              {/* Event dot */}
              {hasEvents && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: count > 1 ? 6 : 4,
                    height: 4,
                    background: "var(--foreground)",
                    opacity: 0.7,
                  }}
                />
              )}
              {/* Count badge when selected */}
              {isSelected && count > 1 && (
                <span
                  className="absolute -top-1 -right-1 text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EVENT CARD for selected date
═══════════════════════════════════════════════════════════════ */
const DateEventCard = ({ event, saved, onSave }) => (
  <Link
    to={`/events/${event.slug}`}
    className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all"
  >
    <div className="relative w-16 h-16 rounded shrink-0 overflow-hidden bg-muted">
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
          className="absolute bottom-1 left-1 text-[9px] font-bold px-1 py-0.5 rounded"
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
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-1 mb-0.5">
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
        <p
          className="flex items-center gap-1 text-[11px] text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <Clock size={10} />
          {event.time}
          <span className="text-border mx-1">·</span>
          <MapPin size={10} />
          <span className="truncate">{event.venue}</span>
        </p>
      </div>
      <div className="flex items-center justify-between mt-1.5">
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

/* ═══════════════════════════════════════════════════════════════
   CALENDAR SECTION
═══════════════════════════════════════════════════════════════ */
const CalendarSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const sectionTitle = getSectionTitle(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
  );

  const allEvents = getEvents(
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    locationId,
  );
  const dateMap = buildDateMap(allEvents);

  const selectedEvents = selectedDate ? dateMap[selectedDate] || [] : [];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Count events in current viewed month
  const monthEventCount = Object.entries(dateMap)
    .filter(([key]) =>
      key.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`),
    )
    .reduce((sum, [, evts]) => sum + evts.length, 0);

  const viewAllTo =
    level === "root"
      ? "/browse"
      : level === "category"
        ? `/browse/${categorySlug}`
        : level === "subCategory"
          ? `/browse/${categorySlug}/${subCategorySlug}`
          : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  // Format selected date nicely
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <section
      className="w-full bg-background"
      aria-label="Calendar of events"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-foreground" />
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
                Pick a date to see what's on in {locationLabel}
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

          {/* Main layout: Calendar + Event panel */}
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
            {/* LEFT: Calendar */}
            <div
              className="rounded-lg border border-border p-4"
              style={{ background: "var(--card)" }}
            >
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-accent "
                  aria-label="Previous month"
                >
                  <ChevronLeft size={14} className="text-muted-foreground" />
                </button>

                <div className="text-center">
                  <p
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {MONTHS[viewMonth]} {viewYear}
                  </p>
                  <p
                    className="text-[10px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {monthEventCount} event{monthEventCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  onClick={nextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-accent "
                  aria-label="Next month"
                >
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* Calendar grid */}
              <CalendarGrid
                year={viewYear}
                month={viewMonth}
                dateMap={dateMap}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {/* Legend */}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--foreground)", opacity: 0.7 }}
                  />
                  <span
                    className="text-[10px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Has events
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-4 h-4 rounded border border-border flex items-center justify-center text-[9px] font-bold text-foreground"
                    style={{
                      background: "var(--secondary)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {today.getDate()}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Today
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Events for selected date */}
            <div className="flex flex-col">
              {!selectedDate ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center p-8">
                  <Calendar size={28} className="text-muted-foreground mb-3" />
                  <p
                    className="text-sm font-semibold text-foreground mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Select a date
                  </p>
                  <p
                    className="text-xs text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Click any highlighted date to see events for that day in{" "}
                    {locationLabel}.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected date header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p
                        className="text-sm font-bold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {selectedDateLabel}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {selectedEvents.length} event
                        {selectedEvents.length !== 1 ? "s" : ""} in{" "}
                        {locationLabel}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-muted-foreground hover:text-foreground "
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Clear
                    </button>
                  </div>

                  {selectedEvents.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center p-8">
                      <p
                        className="text-sm font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        No events on this date
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedEvents.map((event) => (
                        <DateEventCard
                          key={event.id}
                          event={event}
                          saved={savedIds.has(event.id)}
                          onSave={toggleSave}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CalendarSection;
