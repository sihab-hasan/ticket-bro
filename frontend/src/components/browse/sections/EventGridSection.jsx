// frontend/src/pages/browse/sections/EventGridSection.jsx
import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Calendar, Clock, ChevronRight, ChevronLeft,
  Star, Bookmark, BookmarkCheck, Ticket, BadgeCheck,
  LayoutGrid, List, SlidersHorizontal, Inbox,
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

const EVENTS_PER_PAGE = 12;

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA POOL
   In production: GET /api/events?category=music&sub=concerts&type=live-bands&location=dhaka&page=1&limit=12
═══════════════════════════════════════════════════════════════ */
const ALL_EVENTS = [
  { id: 1,  slug: "dhaka-jazz-festival-2025",    title: "Dhaka Jazz Festival 2025",       category: "music",       subCategory: "festivals",   eventType: "multi-day",      organizer: "Bangladesh Jazz Foundation", verified: true,  date: "Sat, Mar 15", time: "6:00 PM", venue: "ICCB, Agargaon",              city: "dhaka",      price: 1200, priceLabel: "৳1,200", rating: 4.8, reviewCount: 124, attendees: 843,  capacity: 1000,  spotsLeft: 157,  image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",  tags: ["Jazz", "Festival"] },
  { id: 2,  slug: "synthwave-night-dhaka",        title: "Synthwave Night: Neon Dreams",   category: "music",       subCategory: "club-nights", eventType: "dj-sets",        organizer: "Noir Events",               verified: true,  date: "Fri, Mar 21", time: "9:00 PM", venue: "Club Noir, Gulshan",           city: "dhaka",      price: 600,  priceLabel: "৳600",   rating: 4.6, reviewCount: 87,  attendees: 210,  capacity: 300,   spotsLeft: 90,   image: "https://images.unsplash.com/photo-1571266028243-d220c6a6db90?w=600&q=80",  tags: ["Electronic", "Club"] },
  { id: 3,  slug: "rock-arena-2025",              title: "Rock Arena Bangladesh 2025",     category: "music",       subCategory: "concerts",    eventType: "live-bands",     organizer: "Arena Live",                verified: true,  date: "Sat, Mar 29", time: "5:00 PM", venue: "Bangabandhu Stadium",          city: "dhaka",      price: 2500, priceLabel: "৳2,500", rating: 4.9, reviewCount: 312, attendees: 14500, capacity: 20000, spotsLeft: 5500, image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80",  tags: ["Rock", "Stadium"] },
  { id: 4,  slug: "solo-acoustic-night",          title: "Solo Acoustic Night",            category: "music",       subCategory: "concerts",    eventType: "solo-artists",   organizer: "Acoustic Studio BD",        verified: false, date: "Thu, Mar 20", time: "8:00 PM", venue: "The Alley, Dhanmondi",         city: "dhaka",      price: 400,  priceLabel: "৳400",   rating: 4.5, reviewCount: 48,  attendees: 80,   capacity: 120,   spotsLeft: 40,   image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",  tags: ["Acoustic", "Solo"] },
  { id: 5,  slug: "open-mic-friday",              title: "Friday Open Mic Dhaka",          category: "music",       subCategory: "open-mic",    eventType: "music",          organizer: "Stage Fright Events",       verified: false, date: "Fri, Mar 28", time: "7:00 PM", venue: "Café Uprising, Dhanmondi",     city: "dhaka",      price: 0,    priceLabel: "Free",   rating: 4.4, reviewCount: 62,  attendees: 95,   capacity: 150,   spotsLeft: 55,   image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",  tags: ["Open Mic", "Free"] },
  { id: 6,  slug: "live-bands-showdown",          title: "Live Bands Showdown 2025",       category: "music",       subCategory: "concerts",    eventType: "live-bands",     organizer: "BandHub BD",                verified: true,  date: "Sat, Apr 5",  time: "6:00 PM", venue: "Bashundhara City Arena",       city: "dhaka",      price: 1500, priceLabel: "৳1,500", rating: 4.8, reviewCount: 175, attendees: 2100, capacity: 3000,  spotsLeft: 900,  image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",  tags: ["Live Bands", "Rock"] },
  { id: 7,  slug: "dhaka-music-weekend",          title: "Dhaka Music Weekend",            category: "music",       subCategory: "festivals",   eventType: "multi-day",      organizer: "SoundWave BD",              verified: true,  date: "Sat, Mar 22", time: "4:00 PM", venue: "Hatirjheel Amphitheatre",      city: "dhaka",      price: 900,  priceLabel: "৳900",   rating: 4.7, reviewCount: 98,  attendees: 720,  capacity: 900,   spotsLeft: 180,  image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",  tags: ["Music", "Outdoor"] },
  { id: 8,  slug: "beats-bass-dhaka",             title: "Beats & Bass — Dhaka Edition",  category: "music",       subCategory: "club-nights", eventType: "dj-sets",        organizer: "Bassline Productions",      verified: true,  date: "Fri, Mar 28", time: "10:00 PM",venue: "Sky Lounge, Banani",           city: "dhaka",      price: 800,  priceLabel: "৳800",   rating: 4.5, reviewCount: 73,  attendees: 180,  capacity: 250,   spotsLeft: 70,   image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",  tags: ["EDM", "Club"] },
  { id: 9,  slug: "acoustic-cafe-sessions",       title: "Acoustic Café Sessions Vol. 7", category: "music",       subCategory: "concerts",    eventType: "solo-artists",   organizer: "Café Harmony",              verified: false, date: "Sun, Mar 23", time: "7:00 PM", venue: "Café Harmony, Gulshan",        city: "dhaka",      price: 350,  priceLabel: "৳350",   rating: 4.6, reviewCount: 55,  attendees: 60,   capacity: 80,    spotsLeft: 20,   image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&q=80",  tags: ["Acoustic", "Café"] },
  { id: 10, slug: "live-bands-battle",            title: "Live Bands Battle Night",        category: "music",       subCategory: "concerts",    eventType: "live-bands",     organizer: "Rock Circuit BD",           verified: true,  date: "Sat, Apr 12", time: "6:00 PM", venue: "Osmani Memorial Hall",          city: "dhaka",      price: 600,  priceLabel: "৳600",   rating: 4.8, reviewCount: 134, attendees: 850,  capacity: 1200,  spotsLeft: 350,  image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",  tags: ["Live Bands", "Battle"] },
  { id: 11, slug: "bd-premier-league-final",      title: "BD Premier League Final",        category: "sports",      subCategory: "football",    eventType: "league-matches", organizer: "BFF",                       verified: true,  date: "Fri, Mar 14", time: "7:00 PM", venue: "Bangabandhu Stadium",          city: "dhaka",      price: 500,  priceLabel: "৳500",   rating: 4.7, reviewCount: 203, attendees: 18000, capacity: 20000, spotsLeft: 2000, image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80",  tags: ["Football", "League"] },
  { id: 12, slug: "dhaka-theatre-gala",           title: "Dhaka Theatre Gala Night",       category: "arts-culture",subCategory: "theatre",     eventType: "drama",          organizer: "National Theatre BD",       verified: true,  date: "Sat, Mar 22", time: "7:30 PM", venue: "National Theatre, Shahbag",    city: "dhaka",      price: 800,  priceLabel: "৳800",   rating: 4.7, reviewCount: 91,  attendees: 380,  capacity: 500,   spotsLeft: 120,  image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",  tags: ["Theatre", "Drama"] },
  { id: 13, slug: "chittagong-rock-fest",         title: "Chittagong Rock Fest 2025",      category: "music",       subCategory: "festivals",   eventType: "outdoor",        organizer: "CTG Music Society",         verified: true,  date: "Sat, Apr 19", time: "5:00 PM", venue: "MA Aziz Stadium, Chittagong",  city: "chittagong", price: 1000, priceLabel: "৳1,000", rating: 4.9, reviewCount: 201, attendees: 4200, capacity: 6000,  spotsLeft: 1800, image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80",  tags: ["Rock", "Festival"] },
  { id: 14, slug: "sylhet-classical-night",       title: "Sylhet Classical Music Night",   category: "music",       subCategory: "concerts",    eventType: "live-bands",     organizer: "Sylhet Arts Council",       verified: true,  date: "Fri, Apr 11", time: "7:00 PM", venue: "Osmani Museum Hall, Sylhet",   city: "sylhet",     price: 500,  priceLabel: "৳500",   rating: 4.7, reviewCount: 66,  attendees: 280,  capacity: 400,   spotsLeft: 120,  image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",  tags: ["Classical", "Live"] },
  { id: 15, slug: "open-mic-star-search",         title: "Open Mic Star Search",           category: "music",       subCategory: "open-mic",    eventType: "music",          organizer: "Spotlight Events",          verified: false, date: "Fri, Apr 4",  time: "7:30 PM", venue: "The Stage, Dhanmondi",          city: "dhaka",      price: 0,    priceLabel: "Free",   rating: 4.3, reviewCount: 41,  attendees: 110,  capacity: 200,   spotsLeft: 90,   image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",  tags: ["Open Mic", "Free"] },
  { id: 16, slug: "jazz-brunch-sunday",           title: "Sunday Jazz Brunch",             category: "music",       subCategory: "concerts",    eventType: "solo-artists",   organizer: "Melody Café",               verified: false, date: "Sun, Apr 6",  time: "11:00 AM",venue: "Melody Café, Gulshan",         city: "dhaka",      price: 500,  priceLabel: "৳500",   rating: 4.4, reviewCount: 33,  attendees: 45,   capacity: 60,    spotsLeft: 15,   image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",  tags: ["Jazz", "Brunch"] },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER + PAGINATE
═══════════════════════════════════════════════════════════════ */
const getEvents = (level, categorySlug, subCategorySlug, eventTypeSlug, locationId) => {
  let pool = [...ALL_EVENTS];

  if (locationId && locationId !== "current") {
    pool = pool.filter((e) => e.city === locationId);
  }
  if (level === "category")    pool = pool.filter((e) => e.category === categorySlug);
  if (level === "subCategory") pool = pool.filter((e) => e.category === categorySlug && e.subCategory === subCategorySlug);
  if (level === "eventType")   pool = pool.filter((e) => e.category === categorySlug && e.subCategory === subCategorySlug && e.eventType === eventTypeSlug);

  return pool;
};

const getSectionTitle = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "All Events";
  if (level === "category")    return `All ${unslugify(categorySlug)} Events`;
  if (level === "subCategory") return `All ${unslugify(subCategorySlug)} Events`;
  if (level === "eventType")   return `All ${unslugify(eventTypeSlug)} Events`;
  return "All Events";
};

/* ═══════════════════════════════════════════════════════════════
   EVENT CARD — Grid view
═══════════════════════════════════════════════════════════════ */
const EventCardGrid = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-muted shrink-0">
        <img
          src={event.image} alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {/* Save */}
        <button
          onClick={(e) => { e.preventDefault(); onSave(event.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? <BookmarkCheck size={13} className="text-white" /> : <Bookmark size={13} className="text-white" />}
        </button>
        {/* Free badge */}
        {event.price === 0 && (
          <span
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-brand)" }}
          >
            Free
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
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

        {/* Title */}
        <h3
          className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:underline"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {event.title}
          {event.verified && <BadgeCheck size={11} className="inline ml-1 text-foreground" />}
        </h3>

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

        {/* Capacity */}
        <div className="h-0.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full"
            style={{ width: `${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div className="flex items-center gap-0.5">
            <Star size={11} className="text-foreground fill-foreground" />
            <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
            <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}> ({event.reviewCount})</span>
          </div>
          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {event.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EVENT CARD — List view
═══════════════════════════════════════════════════════════════ */
const EventCardList = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 rounded shrink-0 overflow-hidden bg-muted">
        <img
          src={event.image} alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {event.price === 0 && (
          <span
            className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-brand)" }}
          >Free</span>
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            <span className="flex items-center gap-1"><Calendar size={10} />{event.date} · {event.time}</span>
            <span className="flex items-center gap-1"><MapPin size={10} />{event.venue}</span>
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {event.tags.slice(0, 3).map((tag) => (
              <span key={tag}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--secondary)", fontFamily: "var(--font-sans)" }}
              >{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-foreground fill-foreground" />
              <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.rating}</span>
              <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>({event.reviewCount})</span>
            </div>
            <div className="w-12 h-0.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width: `${pct}%`, background: pct > 85 ? "var(--destructive)" : "var(--foreground)" }} />
            </div>
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{event.spotsLeft} left</span>
          </div>
          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {event.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════════════════════════ */
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (i === page - 2 || i === page + 2) {
      pages.push("...");
    }
  }
  // Deduplicate ellipsis
  const dedupedPages = pages.filter((p, i) => p !== "..." || pages[i - 1] !== "...");

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={14} />
      </button>

      {dedupedPages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium  "
            style={{
              background:   p === page ? "var(--foreground)" : "var(--background)",
              borderColor:  p === page ? "var(--foreground)" : "var(--border)",
              color:        p === page ? "var(--background)" : "var(--muted-foreground)",
              fontFamily:   "var(--font-sans)",
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ locationLabel, levelLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-dashed border-border text-center">
    <Inbox size={28} className="text-muted-foreground mb-3" />
    <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
      No {levelLabel} events found in {locationLabel}
    </p>
    <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      Try adjusting your filters or changing your location.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   EVENT GRID SECTION
═══════════════════════════════════════════════════════════════ */
const EventGridSection = ({ filters }) => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const [savedIds, setSavedIds]   = useState(new Set());
  const [viewMode, setViewMode]   = useState("grid"); // "grid" | "list"
  const [page, setPage]           = useState(1);

  const level         = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId    = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const levelLabel    = level === "root" ? "" : level === "category" ? unslugify(categorySlug) : level === "subCategory" ? unslugify(subCategorySlug) : unslugify(eventTypeSlug);

  // Get + filter events
  const allFiltered = useMemo(
    () => getEvents(level, categorySlug, subCategorySlug, eventTypeSlug, locationId),
    [level, categorySlug, subCategorySlug, eventTypeSlug, locationId]
  );

  const totalCount  = allFiltered.length;
  const totalPages  = Math.ceil(totalCount / EVENTS_PER_PAGE);
  const pageEvents  = allFiltered.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

  const sectionTitle = getSectionTitle(level, categorySlug, subCategorySlug, eventTypeSlug);

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-background" aria-label="All events grid">
      <Container>
        <div className="py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <div>
              <h2
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {sectionTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                <span className="font-semibold text-foreground">{totalCount}</span> events in {locationLabel}
              </p>
            </div>

            {/* View toggle */}
            <div
              className="flex items-center rounded-md border border-border overflow-hidden shrink-0"
            >
              <button
                onClick={() => setViewMode("grid")}
                className="flex items-center justify-center w-8 h-8  "
                style={{
                  background: viewMode === "grid" ? "var(--foreground)" : "var(--background)",
                  color:      viewMode === "grid" ? "var(--background)" : "var(--muted-foreground)",
                }}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center justify-center w-8 h-8  "
                style={{
                  background: viewMode === "list" ? "var(--foreground)" : "var(--background)",
                  color:      viewMode === "list" ? "var(--background)" : "var(--muted-foreground)",
                }}
                aria-label="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* Grid / List */}
          {pageEvents.length === 0 ? (
            <EmptyState locationLabel={locationLabel} levelLabel={levelLabel} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageEvents.map((event) => (
                <EventCardGrid
                  key={event.id}
                  event={event}
                  saved={savedIds.has(event.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pageEvents.map((event) => (
                <EventCardList
                  key={event.id}
                  event={event}
                  saved={savedIds.has(event.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

        </div>
      </Container>
    </section>
  );
};

export default EventGridSection;