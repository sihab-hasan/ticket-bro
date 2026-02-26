// frontend/src/pages/browse/sections/NewArrivalsSection.jsx
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
  Sparkles,
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
   MOCK DATA POOL
   Sorted by listedAt (newest first).
   In production: GET /api/events/new?category=music&sub=concerts&type=live-bands&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_NEW_ARRIVALS = [
  {
    id: 201,
    slug: "indie-night-dhaka-2025",
    title: "Indie Night Dhaka 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "Indie Collective BD",
    verified: true,
    date: "Fri, May 2, 2025",
    time: "7:00 PM",
    venue: "The Warehouse, Tejgaon",
    city: "dhaka",
    price: 700,
    priceLabel: "৳700",
    rating: 0,
    reviewCount: 0,
    attendees: 12,
    capacity: 400,
    spotsLeft: 388,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    tags: ["Indie", "Live", "New"],
    listedAt: "2025-03-10T09:00:00Z",
    isNew: true,
  },
  {
    id: 202,
    slug: "dj-workshop-dhaka",
    title: "DJ & Music Production Workshop",
    category: "music",
    subCategory: "club-nights",
    eventType: "dj-sets",
    organizer: "Beatcraft Academy",
    verified: true,
    date: "Sat, May 10, 2025",
    time: "2:00 PM",
    venue: "Beatcraft Studio, Banani",
    city: "dhaka",
    price: 2000,
    priceLabel: "৳2,000",
    rating: 0,
    reviewCount: 0,
    attendees: 5,
    capacity: 30,
    spotsLeft: 25,
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
    tags: ["Workshop", "DJ", "Production"],
    listedAt: "2025-03-09T14:00:00Z",
    isNew: true,
  },
  {
    id: 203,
    slug: "sufi-music-evening",
    title: "Sufi Music Evening",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    organizer: "Harmony Dhaka",
    verified: false,
    date: "Sun, May 11, 2025",
    time: "6:30 PM",
    venue: "Baitul Mukarram Cultural Centre",
    city: "dhaka",
    price: 300,
    priceLabel: "৳300",
    rating: 0,
    reviewCount: 0,
    attendees: 8,
    capacity: 200,
    spotsLeft: 192,
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
    tags: ["Sufi", "Cultural", "Live"],
    listedAt: "2025-03-09T08:00:00Z",
    isNew: true,
  },
  {
    id: 204,
    slug: "folk-fusion-festival",
    title: "Folk Fusion Festival",
    category: "music",
    subCategory: "festivals",
    eventType: "outdoor",
    organizer: "BD Folk Society",
    verified: true,
    date: "Sat, May 17, 2025",
    time: "3:00 PM",
    venue: "Shilpakala Academy",
    city: "dhaka",
    price: 500,
    priceLabel: "৳500",
    rating: 0,
    reviewCount: 0,
    attendees: 20,
    capacity: 800,
    spotsLeft: 780,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    tags: ["Folk", "Fusion", "Festival"],
    listedAt: "2025-03-08T11:00:00Z",
    isNew: true,
  },
  {
    id: 205,
    slug: "karaoke-championship",
    title: "Dhaka Karaoke Championship",
    category: "music",
    subCategory: "open-mic",
    eventType: "music",
    organizer: "Sing! Events",
    verified: false,
    date: "Fri, May 9, 2025",
    time: "8:00 PM",
    venue: "Party Central, Gulshan",
    city: "dhaka",
    price: 400,
    priceLabel: "৳400",
    rating: 0,
    reviewCount: 0,
    attendees: 3,
    capacity: 150,
    spotsLeft: 147,
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
    tags: ["Karaoke", "Competition", "Fun"],
    listedAt: "2025-03-08T07:00:00Z",
    isNew: true,
  },
  {
    id: 206,
    slug: "ctg-jazz-night-new",
    title: "Chittagong Jazz Night",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "CTG Jazz Club",
    verified: true,
    date: "Sat, May 24, 2025",
    time: "7:30 PM",
    venue: "Hotel Agrabad, Chittagong",
    city: "chittagong",
    price: 600,
    priceLabel: "৳600",
    rating: 0,
    reviewCount: 0,
    attendees: 9,
    capacity: 180,
    spotsLeft: 171,
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    tags: ["Jazz", "Night", "Live"],
    listedAt: "2025-03-07T16:00:00Z",
    isNew: true,
  },
  {
    id: 207,
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
    city: "sylhet",
    price: 800,
    priceLabel: "৳800",
    rating: 0,
    reviewCount: 0,
    attendees: 15,
    capacity: 3000,
    spotsLeft: 2985,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",
    tags: ["Open Air", "Concert", "Live"],
    listedAt: "2025-03-07T10:00:00Z",
    isNew: true,
  },
  {
    id: 208,
    slug: "new-tech-summit-dhaka",
    title: "Tech Innovation Summit 2025",
    category: "technology",
    subCategory: "hackathons",
    eventType: "ai-ml",
    organizer: "Tech BD Foundation",
    verified: true,
    date: "Sat, May 3, 2025",
    time: "9:00 AM",
    venue: "BUET Convention Centre",
    city: "dhaka",
    price: 1500,
    priceLabel: "৳1,500",
    rating: 0,
    reviewCount: 0,
    attendees: 30,
    capacity: 500,
    spotsLeft: 470,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    tags: ["Tech", "AI", "Summit"],
    listedAt: "2025-03-06T12:00:00Z",
    isNew: true,
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getNewArrivals = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_NEW_ARRIVALS].sort(
    (a, b) => new Date(b.listedAt) - new Date(a.listedAt),
  );

  if (locationId && locationId !== "current") {
    pool = pool.filter((e) => e.city === locationId);
  }

  if (level === "root") return pool.slice(0, 8);
  if (level === "category")
    return pool.filter((e) => e.category === categorySlug).slice(0, 8);
  if (level === "subCategory")
    return pool
      .filter(
        (e) => e.category === categorySlug && e.subCategory === subCategorySlug,
      )
      .slice(0, 8);
  if (level === "eventType")
    return pool
      .filter(
        (e) =>
          e.category === categorySlug &&
          e.subCategory === subCategorySlug &&
          e.eventType === eventTypeSlug,
      )
      .slice(0, 8);
  return [];
};

