// frontend/src/pages/browse/sections/FeaturedSection.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Calendar, Clock, ChevronRight,
  Star, Bookmark, BookmarkCheck, Ticket, BadgeCheck,
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

const formatAttendees = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

const spotsPercent = (attendees, capacity) =>
  Math.min(100, Math.round((attendees / capacity) * 100));

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL
   Keyed by category → subcategory → eventType for filtering.
   In production: replace with API call using route params + location.
   GET /api/events/featured?category=music&sub=concerts&type=live-bands&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_FEATURED_EVENTS = [
  {
    id: 1, slug: "dhaka-jazz-festival-2025",
    title: "Dhaka Jazz Festival 2025",
    category: "music", subCategory: "festivals", eventType: "multi-day",
    organizer: "Bangladesh Jazz Foundation", verified: true,
    date: "Sat, Mar 15, 2025", time: "6:00 PM",
    venue: "ICCB, Agargaon", city: "dhaka",
    price: 1200, priceLabel: "৳1,200",
    rating: 4.8, reviewCount: 124, attendees: 843, capacity: 1000, spotsLeft: 157,
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    tags: ["Jazz", "Live Music", "Festival"],
  },
  {
    id: 2, slug: "synthwave-night-dhaka",
    title: "Synthwave Night: Neon Dreams",
    category: "music", subCategory: "club-nights", eventType: "dj-sets",
    organizer: "Noir Events", verified: true,
    date: "Fri, Mar 21, 2025", time: "9:00 PM",
    venue: "Club Noir, Gulshan", city: "dhaka",
    price: 600, priceLabel: "৳600",
    rating: 4.6, reviewCount: 87, attendees: 210, capacity: 300, spotsLeft: 90,
    image: "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=800&q=80",
    tags: ["Electronic", "Club", "Neon"],
  },
  {
    id: 3, slug: "rock-arena-2025",
    title: "Rock Arena Bangladesh 2025",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "Arena Live", verified: true,
    date: "Sat, Mar 29, 2025", time: "5:00 PM",
    venue: "Bangabandhu National Stadium", city: "dhaka",
    price: 2500, priceLabel: "৳2,500",
    rating: 4.9, reviewCount: 312, attendees: 14500, capacity: 20000, spotsLeft: 5500,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    tags: ["Rock", "Concert", "Stadium"],
  },
  {
    id: 4, slug: "bd-premier-league-final",
    title: "BD Premier League Final",
    category: "sports", subCategory: "football", eventType: "league-matches",
    organizer: "BFF", verified: true,
    date: "Fri, Mar 14, 2025", time: "7:00 PM",
    venue: "Bangabandhu National Stadium", city: "dhaka",
    price: 500, priceLabel: "৳500",
    rating: 4.7, reviewCount: 203, attendees: 18000, capacity: 20000, spotsLeft: 2000,
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80",
    tags: ["Football", "League", "Final"],
  },
  {
    id: 5, slug: "dhaka-theatre-gala",
    title: "Dhaka Theatre Gala Night",
    category: "arts-culture", subCategory: "theatre", eventType: "drama",
    organizer: "National Theatre BD", verified: true,
    date: "Sat, Mar 22, 2025", time: "7:30 PM",
    venue: "National Theatre, Shahbag", city: "dhaka",
    price: 800, priceLabel: "৳800",
    rating: 4.7, reviewCount: 91, attendees: 380, capacity: 500, spotsLeft: 120,
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
    tags: ["Theatre", "Drama", "Culture"],
  },
  {
    id: 6, slug: "solo-acoustic-night",
    title: "Solo Acoustic Night",
    category: "music", subCategory: "concerts", eventType: "solo-artists",
    organizer: "Acoustic Studio BD", verified: false,
    date: "Thu, Mar 20, 2025", time: "8:00 PM",
    venue: "The Alley, Dhanmondi", city: "dhaka",
    price: 400, priceLabel: "৳400",
    rating: 4.5, reviewCount: 48, attendees: 80, capacity: 120, spotsLeft: 40,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    tags: ["Acoustic", "Solo", "Intimate"],
  },
  {
    id: 7, slug: "open-mic-dhanmondi",
    title: "Friday Open Mic Dhaka",
    category: "music", subCategory: "open-mic", eventType: "music",
    organizer: "Stage Fright Events", verified: false,
    date: "Fri, Mar 28, 2025", time: "7:00 PM",
    venue: "Café Uprising, Dhanmondi", city: "dhaka",
    price: 0, priceLabel: "Free",
    rating: 4.4, reviewCount: 62, attendees: 95, capacity: 150, spotsLeft: 55,
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
    tags: ["Open Mic", "Free", "Music"],
  },
  {
    id: 8, slug: "live-bands-showdown",
    title: "Live Bands Showdown 2025",
    category: "music", subCategory: "concerts", eventType: "live-bands",
    organizer: "BandHub BD", verified: true,
    date: "Sat, Apr 5, 2025", time: "6:00 PM",
    venue: "Bashundhara City Arena", city: "dhaka",
    price: 1500, priceLabel: "৳1,500",
    rating: 4.8, reviewCount: 175, attendees: 2100, capacity: 3000, spotsLeft: 900,
    image: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80",
    tags: ["Live Bands", "Competition", "Rock"],
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER EVENTS BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getFeaturedEvents = (level, categorySlug, subCategorySlug, eventTypeSlug, locationId) => {
  let pool = ALL_FEATURED_EVENTS;

  // Filter by location
  if (locationId && locationId !== "current") {
    pool = pool.filter((e) => e.city === locationId);
  }

  // Filter by route level
  if (level === "root") {
    // All categories — return top across everything
    return pool.slice(0, 3);
  }
  if (level === "category") {
    return pool.filter((e) => e.category === categorySlug).slice(0, 3);
  }
  if (level === "subCategory") {
    return pool.filter(
      (e) => e.category === categorySlug && e.subCategory === subCategorySlug
    ).slice(0, 3);
  }
  if (level === "eventType") {
    return pool.filter(
      (e) =>
        e.category === categorySlug &&
        e.subCategory === subCategorySlug &&
        e.eventType === eventTypeSlug
    ).slice(0, 3);
  }
  return [];
};

/* ═══════════════════════════════════════════════════════════════
   SECTION TITLE by level
═══════════════════════════════════════════════════════════════ */
const getSectionTitle = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "Featured Events";
  if (level === "category")    return `Featured in ${unslugify(categorySlug)}`;
  if (level === "subCategory") return `Featured ${unslugify(subCategorySlug)}`;
  if (level === "eventType")   return `Featured ${unslugify(eventTypeSlug)}`;
  return "Featured Events";
};

/* ═══════════════════════════════════════════════════════════════
   CARDS
═══════════════════════════════════════════════════════════════ */
const FeaturedCardLarge = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all"
    >
      <div className="relative h-52 sm:h-64 overflow-hidden bg-muted">
        <img
          src={event.image} alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-brand)" }}
          >
            Featured
          </span>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onSave(event.id); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? <BookmarkCheck size={14} className="text-white" /> : <Bookmark size={14} className="text-white" />}
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex gap-1.5 flex-wrap">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--secondary)", fontFamily: "var(--font-sans)" }}>
              {tag}
            </span>
          ))}
        </div>

        <div>
          <div className="flex items-start gap-1.5 mb-1">
            <h3 className="text-base font-bold text-foreground leading-snug group-hover:underline"
              style={{ fontFamily: "var(--font-heading)" }}>
              {event.title}
            </h3>
            {event.verified && <BadgeCheck size={14} className="text-foreground shrink-0 mt-0.5" />}
          </div>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            by {event.organizer}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <Calendar size={12} /><span>{event.date}</span>
            <span className="text-border">·</span>
            <Clock size={12} /><span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <MapPin size={12} /><span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              <span className="font-semibold text-foreground">{formatAttendees(event.attendees)}</span> attending
            </span>
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              {event.spotsLeft} spots left
            </span>
          </div>
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full"
              style={{ width: `${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-foreground fill-foreground" />
            <span className="text-xs font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>({event.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ticket size={12} className="text-muted-foreground" />
            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              {event.priceLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCardSmall = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      <div className="relative w-20 h-20 rounded shrink-0 overflow-hidden bg-muted">
        <img src={event.image} alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:underline"
              style={{ fontFamily: "var(--font-heading)" }}>
              {event.title}
              {event.verified && <BadgeCheck size={12} className="inline ml-1 text-foreground" />}
            </h3>
            <button onClick={(e) => { e.preventDefault(); onSave(event.id); }} className="shrink-0 mt-0.5">
              {saved
                ? <BookmarkCheck size={13} className="text-foreground" />
                : <Bookmark size={13} className="text-muted-foreground hover:text-foreground  " />}
            </button>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1" style={{ fontFamily: "var(--font-sans)" }}>
            <Calendar size={10} /><span>{event.date}</span>
            <span className="text-border">·</span>
            <Clock size={10} /><span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <MapPin size={10} /><span className="truncate">{event.venue}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-foreground fill-foreground" />
            <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
            <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>({event.reviewCount})</span>
          </div>
          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {event.priceLabel}
          </span>
        </div>
        <div className="h-0.5 rounded-full bg-secondary overflow-hidden mt-1.5">
          <div className="h-full rounded-full"
            style={{ width: `${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }} />
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ locationLabel, levelLabel }) => (
  <div
    className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-center"
  >
    <p className="text-sm font-medium text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
      No featured {levelLabel} events in {locationLabel}
    </p>
    <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      Try changing your location or check back soon.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   FEATURED SECTION
═══════════════════════════════════════════════════════════════ */
const FeaturedSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();
  const [savedIds, setSavedIds] = useState(new Set());

  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";

  // Derive featured events based on current route level + location
  const events = getFeaturedEvents(level, categorySlug, subCategorySlug, eventTypeSlug, locationId);

  const sectionTitle = getSectionTitle(level, categorySlug, subCategorySlug, eventTypeSlug);
  const subtitle = `Hand-picked highlights in ${locationLabel}`;

  // "View all" links back to the current level's listing
  const viewAllTo =
    level === "root"        ? "/browse"
    : level === "category"  ? `/browse/${categorySlug}`
    : level === "subCategory" ? `/browse/${categorySlug}/${subCategorySlug}`
    : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const levelLabel =
    level === "root"          ? ""
    : level === "category"    ? unslugify(categorySlug)
    : level === "subCategory" ? unslugify(subCategorySlug)
    : unslugify(eventTypeSlug);

  const [primary, ...rest] = events;

  return (
    <section className="w-full bg-background" aria-label="Featured events">
      <Container>
        <div className="py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {sectionTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {subtitle}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary large card */}
              <FeaturedCardLarge
                event={primary}
                saved={savedIds.has(primary.id)}
                onSave={toggleSave}
              />

              {/* Secondary small cards */}
              {rest.length > 0 && (
                <div className="flex flex-col gap-4">
                  {rest.slice(0, 2).map((event) => (
                    <FeaturedCardSmall
                      key={event.id}
                      event={event}
                      saved={savedIds.has(event.id)}
                      onSave={toggleSave}
                    />
                  ))}
                  {rest.length === 1 && (
                    <Link
                      to={viewAllTo}
                      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border h-24 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30  "
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Explore more <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </Container>
    </section>
  );
};

export default FeaturedSection;