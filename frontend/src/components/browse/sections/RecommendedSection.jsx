// frontend/src/pages/browse/sections/RecommendedSection.jsx
//
// Shows personalized event recommendations based on:
//   - User's browsing history (mocked via localStorage tags)
//   - Current route level (category / subCategory / eventType)
//   - Selected location
//
// In production: GET /api/events/recommended?userId=123&category=music&location=dhaka
//
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Calendar, Clock, ChevronRight,
  Star, Bookmark, BookmarkCheck, Ticket,
  BadgeCheck, Sparkles, ThumbsUp, X,
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
   RECOMMENDATION REASONS
   Each event has a `reason` explaining why it's recommended.
   In production this comes from your ML/recommendation API.
═══════════════════════════════════════════════════════════════ */
const REASONS = {
  interest:    "Based on your interests",
  viewed:      "Because you viewed similar events",
  saved:       "Similar to events you saved",
  popular:     "Popular with people like you",
  location:    "Happening near you",
  trending:    "Trending in your area",
  category:    "Matches your favourite category",
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL
   In production: GET /api/events/recommended?userId=123&category=music&sub=concerts&type=live-bands&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_RECOMMENDED = [
  {
    id: 701, slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh 2025",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "Arena Live", verified: true,
    date: "Sat, Mar 29, 2025", time: "5:00 PM",
    venue: "Bangabandhu Stadium", city: "dhaka",
    price: 2500, priceLabel: "৳2,500",
    rating: 4.9, reviewCount: 312, attendees: 14500, capacity: 20000, spotsLeft: 5500,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",
    tags: ["Rock", "Stadium", "Live"],
    reason: "interest",
    matchScore: 98,
  },
  {
    id: 702, slug: "live-bands-showdown",
    title: "Live Bands Showdown 2025",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "BandHub BD", verified: true,
    date: "Sat, Apr 5, 2025", time: "6:00 PM",
    venue: "Bashundhara City Arena", city: "dhaka",
    price: 1500, priceLabel: "৳1,500",
    rating: 4.8, reviewCount: 175, attendees: 2100, capacity: 3000, spotsLeft: 900,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    tags: ["Live Bands", "Rock", "Competition"],
    reason: "viewed",
    matchScore: 95,
  },
  {
    id: 703, slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival 2025",
    category: "music", subCategory: "festivals", eventType: "multi-day",
    organizer: "Bangladesh Jazz Foundation", verified: true,
    date: "Sat, Mar 15, 2025", time: "6:00 PM",
    venue: "ICCB, Agargaon", city: "dhaka",
    price: 1200, priceLabel: "৳1,200",
    rating: 4.8, reviewCount: 124, attendees: 843, capacity: 1000, spotsLeft: 157,
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    tags: ["Jazz", "Festival", "Culture"],
    reason: "popular",
    matchScore: 91,
  },
  {
    id: 704, slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music", subCategory: "concerts", eventType: "solo-artists",
    organizer: "Café Harmony", verified: false,
    date: "Sun, Mar 23, 2025", time: "7:00 PM",
    venue: "Café Harmony, Gulshan", city: "dhaka",
    price: 350, priceLabel: "৳350",
    rating: 4.6, reviewCount: 55, attendees: 60, capacity: 80, spotsLeft: 20,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80",
    tags: ["Acoustic", "Intimate", "Solo"],
    reason: "saved",
    matchScore: 88,
  },
  {
    id: 705, slug: "live-bands-battle",
    title: "Live Bands Battle Night",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "Rock Circuit BD", verified: true,
    date: "Sat, Apr 12, 2025", time: "6:00 PM",
    venue: "Osmani Memorial Hall", city: "dhaka",
    price: 600, priceLabel: "৳600",
    rating: 4.8, reviewCount: 134, attendees: 850, capacity: 1200, spotsLeft: 350,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    tags: ["Live Bands", "Battle", "Rock"],
    reason: "trending",
    matchScore: 86,
  },
  {
    id: 706, slug: "dhaka-music-weekend",
    title: "Dhaka Music Weekend",
    category: "music", subCategory: "festivals", eventType: "multi-day",
    organizer: "SoundWave BD", verified: true,
    date: "Sat, Mar 22, 2025", time: "4:00 PM",
    venue: "Hatirjheel Amphitheatre", city: "dhaka",
    price: 900, priceLabel: "৳900",
    rating: 4.7, reviewCount: 98, attendees: 720, capacity: 900, spotsLeft: 180,
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    tags: ["Music", "Outdoor", "Weekend"],
    reason: "location",
    matchScore: 84,
  },
  {
    id: 707, slug: "synthwave-night-dhaka",
    title: "Synthwave Night: Neon Dreams",
    category: "music", subCategory: "club-nights", eventType: "dj-sets",
    organizer: "Noir Events", verified: true,
    date: "Fri, Mar 21, 2025", time: "9:00 PM",
    venue: "Club Noir, Gulshan", city: "dhaka",
    price: 600, priceLabel: "৳600",
    rating: 4.6, reviewCount: 87, attendees: 210, capacity: 300, spotsLeft: 90,
    image: "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=600&q=80",
    tags: ["Electronic", "Club", "Neon"],
    reason: "category",
    matchScore: 81,
  },
  {
    id: 708, slug: "open-mic-friday",
    title: "Friday Open Mic Dhaka",
    category: "music", subCategory: "open-mic", eventType: "music",
    organizer: "Stage Fright Events", verified: false,
    date: "Fri, Mar 28, 2025", time: "7:00 PM",
    venue: "Café Uprising, Dhanmondi", city: "dhaka",
    price: 0, priceLabel: "Free",
    rating: 4.4, reviewCount: 62, attendees: 95, capacity: 150, spotsLeft: 55,
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
    tags: ["Open Mic", "Free", "Music"],
    reason: "popular",
    matchScore: 78,
  },
  {
    id: 709, slug: "chittagong-rock-fest",
    title: "Chittagong Rock Fest 2025",
    category: "music", subCategory: "festivals", eventType: "outdoor",
    organizer: "CTG Music Society", verified: true,
    date: "Sat, Apr 19, 2025", time: "5:00 PM",
    venue: "MA Aziz Stadium, Chittagong", city: "chittagong",
    price: 1000, priceLabel: "৳1,000",
    rating: 4.9, reviewCount: 201, attendees: 4200, capacity: 6000, spotsLeft: 1800,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80",
    tags: ["Rock", "Festival", "Outdoor"],
    reason: "trending",
    matchScore: 76,
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getRecommended = (level, categorySlug, subCategorySlug, eventTypeSlug, locationId, dismissed) => {
  let pool = [...ALL_RECOMMENDED]
    .filter((e) => !dismissed.has(e.id))
    .sort((a, b) => b.matchScore - a.matchScore);

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
  if (level === "root")        return "Recommended For You";
  if (level === "category")    return `Recommended ${unslugify(categorySlug)} Events`;
  if (level === "subCategory") return `Recommended ${unslugify(subCategorySlug)}`;
  if (level === "eventType")   return `Recommended ${unslugify(eventTypeSlug)} Events`;
  return "Recommended For You";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "";
  if (level === "category")    return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   MATCH SCORE BAR
═══════════════════════════════════════════════════════════════ */
const MatchBar = ({ score }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${score}%`, background: "var(--foreground)" }}
      />
    </div>
    <span
      className="text-[10px] font-semibold text-foreground shrink-0"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {score}% match
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   REASON PILL
═══════════════════════════════════════════════════════════════ */
const ReasonPill = ({ reason }) => (
  <span
    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
    style={{
      borderColor: "var(--border)",
      color:       "var(--muted-foreground)",
      background:  "var(--secondary)",
      fontFamily:  "var(--font-sans)",
    }}
  >
    <Sparkles size={8} />
    {REASONS[reason] || reason}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   RECOMMENDED CARD
═══════════════════════════════════════════════════════════════ */
const RecommendedCard = ({ event, saved, onSave, onDismiss }) => {
  const pct = spotsPercent(event.attendees, event.capacity);

  return (
    <div className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all">

      {/* Dismiss button */}
      <button
        onClick={(e) => { e.preventDefault(); onDismiss(event.id); }}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        aria-label="Dismiss recommendation"
      >
        <X size={10} className="text-white" />
      </button>

      {/* Image */}
      <Link to={`/events/${event.slug}`} className="block">
        <div className="relative h-36 overflow-hidden bg-muted shrink-0">
          <img
            src={event.image} alt={event.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          {event.price === 0 && (
            <span
              className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-brand)" }}
            >
              Free
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
      </Link>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">

        {/* Reason pill */}
        <ReasonPill reason={event.reason} />

        {/* Title */}
        <Link to={`/events/${event.slug}`}>
          <h3
            className="text-sm font-bold text-foreground leading-snug line-clamp-2 hover:underline"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {event.title}
            {event.verified && <BadgeCheck size={11} className="inline ml-1 text-foreground" />}
          </h3>
        </Link>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap">
          {event.tags.slice(0, 2).map((tag) => (
            <span key={tag}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--secondary)", fontFamily: "var(--font-sans)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <Calendar size={10} className="shrink-0" /><span>{event.date}</span>
            <span className="text-border">·</span>
            <Clock size={10} className="shrink-0" /><span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <MapPin size={10} className="shrink-0" /><span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Match score bar */}
        <MatchBar score={event.matchScore} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="text-foreground fill-foreground" />
              <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
              <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>({event.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(event.id)}
              aria-label={saved ? "Unsave" : "Save"}
            >
              {saved
                ? <BookmarkCheck size={13} className="text-foreground" />
                : <Bookmark size={13} className="text-muted-foreground hover:text-foreground transition-colors" />}
            </button>
            <div className="flex items-center gap-1">
              <Ticket size={11} className="text-muted-foreground" />
              <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {event.priceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ locationLabel, levelLabel, onReset }) => (
  <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-center">
    <ThumbsUp size={24} className="text-muted-foreground mb-3" />
    <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
      No {levelLabel} recommendations in {locationLabel} yet
    </p>
    <p className="text-xs text-muted-foreground mb-3" style={{ fontFamily: "var(--font-sans)" }}>
      Browse more events to improve your recommendations.
    </p>
    <button
      onClick={onReset}
      className="text-xs font-semibold text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Reset dismissed events
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   RECOMMENDED SECTION
═══════════════════════════════════════════════════════════════ */
const RecommendedSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const [savedIds,    setSavedIds]    = useState(new Set());
  const [dismissed,  setDismissed]   = useState(new Set());

  const level         = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId    = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const levelLabel    = getLevelLabel(level, categorySlug, subCategorySlug, eventTypeSlug);

  const events       = getRecommended(level, categorySlug, subCategorySlug, eventTypeSlug, locationId, dismissed);
  const sectionTitle = getSectionTitle(level, categorySlug, subCategorySlug, eventTypeSlug);

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

  const dismissEvent = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const resetDismissed = () => setDismissed(new Set());

  return (
    <section className="w-full bg-background" aria-label="Recommended events">
      <Container>
        <div className="py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ThumbsUp size={16} className="text-foreground" />
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sectionTitle}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                Personalised picks based on your interests in {locationLabel}
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
            <EmptyState
              locationLabel={locationLabel}
              levelLabel={levelLabel}
              onReset={resetDismissed}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {events.map((event) => (
                <RecommendedCard
                  key={event.id}
                  event={event}
                  saved={savedIds.has(event.id)}
                  onSave={toggleSave}
                  onDismiss={dismissEvent}
                />
              ))}
            </div>
          )}

        </div>
      </Container>
    </section>
  );
};

export default RecommendedSection;
