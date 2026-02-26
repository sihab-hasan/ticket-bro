// frontend/src/pages/browse/sections/EditorsPicksSection.jsx
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
  Pencil,
  Quote,
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
   Each event has an editor note + editor name + avatar initial.
   In production: GET /api/events/editors-picks?category=music&sub=concerts&type=live-bands&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_EDITORS_PICKS = [
  {
    id: 501,
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
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    tags: ["Rock", "Stadium", "Must-See"],
    editorNote:
      "This is the biggest rock event Bangladesh has seen in years. The lineup alone justifies the ticket price — don't sleep on this one.",
    editorName: "Rafiq A.",
    editorInitial: "R",
  },
  {
    id: 502,
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
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    tags: ["Jazz", "Festival", "Culture"],
    editorNote:
      "A rare gem for jazz lovers in Dhaka. The ICCB grounds transform into something magical after sunset. Go with someone you love.",
    editorName: "Nadia K.",
    editorInitial: "N",
  },
  {
    id: 503,
    slug: "acoustic-cafe-sessions",
    title: "Acoustic Café Sessions Vol. 7",
    category: "music",
    subCategory: "concerts",
    eventType: "solo-artists",
    organizer: "Café Harmony",
    verified: false,
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
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80",
    tags: ["Acoustic", "Intimate", "Café"],
    editorNote:
      "If you've never been to an acoustic session in a dimly lit café, this is where you start. Intimate, soulful, and completely off the beaten path.",
    editorName: "Samira T.",
    editorInitial: "S",
  },
  {
    id: 504,
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
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    tags: ["Live Bands", "Competition"],
    editorNote:
      "Five bands, one stage, zero bad sets. The production team behind this event sets the bar for live music in South Asia.",
    editorName: "Imran H.",
    editorInitial: "I",
  },
  {
    id: 505,
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
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
    tags: ["Theatre", "Drama", "Arts"],
    editorNote:
      "A masterclass in Bangladeshi drama. The National Theatre never fails to deliver and this season's gala is their finest work yet.",
    editorName: "Priya D.",
    editorInitial: "P",
  },
  {
    id: 506,
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
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
    tags: ["Rock", "Festival", "Outdoor"],
    editorNote:
      "Worth the trip from Dhaka. Chittagong's stadium under the open sky with the city's best crowd — this is what live music should feel like.",
    editorName: "Rafiq A.",
    editorInitial: "R",
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getEditorsPicks = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
  locationId,
) => {
  let pool = [...ALL_EDITORS_PICKS];

  if (locationId && locationId !== "current") {
    pool = pool.filter((e) => e.city === locationId);
  }
  if (level === "root") return pool.slice(0, 4);
  if (level === "category")
    return pool.filter((e) => e.category === categorySlug).slice(0, 4);
  if (level === "subCategory")
    return pool
      .filter(
        (e) => e.category === categorySlug && e.subCategory === subCategorySlug,
      )
      .slice(0, 4);
  if (level === "eventType")
    return pool
      .filter(
        (e) =>
          e.category === categorySlug &&
          e.subCategory === subCategorySlug &&
          e.eventType === eventTypeSlug,
      )
      .slice(0, 4);
  return [];
};

const getSectionTitle = (
  level,
  categorySlug,
  subCategorySlug,
  eventTypeSlug,
) => {
  if (level === "root") return "Editor's Picks";
  if (level === "category")
    return `Editor's Picks in ${unslugify(categorySlug)}`;
  if (level === "subCategory")
    return `Editor's Picks — ${unslugify(subCategorySlug)}`;
  if (level === "eventType")
    return `Editor's Picks — ${unslugify(eventTypeSlug)}`;
  return "Editor's Picks";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root") return "";
  if (level === "category") return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   EDITORS PICK CARD
   Layout: large image top + editor note below (magazine style)
═══════════════════════════════════════════════════════════════ */
const EditorsPickCard = ({ event, saved, onSave }) => {
  const pct = spotsPercent(event.attendees, event.capacity);

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-muted shrink-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {/* Editor's Pick badge */}
        <div className="absolute top-2 left-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "var(--font-brand)",
            }}
          >
            <Pencil size={9} /> Editor's Pick
          </span>
        </div>
        {/* Save button */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2.5 flex-1">
        {/* Tags */}
        <div className="flex gap-1 flex-wrap">
          {event.tags.slice(0, 3).map((tag) => (
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

        {/* Editor note */}
        <div
          className="rounded-md p-2.5 border-l-2"
          style={{
            background: "var(--secondary)",
            borderLeftColor: "var(--foreground)",
          }}
        >
          <Quote size={11} className="text-muted-foreground mb-1" />
          <p
            className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 italic"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {event.editorNote}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
              style={{
                background: "var(--foreground)",
                color: "var(--background)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {event.editorInitial}
            </span>
            <span
              className="text-[10px] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {event.editorName}
            </span>
            <span
              className="text-[10px] text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              · Editor
            </span>
          </div>
        </div>

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
          <div className="flex items-center gap-0.5">
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
              {" "}
              ({event.reviewCount})
            </span>
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
    <Pencil size={24} className="text-muted-foreground mb-3" />
    <p
      className="text-sm font-semibold text-foreground mb-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      No editor's picks for {levelLabel} in {locationLabel} yet
    </p>
    <p
      className="text-xs text-muted-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Our editors are always curating — check back soon.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   EDITORS PICKS SECTION
═══════════════════════════════════════════════════════════════ */
const EditorsPicksSection = () => {
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

  const events = getEditorsPicks(
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
      aria-label="Editor's picks"
    >
      <Container>
        <div className="py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pencil size={16} className="text-foreground" />
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
                Hand-curated by our editorial team in {locationLabel}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map((event) => (
                <EditorsPickCard
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

export default EditorsPicksSection;
