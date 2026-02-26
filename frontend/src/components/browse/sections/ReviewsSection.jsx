// frontend/src/pages/browse/sections/ReviewsSection.jsx
//
// Shows recent attendee reviews for events in the current browse level + location.
// In production: GET /api/reviews?category=music&sub=concerts&type=live-bands&location=dhaka&limit=6
//
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight, Star, BadgeCheck,
  ThumbsUp, MessageSquare, Quote,
  ChevronLeft,
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

const timeAgo = (iso) => {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)   return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30)  return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
};

/* ═══════════════════════════════════════════════════════════════
   STAR ROW
═══════════════════════════════════════════════════════════════ */
const StarRow = ({ rating, size = 11 }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={rating >= i ? "text-foreground fill-foreground" : "text-border"}
      />
    ))}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   MOCK REVIEWS POOL
   Each review links back to its event via eventSlug.
   In production: GET /api/reviews?category=music&location=dhaka
═══════════════════════════════════════════════════════════════ */
const ALL_REVIEWS = [
  {
    id: 1,
    eventSlug: "rock-arena-2025",
    eventTitle: "Rock Arena Bangladesh 2025",
    eventImage: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&q=80",
    eventCategory: "music", eventSubCategory: "concerts", eventEventType: "live-bands",
    city: "dhaka",
    rating: 5,
    title: "Best concert I've ever attended in Bangladesh!",
    body: "The sound system was world-class and the energy in the crowd was absolutely electric. Every band brought something unique to the stage. I was blown away from start to finish — already counting down to the next one.",
    author: "Rafiq A.",
    authorInitial: "R",
    verified: true,
    helpful: 47,
    createdAt: "2025-03-01T10:00:00Z",
  },
  {
    id: 2,
    eventSlug: "dhaka-jazz-festival-2025",
    eventTitle: "Dhaka Jazz Festival 2025",
    eventImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&q=80",
    eventCategory: "music", eventSubCategory: "festivals", eventEventType: "multi-day",
    city: "dhaka",
    rating: 5,
    title: "A magical evening at ICCB",
    body: "I didn't expect to enjoy jazz this much but the atmosphere completely transformed me. The ICCB grounds at night are breathtaking and the performers were phenomenal. Will bring the whole family next year.",
    author: "Nadia K.",
    authorInitial: "N",
    verified: true,
    helpful: 34,
    createdAt: "2025-02-28T14:30:00Z",
  },
  {
    id: 3,
    eventSlug: "acoustic-cafe-sessions",
    eventTitle: "Acoustic Café Sessions Vol. 7",
    eventImage: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=300&q=80",
    eventCategory: "music", eventSubCategory: "concerts", eventEventType: "solo-artists",
    city: "dhaka",
    rating: 4,
    title: "Intimate and soulful — worth every taka",
    body: "Small venue, big talent. The performer connected with the audience in a way you just don't get at large events. The café vibes added so much. Only downside was limited seating — book early!",
    author: "Samira T.",
    authorInitial: "S",
    verified: false,
    helpful: 21,
    createdAt: "2025-02-26T19:00:00Z",
  },
  {
    id: 4,
    eventSlug: "live-bands-showdown",
    eventTitle: "Live Bands Showdown 2025",
    eventImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&q=80",
    eventCategory: "music", eventSubCategory: "concerts", eventEventType: "live-bands",
    city: "dhaka",
    rating: 5,
    title: "Production quality was insane",
    body: "The lighting rig alone was worth the ticket price. Five bands and zero bad performances — that's almost unheard of. The organisers clearly put enormous effort into curating the lineup. Already bought tickets for next year.",
    author: "Imran H.",
    authorInitial: "I",
    verified: true,
    helpful: 39,
    createdAt: "2025-02-25T21:00:00Z",
  },
  {
    id: 5,
    eventSlug: "dhaka-theatre-gala",
    eventTitle: "Dhaka Theatre Gala Night",
    eventImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=300&q=80",
    eventCategory: "arts-culture", eventSubCategory: "theatre", eventEventType: "drama",
    city: "dhaka",
    rating: 5,
    title: "Theatre at its absolute finest",
    body: "The National Theatre never disappoints but this was their best season yet. The direction was sharp, the acting was moving, and the production design was simply stunning. A must-see for anyone who loves Bangladeshi culture.",
    author: "Priya D.",
    authorInitial: "P",
    verified: true,
    helpful: 28,
    createdAt: "2025-02-24T18:30:00Z",
  },
  {
    id: 6,
    eventSlug: "live-bands-battle",
    eventTitle: "Live Bands Battle Night",
    eventImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&q=80",
    eventCategory: "music", eventSubCategory: "concerts", eventEventType: "live-bands",
    city: "dhaka",
    rating: 4,
    title: "Incredible energy, solid lineup",
    body: "The battle format keeps things exciting — you're never quite sure who will win and that tension makes every performance feel high stakes. The crowd was passionate. Minor sound issues early on but resolved quickly.",
    author: "Karim B.",
    authorInitial: "K",
    verified: false,
    helpful: 19,
    createdAt: "2025-02-23T20:00:00Z",
  },
  {
    id: 7,
    eventSlug: "open-mic-friday",
    eventTitle: "Friday Open Mic Dhaka",
    eventImage: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&q=80",
    eventCategory: "music", eventSubCategory: "open-mic", eventEventType: "music",
    city: "dhaka",
    rating: 4,
    title: "Hidden gem in Dhanmondi",
    body: "Free entry and genuinely talented performers — this is what Dhaka's grassroots music scene looks like. Some acts were rough around the edges but that's the charm of open mic nights. Great community vibe.",
    author: "Maliha R.",
    authorInitial: "M",
    verified: false,
    helpful: 14,
    createdAt: "2025-02-22T21:30:00Z",
  },
  {
    id: 8,
    eventSlug: "chittagong-rock-fest",
    eventTitle: "Chittagong Rock Fest 2025",
    eventImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=300&q=80",
    eventCategory: "music", eventSubCategory: "festivals", eventEventType: "outdoor",
    city: "chittagong",
    rating: 5,
    title: "Worth the trip from Dhaka — seriously",
    body: "We drove up from Dhaka specifically for this and it was completely worth it. The outdoor stadium setting under the open sky creates an atmosphere you simply can't replicate indoors. CTG knows how to host a rock festival.",
    author: "Tanvir S.",
    authorInitial: "T",
    verified: true,
    helpful: 52,
    createdAt: "2025-02-21T17:00:00Z",
  },
];