const getSectionTitle = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
) => {
  if (level === "root") return "New Arrivals";
  if (level === "category") return `New in ${unslugify(categorySlug)}`;
  if (level === "subCategory")
    return `New ${unslugify(subCategorySlug)} Events`;
  if (level === "eventType") return `New ${unslugify(eventTypeSlug)} Events`;
  return "New Arrivals";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root") return "";
  if (level === "category") return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   "JUST LISTED" AGE LABEL
   e.g. "Listed 2 days ago"
═══════════════════════════════════════════════════════════════ */
const listedAgo = (isoString) => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `Listed ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Listed ${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `Listed ${diffDay}d ago`;
};

/* ═══════════════════════════════════════════════════════════════
   NEW ARRIVAL CARD
═══════════════════════════════════════════════════════════════ */
const NewArrivalCard = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-muted shrink-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {/* NEW badge */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "var(--font-brand)",
            }}
          >
            <Sparkles size={9} /> New
          </span>
        </div>
        {/* Save */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onSave(event.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? (
            <BookmarkCheck size={13} className="text-white" />
          ) : (
            <Bookmark size={13} className="text-white" />
          )}
        </button>
        {/* Free badge */}
        {event.price === 0 && (
          <span
            className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "var(--font-brand)",
            }}
          >
            Free
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Listed ago */}
        <p
          className="text-[10px] font-medium"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {listedAgo(event.listedAt)}
        </p>

        {/* Title */}
        <h3
          className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:underline"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {event.title}
          {event.verified && (
            <BadgeCheck size={11} className="inline ml-1 text-foreground" />
          )}
        </h3>

        {/* Meta */}
        <div className="flex flex-col gap-1">
          <div
            className="flex items-center gap-1 text-[11px] text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Calendar size={10} className="shrink-0" />
            <span>{event.date}</span>
            <span className="text-border">·</span>
            <Clock size={10} className="shrink-0" />
            <span>{event.time}</span>
          </div>
          <div
            className="flex items-center gap-1 text-[11px] text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap">
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
                background: "var(--secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Capacity bar */}
        <div className="h-0.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: pct > 85 ? "var(--destructive)" : "var(--foreground)",
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div className="flex items-center gap-1">
            {event.reviewCount > 0 ? (
              <>
                <Star size={11} className="text-foreground fill-foreground" />
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
              </>
            ) : (
              <span
                className="text-[10px] text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                No reviews yet
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Ticket size={11} className="text-muted-foreground" />
            <span
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {event.priceLabel}
            </span>
          </div>
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
    <Sparkles size={24} className="text-muted-foreground mb-3" />
    <p
      className="text-sm font-semibold text-foreground mb-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      No new {levelLabel} events in {locationLabel}
    </p>
    <p
      className="text-xs text-muted-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Check back soon — new events are added daily.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   NEW ARRIVALS SECTION
═══════════════════════════════════════════════════════════════ */
const NewArrivalsSection = () => {
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

  const events = getNewArrivals(
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

  return (
    <section
      className="w-full bg-background"
      aria-label="New arrivals"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-foreground" />
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
                Freshly listed events in {locationLabel}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {events.map((event) => (
                <NewArrivalCard
                  key={event.id}
                  event={event}
                  saved={savedIds.has(event.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default NewArrivalsSection;
