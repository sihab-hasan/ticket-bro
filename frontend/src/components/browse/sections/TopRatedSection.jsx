// frontend/src/pages/browse/sections/TopRatedSection.jsx
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
  Award,
  ThumbsUp,
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
   STAR RENDERER
   Renders full / half / empty stars from a rating value
═══════════════════════════════════════════════════════════════ */
const StarRow = ({ rating, size = 12 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i;
    const half = !filled && rating >= i - 0.5;
    stars.push(
      <span
        key={i}
        className="relative inline-block"
        style={{ width: size, height: size }}
      >
        {/* Empty star */}
        <Star size={size} className="text-border" />
        {/* Filled overlay */}
        {(filled || half) && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: half ? "50%" : "100%" }}
          >
            <Star size={size} className="text-foreground fill-foreground" />
          </span>
        )}
      </span>,
    );
  }
  return <span className="flex items-center gap-0.5">{stars}</span>;
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL
   Sorted by rating desc, then reviewCount desc.
   In production: GET /api/events/top-rated?category=music&sub=concerts&type=live-bands&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_TOP_RATED = [
  {
    id: 401,
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
    highlight: "Outstanding crowd energy",
    recommended: 97,
  },
  {
    id: 402,
    slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival 2025",
    category: "music",
    subCategory: "festivals",
    eventType: "multi-day",
    organizer: "Bangladesh Jazz Foundation",
    verified: true,
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
    highlight: "World-class performers",
    recommended: 95,
  },
  {
    id: 403,
    slug: "live-bands-showdown",
    title: "Live Bands Showdown 2025",
    category: "music",
    subCategory: "concerts",
    eventType: "live-bands",
    organizer: "BandHub BD",
    verified: true,
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
    highlight: "Best production quality",
    recommended: 94,
  },
  {
    id: 404,
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
    highlight: "Incredible lineup",
    recommended: 93,
  },
  {
    id: 405,
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
    highlight: "Beautiful venue & vibes",
    recommended: 91,
  },
  {
    id: 406,
    slug: "bd-premier-league-final",
    title: "BD Premier League Final",
    category: "sports",
    subCategory: "football",
    eventType: "league-matches",
    organizer: "BFF",
    verified: true,
    date: "Fri, Mar 14, 2025",
    time: "7:00 PM",
    venue: "Bangabandhu Stadium",
    city: "dhaka",
    price: 500,
    priceLabel: "৳500",
    rating: 4.7,
    reviewCount: 203,
    attendees: 18000,
    capacity: 20000,
    spotsLeft: 2000,
    image:
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80",
    tags: ["Football", "League"],
    highlight: "Electrifying atmosphere",
    recommended: 90,
  },
  {
    id: 407,
    slug: "dhaka-theatre-gala",
    title: "Dhaka Theatre Gala Night",
    category: "arts-culture",
    subCategory: "theatre",
    eventType: "drama",
    organizer: "National Theatre BD",
    verified: true,
    date: "Sat, Mar 22, 2025",
    time: "7:30 PM",
    venue: "National Theatre, Shahbag",
    city: "dhaka",
    price: 800,
    priceLabel: "৳800",
    rating: 4.7,
    reviewCount: 91,
    attendees: 380,
    capacity: 500,
    spotsLeft: 120,
    image:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",
    tags: ["Theatre", "Drama"],
    highlight: "Exceptional performances",
    recommended: 89,
  },
  {
    id: 408,
    slug: "chittagong-rock-fest",
    title: "Chittagong Rock Fest 2025",
    category: "music",
    subCategory: "festivals",
    eventType: "outdoor",
    organizer: "CTG Music Society",
    verified: true,
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
    highlight: "Massive outdoor spectacle",
    recommended: 98,
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getTopRated = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_TOP_RATED].sort(
    (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
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
  if (level === "root") return "Top Rated";
  if (level === "category") return `Top Rated ${unslugify(categorySlug)}`;
  if (level === "subCategory") return `Top Rated ${unslugify(subCategorySlug)}`;
  if (level === "eventType") return `Top Rated ${unslugify(eventTypeSlug)}`;
  return "Top Rated";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root") return "";
  if (level === "category") return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   TOP RATED CARD
═══════════════════════════════════════════════════════════════ */
const TopRatedCard = ({ event, rank, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);
  const isTop3 = rank <= 3;

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Rank badge */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold"
          style={{
            background: isTop3 ? "var(--foreground)" : "var(--secondary)",
            color: isTop3 ? "var(--background)" : "var(--muted-foreground)",
            border: isTop3 ? "none" : "1px solid var(--border)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {rank}
        </span>
        {/* Award icon for top 3 */}
        {isTop3 && <Award size={12} className="text-muted-foreground" />}
      </div>

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

          {/* Star row + rating */}
          <div className="flex items-center gap-1.5 mb-1">
            <StarRow rating={event.rating} size={11} />
            <span
              className="text-[11px] font-bold text-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {event.rating}
            </span>
            <span
              className="text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              ({event.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Highlight quote */}
          {event.highlight && (
            <p
              className="text-[11px] text-muted-foreground italic mb-1 line-clamp-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              "{event.highlight}"
            </p>
          )}

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
              <MapPin size={10} />
              <span className="truncate max-w-[130px]">{event.venue}</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            {/* Recommended % */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
                background: "var(--secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <ThumbsUp size={9} /> {event.recommended}% recommended
            </span>
          </div>
          <span
            className="text-sm font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.priceLabel}
          </span>
        </div>

        {/* Capacity bar */}
        <div className="h-0.5 rounded-full bg-secondary overflow-hidden mt-1.5">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: pct > 85 ? "var(--destructive)" : "var(--foreground)",
            }}
          />
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
    <Award size={24} className="text-muted-foreground mb-3" />
    <p
      className="text-sm font-semibold text-foreground mb-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      No rated {levelLabel} events in {locationLabel} yet
    </p>
    <p
      className="text-xs text-muted-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Reviews will appear here once attendees share their experiences.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   TOP RATED SECTION
═══════════════════════════════════════════════════════════════ */
const TopRatedSection = () => {
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

  const events = getTopRated(
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

  const col1 = events.slice(0, 3);
  const col2 = events.slice(3, 6);

  return (
    <section
      className="w-full bg-background"
      aria-label="Top rated events"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-foreground" />
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
                Highest rated by attendees in {locationLabel}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                {col1.map((event, i) => (
                  <TopRatedCard
                    key={event.id}
                    event={event}
                    rank={i + 1}
                    saved={savedIds.has(event.id)}
                    onSave={toggleSave}
                  />
                ))}
              </div>
              {col2.length > 0 && (
                <div className="flex flex-col gap-3">
                  {col2.map((event, i) => (
                    <TopRatedCard
                      key={event.id}
                      event={event}
                      rank={i + 4}
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

export default TopRatedSection;