/* ═══════════════════════════════════════════════════════════════
   FILTER BY ROUTE LEVEL + LOCATION
═══════════════════════════════════════════════════════════════ */
const getReviews = (level, categorySlug, subCategorySlug, eventTypeSlug, locationId) => {
  let pool = [...ALL_REVIEWS].sort((a, b) => b.helpful - a.helpful);

  if (locationId && locationId !== "current") {
    pool = pool.filter((r) => r.city === locationId);
  }
  if (level === "root")        return pool.slice(0, 6);
  if (level === "category")    return pool.filter((r) => r.eventCategory === categorySlug).slice(0, 6);
  if (level === "subCategory") return pool.filter((r) => r.eventCategory === categorySlug && r.eventSubCategory === subCategorySlug).slice(0, 6);
  if (level === "eventType")   return pool.filter((r) => r.eventCategory === categorySlug && r.eventSubCategory === subCategorySlug && r.eventEventType === eventTypeSlug).slice(0, 6);
  return [];
};

/* ═══════════════════════════════════════════════════════════════
   AGGREGATE RATING STATS from filtered reviews
═══════════════════════════════════════════════════════════════ */
const getStats = (reviews) => {
  if (!reviews.length) return null;
  const avg  = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:   Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
  }));
  return { avg: avg.toFixed(1), total: reviews.length, dist };
};

const getSectionTitle = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "What Attendees Are Saying";
  if (level === "category")    return `${unslugify(categorySlug)} Reviews`;
  if (level === "subCategory") return `${unslugify(subCategorySlug)} Reviews`;
  if (level === "eventType")   return `${unslugify(eventTypeSlug)} Reviews`;
  return "What Attendees Are Saying";
};

const getLevelLabel = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "";
  if (level === "category")    return unslugify(categorySlug);
  if (level === "subCategory") return unslugify(subCategorySlug);
  return unslugify(eventTypeSlug);
};

