// frontend/src/pages/browse/sections/TrendingSection.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Calendar, Clock, ChevronRight,
  Star, Bookmark, BookmarkCheck, Ticket,
  BadgeCheck, TrendingUp, Flame,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useLocation } from "@/context/LocationContext";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const unslugify = (slug) =>
  slug ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

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
   In production: GET /api/events/trending?category=music&sub=concerts&type=live-bands&location=dhaka
   Each event has a `trendScore` — higher = more trending (views + bookmarks + ticket velocity).
═══════════════════════════════════════════════════════════════ */
const ALL_TRENDING_EVENTS = [
  {
    id: 101, slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music", subCategory: "festivals", eventType: "multi-day",
    organizer: "SoundWave BD", verified: true,
    date: "Sat, Mar 22, 2025", time: "4:00 PM",
    venue: "Hatirjheel Amphitheatre", city: "dhaka",
    price: 900, priceLabel: "৳900",
    rating: 4.7, reviewCount: 98, attendees: 720, capacity: 900, spotsLeft: 180,
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
    tags: ["Music", "Weekend", "Outdoor"],
    trendScore: 98,
    trendLabel: "🔥 Selling Fast",
  },
  {
    id: 102, slug: "beats-bass-dhaka",
    title: "Beats & Bass — Dhaka Edition",
    category: "music", subCategory: "club-nights", eventType: "dj-sets",
    organizer: "Bassline Productions", verified: true,
    date: "Fri, Mar 28, 2025", time: "10:00 PM",
    venue: "Sky Lounge, Banani", city: "dhaka",
    price: 800, priceLabel: "৳800",
    rating: 4.5, reviewCount: 73, attendees: 180, capacity: 250, spotsLeft: 70,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    tags: ["EDM", "Bass", "Club"],
    trendScore: 91,
    trendLabel: "📈 Rising",
  },
  {
    id: 103, slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music", subCategory: "concerts", eventType: "solo-artists",
    organizer: "Café Harmony", verified: false,
    date: "Sun, Mar 23, 2025", time: "7:00 PM",
    venue: "Café Harmony, Gulshan", city: "dhaka",
    price: 350, priceLabel: "৳350",
    rating: 4.6, reviewCount: 55, attendees: 60, capacity: 80, spotsLeft: 20,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80",
    tags: ["Acoustic", "Café", "Intimate"],
    trendScore: 87,
    trendLabel: "🔥 Almost Full",
  },
  {
    id: 104, slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "Rock Circuit BD", verified: true,
    date: "Sat, Apr 12, 2025", time: "6:00 PM",
    venue: "Osmani Memorial Hall", city: "dhaka",
    price: 600, priceLabel: "৳600",
    rating: 4.8, reviewCount: 134, attendees: 850, capacity: 1200, spotsLeft: 350,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    tags: ["Live Bands", "Battle", "Rock"],
    trendScore: 95,
    trendLabel: "📈 Trending",
  },
  {
    id: 105, slug: "open-mic-star-search",
    title: "Open Mic Star Search",
    category: "music", subCategory: "open-mic", eventType: "music",
    organizer: "Spotlight Events", verified: false,
    date: "Fri, Apr 4, 2025", time: "7:30 PM",
    venue: "The Stage, Dhanmondi", city: "dhaka",
    price: 0, priceLabel: "Free",
    rating: 4.3, reviewCount: 41, attendees: 110, capacity: 200, spotsLeft: 90,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    tags: ["Open Mic", "Free", "Competition"],
    trendScore: 79,
    trendLabel: "🌟 Popular",
  },
  {
    id: 106, slug: "chittagong-rock-fest",
    title: "Chittagong Rock Fest 2025",
    category: "music", subCategory: "festivals", eventType: "outdoor",
    organizer: "CTG Music Society", verified: true,
    date: "Sat, Apr 19, 2025", time: "5:00 PM",
    venue: "MA Aziz Stadium, Chittagong", city: "chittagong",
    price: 1000, priceLabel: "৳1,000",
    rating: 4.9, reviewCount: 201, attendees: 4200, capacity: 6000, spotsLeft: 1800,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
    tags: ["Rock", "Festival", "Outdoor"],
    trendScore: 96,
    trendLabel: "🔥 Hot",
  },
  {
    id: 107, slug: "sylhet-classical-night",
    title: "Sylhet Classical Music Night",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "Sylhet Arts Council", verified: true,
    date: "Fri, Apr 11, 2025", time: "7:00 PM",
    venue: "Osmani Museum Hall, Sylhet", city: "sylhet",
    price: 500, priceLabel: "৳500",
    rating: 4.7, reviewCount: 66, attendees: 280, capacity: 400, spotsLeft: 120,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
    tags: ["Classical", "Live", "Cultural"],
    trendScore: 82,
    trendLabel: "📈 Rising",
  },
  {
    id: 108, slug: "football-championship-dhaka",
    title: "Dhaka Football Championship",
    category: "sports", subCategory: "football", eventType: "league-matches",
    organizer: "Dhaka FA", verified: true,
    date: "Sun, Mar 30, 2025", time: "4:00 PM",
    venue: "Bir Shreshtha Shaheed Sepoy", city: "dhaka",
    price: 300, priceLabel: "৳300",
    rating: 4.6, reviewCount: 88, attendees: 5400, capacity: 8000, spotsLeft: 2600,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    tags: ["Football", "Championship", "Sports"],
    trendScore: 89,
    trendLabel: "🔥 Trending",
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getTrendingEvents = (level, categorySlug, subCategorySlug, eventTypeSlug, locationId) => {
  let pool = [...ALL_TRENDING_EVENTS].sort((a, b) => b.trendScore - a.trendScore);

  if (locationId && locationId !== "current") {
    pool = pool.filter((e) => e.city === locationId);
  }

  if (level === "root")        return pool.slice(0, 6);
  if (level === "category")    return pool.filter((e) => e.category === categorySlug).slice(0, 6);
  if (level === "subCategory") return pool.filter((e) => e.category === categorySlug && e.subCategory === subCategorySlug).slice(0, 6);
  if (level === "eventType")   return pool.filter((e) => e.category === categorySlug && e.subCategory === subCategorySlug && e.eventType === eventTypeSlug).slice(0, 6);
  return [];
};

const getSectionTitle = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "Trending Now";
  if (level === "category")    return `Trending in ${unslugify(categorySlug)}`;
  if (level === "subCategory") return `Trending ${unslugify(subCategorySlug)}`;
  if (level === "eventType")   return `Trending ${unslugify(eventTypeSlug)}`;
  return "Trending Now";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "";
  if (level === "category")    return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   TREND RANK BADGE  (#1, #2, #3 get special treatment)
═══════════════════════════════════════════════════════════════ */
const RankBadge = ({ rank }) => {
  const isTop3 = rank <= 3;
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0"
      style={{
        background: isTop3 ? "var(--foreground)" : "var(--secondary)",
        color:      isTop3 ? "var(--background)" : "var(--muted-foreground)",
        fontFamily: "var(--font-heading)",
        border:     isTop3 ? "none" : "1px solid var(--border)",
      }}
    >
      {rank}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TRENDING CARD — Horizontal list item
═══════════════════════════════════════════════════════════════ */
const TrendingCard = ({ event, rank, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Rank */}
      <RankBadge rank={rank} />

      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded shrink-0 overflow-hidden bg-muted">
        <img
          src={event.image} alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm font-semibold text-foreground leading-snug line-clamp-1 group-hover:underline"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.title}
            {event.verified && <BadgeCheck size={11} className="inline ml-1 text-foreground" />}
          </h3>
          <button
            onClick={(e) => { e.preventDefault(); onSave(event.id); }}
            className="shrink-0"
            aria-label={saved ? "Unsave" : "Save"}
          >
            {saved
              ? <BookmarkCheck size={13} className="text-foreground" />
              : <Bookmark size={13} className="text-muted-foreground hover:text-foreground  " />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {/* Trend label */}
          <span
            className="text-[10px] font-medium"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
          >
            {event.trendLabel}
          </span>
          <span className="text-border text-[10px]">·</span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <Calendar size={10} /><span>{event.date}</span>
          </div>
          <span className="text-border text-[10px]">·</span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <MapPin size={10} /><span className="truncate max-w-[120px]">{event.venue}</span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-foreground fill-foreground" />
              <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
              <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>({event.reviewCount})</span>
            </div>
            {/* Mini capacity bar */}
            <div className="w-12 h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              {event.spotsLeft} left
            </span>
          </div>
          <span
            className="text-sm font-bold text-foreground shrink-0"
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
    <TrendingUp size={24} className="text-muted-foreground mb-3" />
    <p className="text-sm font-medium text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
      No trending {levelLabel} events in {locationLabel}
    </p>
    <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      Try changing your location or check back soon.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   TRENDING SECTION
═══════════════════════════════════════════════════════════════ */
const TrendingSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();
  const [savedIds, setSavedIds] = useState(new Set());

  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId    = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";

  const events = getTrendingEvents(level, categorySlug, subCategorySlug, eventTypeSlug, locationId);
  const sectionTitle = getSectionTitle(level, categorySlug, subCategorySlug, eventTypeSlug);
  const levelLabel   = getLevelLabel(level, categorySlug, subCategorySlug, eventTypeSlug);

  const viewAllTo =
    level === "root"          ? "/browse"
    : level === "category"    ? `/browse/${categorySlug}`
    : level === "subCategory" ? `/browse/${categorySlug}/${subCategorySlug}`
    : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Split into 2 columns of 3
  const col1 = events.slice(0, 3);
  const col2 = events.slice(3, 6);

  return (
    <section className="w-full bg-background" aria-label="Trending events">
      <Container>
        <div className="py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-foreground" />
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sectionTitle}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                Most viewed &amp; booked in {locationLabel} right now
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
              {/* Col 1 */}
              <div className="flex flex-col gap-3">
                {col1.map((event, i) => (
                  <TrendingCard
                    key={event.id}
                    event={event}
                    rank={i + 1}
                    saved={savedIds.has(event.id)}
                    onSave={toggleSave}
                  />
                ))}
              </div>
              {/* Col 2 */}
              {col2.length > 0 && (
                <div className="flex flex-col gap-3">
                  {col2.map((event, i) => (
                    <TrendingCard
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

export default TrendingSection;