/* ═══════════════════════════════════════════════════════════════
   RATING SUMMARY PANEL
═══════════════════════════════════════════════════════════════ */
const RatingSummary = ({ stats }) => (
  <div
    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-border mb-6"
    style={{ background: "var(--card)" }}
  >
    {/* Big avg */}
    <div className="flex flex-col items-center shrink-0 pr-4 border-r border-border">
      <span
        className="text-5xl font-extrabold text-foreground leading-none"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {stats.avg}
      </span>
      <StarRow rating={parseFloat(stats.avg)} size={13} />
      <span className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "var(--font-sans)" }}>
        {stats.total} review{stats.total !== 1 ? "s" : ""}
      </span>
    </div>

    {/* Distribution bars */}
    <div className="flex-1 w-full flex flex-col gap-1.5">
      {stats.dist.map(({ star, count, pct }) => (
        <div key={star} className="flex items-center gap-2">
          <span
            className="text-[11px] text-muted-foreground w-4 shrink-0 text-right"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {star}
          </span>
          <Star size={10} className="text-foreground fill-foreground shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: "var(--foreground)" }}
            />
          </div>
          <span
            className="text-[10px] text-muted-foreground w-6 shrink-0"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   REVIEW CARD
═══════════════════════════════════════════════════════════════ */
const ReviewCard = ({ review, helpful, onHelpful }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > 180;

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg border border-border"
      style={{ background: "var(--card)" }}
    >
      {/* Event reference */}
      <Link
        to={`/browse/${review.eventSlug}`}
        className="flex items-center gap-2 group"
      >
        <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-muted">
          <img
            src={review.eventImage} alt={review.eventTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <p
          className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {review.eventTitle}
        </p>
      </Link>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Reviewer + rating */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0"
            style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-heading)" }}
          >
            {review.authorInitial}
          </span>
          <div>
            <div className="flex items-center gap-1">
              <p
                className="text-xs font-semibold text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {review.author}
              </p>
              {review.verified && (
                <BadgeCheck size={11} className="text-foreground shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>
        <StarRow rating={review.rating} size={11} />
      </div>

      {/* Review title */}
      <p
        className="text-sm font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {review.title}
      </p>

      {/* Review body */}
      <div className="relative">
        <Quote size={14} className="text-muted-foreground mb-1 opacity-40" />
        <p
          className="text-xs text-muted-foreground leading-relaxed"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isLong && !expanded
            ? `${review.body.slice(0, 180)}…`
            : review.body}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-[11px] font-semibold text-foreground hover:underline mt-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Helpful */}
      <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
        <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
          Was this helpful?
        </span>
        <button
          onClick={() => onHelpful(review.id)}
          className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
          style={{
            color:      helpful ? "var(--foreground)" : "var(--muted-foreground)",
            fontFamily: "var(--font-sans)",
          }}
        >
          <ThumbsUp size={11} className={helpful ? "fill-foreground" : ""} />
          {review.helpful + (helpful ? 1 : 0)}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ locationLabel, levelLabel }) => (
  <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border text-center">
    <MessageSquare size={24} className="text-muted-foreground mb-3" />
    <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
      No {levelLabel} reviews in {locationLabel} yet
    </p>
    <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      Attend an event and be the first to share your experience.
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   REVIEWS SECTION
═══════════════════════════════════════════════════════════════ */
const ReviewsSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const [helpfulIds, setHelpfulIds] = useState(new Set());
  const [page, setPage]             = useState(0); // for "load more"

  const PER_PAGE = 6;

  const level         = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId    = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";
  const levelLabel    = getLevelLabel(level, categorySlug, subCategorySlug, eventTypeSlug);

  const allReviews   = getReviews(level, categorySlug, subCategorySlug, eventTypeSlug, locationId);
  const visibleCount = PER_PAGE + page * PER_PAGE;
  const reviews      = allReviews.slice(0, visibleCount);
  const hasMore      = visibleCount < allReviews.length;

  const stats        = getStats(allReviews);
  const sectionTitle = getSectionTitle(level, categorySlug, subCategorySlug, eventTypeSlug);

  const toggleHelpful = (id) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const viewAllTo =
    level === "root"          ? "/browse"
    : level === "category"    ? `/browse/${categorySlug}`
    : level === "subCategory" ? `/browse/${categorySlug}/${subCategorySlug}`
    : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  return (
    <section className="w-full bg-background" aria-label="Event reviews">
      <Container>
        <div className="py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={16} className="text-foreground" />
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sectionTitle}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                Real reviews from verified attendees in {locationLabel}
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
          {allReviews.length === 0 ? (
            <EmptyState locationLabel={locationLabel} levelLabel={levelLabel} />
          ) : (
            <>
              {/* Rating summary */}
              {stats && <RatingSummary stats={stats} />}

              {/* Review grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    helpful={helpfulIds.has(review.id)}
                    onHelpful={toggleHelpful}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-2 h-9 px-5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Load more reviews
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </Container>
    </section>
  );
};

export default ReviewsSection;