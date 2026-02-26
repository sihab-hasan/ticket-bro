// frontend/src/pages/browse/sections/StatsSection.jsx
//
// Shows platform-level stats scoped to the current browse level + location.
// In production: GET /api/stats?category=music&sub=concerts&type=live-bands&location=dhaka
//
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight, Calendar, Users, Ticket,
  Star, MapPin, TrendingUp, BadgeCheck,
  Music, Building2, Globe,
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

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   Counts up from 0 to target when the element enters the viewport.
═══════════════════════════════════════════════════════════════ */
const useCountUp = (target, duration = 1600, decimals = 0) => {
  const [value, setValue]   = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration, decimals]);

  return { value, ref };
};

/* ═══════════════════════════════════════════════════════════════
   FORMAT LARGE NUMBERS
   12500 → "12.5k", 1200000 → "1.2M"
═══════════════════════════════════════════════════════════════ */
const formatNum = (n, decimals = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(decimals === 0 ? 1 : decimals)}k`;
  return n.toLocaleString();
};

/* ═══════════════════════════════════════════════════════════════
   MOCK STATS POOL
   Scoped per level + location.
   In production: GET /api/stats?category=music&location=dhaka
═══════════════════════════════════════════════════════════════ */
const STATS_DATA = {
  root: {
    dhaka: {
      totalEvents:    1240,
      totalAttendees: 284000,
      totalOrganizers: 318,
      avgRating:      4.7,
      citiesCovered:  7,
      ticketsSold:    96000,
      topCategory:    "Music",
      upcomingToday:  23,
    },
    chittagong: {
      totalEvents:    410,
      totalAttendees: 87000,
      totalOrganizers: 94,
      avgRating:      4.6,
      citiesCovered:  1,
      ticketsSold:    31000,
      topCategory:    "Music",
      upcomingToday:  8,
    },
    sylhet: {
      totalEvents:    190,
      totalAttendees: 41000,
      totalOrganizers: 47,
      avgRating:      4.5,
      citiesCovered:  1,
      ticketsSold:    14000,
      topCategory:    "Arts & Culture",
      upcomingToday:  4,
    },
    _default: {
      totalEvents:    280,
      totalAttendees: 58000,
      totalOrganizers: 62,
      avgRating:      4.5,
      citiesCovered:  1,
      ticketsSold:    19000,
      topCategory:    "Music",
      upcomingToday:  6,
    },
  },
  music: {
    dhaka: {
      totalEvents:    540,
      totalAttendees: 128000,
      totalOrganizers: 142,
      avgRating:      4.8,
      citiesCovered:  7,
      ticketsSold:    46000,
      topCategory:    "Concerts",
      upcomingToday:  11,
    },
    _default: {
      totalEvents:    120,
      totalAttendees: 29000,
      totalOrganizers: 34,
      avgRating:      4.7,
      citiesCovered:  1,
      ticketsSold:    10000,
      topCategory:    "Concerts",
      upcomingToday:  3,
    },
  },
  concerts: {
    dhaka: {
      totalEvents:    210,
      totalAttendees: 54000,
      totalOrganizers: 76,
      avgRating:      4.8,
      citiesCovered:  7,
      ticketsSold:    20000,
      topCategory:    "Live Bands",
      upcomingToday:  5,
    },
    _default: {
      totalEvents:    48,
      totalAttendees: 11000,
      totalOrganizers: 18,
      avgRating:      4.7,
      citiesCovered:  1,
      ticketsSold:    4000,
      topCategory:    "Live Bands",
      upcomingToday:  2,
    },
  },
  "live-bands": {
    dhaka: {
      totalEvents:    84,
      totalAttendees: 21000,
      totalOrganizers: 31,
      avgRating:      4.9,
      citiesCovered:  7,
      ticketsSold:    8000,
      topCategory:    "Live Bands",
      upcomingToday:  2,
    },
    _default: {
      totalEvents:    18,
      totalAttendees: 4200,
      totalOrganizers: 9,
      avgRating:      4.8,
      citiesCovered:  1,
      ticketsSold:    1500,
      topCategory:    "Live Bands",
      upcomingToday:  1,
    },
  },
};

const getStats = (level, categorySlug, subCategorySlug, eventTypeSlug, locationId) => {
  const levelKey =
    level === "root"          ? "root"
    : level === "category"    ? categorySlug
    : level === "subCategory" ? subCategorySlug
    : eventTypeSlug;

  const bucket = STATS_DATA[levelKey] || STATS_DATA["root"];
  return bucket[locationId] || bucket["_default"] || STATS_DATA["root"]["_default"];
};

const getSectionTitle = (level, categorySlug, subCategorySlug, eventTypeSlug) => {
  if (level === "root")        return "TicketBro by the Numbers";
  if (level === "category")    return `${unslugify(categorySlug)} in Numbers`;
  if (level === "subCategory") return `${unslugify(subCategorySlug)} in Numbers`;
  if (level === "eventType")   return `${unslugify(eventTypeSlug)} in Numbers`;
  return "TicketBro by the Numbers";
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED STAT CARD
═══════════════════════════════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, rawValue, suffix = "", prefix = "", decimals = 0, highlight = false, sublabel }) => {
  const { value, ref } = useCountUp(rawValue, 1600, decimals);

  const displayValue = rawValue >= 1000
    ? formatNum(value, decimals)
    : decimals > 0
      ? value.toFixed(decimals)
      : Math.floor(value).toLocaleString();

  return (
    <div
      ref={ref}
      className="flex flex-col gap-3 p-5 rounded-lg border border-border"
      style={{ background: highlight ? "var(--foreground)" : "var(--card)" }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{
          background: highlight ? "rgba(255,255,255,0.15)" : "var(--secondary)",
        }}
      >
        <Icon
          size={17}
          style={{ color: highlight ? "var(--background)" : "var(--foreground)" }}
        />
      </div>

      {/* Value */}
      <div>
        <p
          className="text-3xl font-extrabold leading-none"
          style={{
            fontFamily: "var(--font-heading)",
            color: highlight ? "var(--background)" : "var(--foreground)",
          }}
        >
          {prefix}{displayValue}{suffix}
        </p>
        {sublabel && (
          <p
            className="text-xs mt-0.5"
            style={{
              fontFamily: "var(--font-sans)",
              color: highlight ? "rgba(255,255,255,0.6)" : "var(--muted-foreground)",
            }}
          >
            {sublabel}
          </p>
        )}
      </div>

      {/* Label */}
      <p
        className="text-sm font-medium mt-auto"
        style={{
          fontFamily: "var(--font-sans)",
          color: highlight ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)",
        }}
      >
        {label}
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TOP CATEGORY BADGE (non-animated highlight card)
═══════════════════════════════════════════════════════════════ */
const TopCategoryCard = ({ label, value, locationLabel }) => (
  <div
    className="flex flex-col gap-3 p-5 rounded-lg border border-border"
    style={{ background: "var(--card)" }}
  >
    <div
      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
      style={{ background: "var(--secondary)" }}
    >
      <TrendingUp size={17} className="text-foreground" />
    </div>
    <div>
      <p
        className="text-3xl font-extrabold text-foreground leading-none"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
        in {locationLabel}
      </p>
    </div>
    <p className="text-sm font-medium text-muted-foreground mt-auto" style={{ fontFamily: "var(--font-sans)" }}>
      {label}
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STATS SECTION
═══════════════════════════════════════════════════════════════ */
const StatsSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const level         = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId    = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";

  const stats        = getStats(level, categorySlug, subCategorySlug, eventTypeSlug, locationId);
  const sectionTitle = getSectionTitle(level, categorySlug, subCategorySlug, eventTypeSlug);

  const viewAllTo =
    level === "root"          ? "/browse"
    : level === "category"    ? `/browse/${categorySlug}`
    : level === "subCategory" ? `/browse/${categorySlug}/${subCategorySlug}`
    : `/browse/${categorySlug}/${subCategorySlug}/${eventTypeSlug}`;

  return (
    <section className="w-full bg-background" aria-label="Platform statistics">
      <Container>
        <div className="py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-foreground" />
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sectionTitle}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                Live platform stats for {locationLabel}
              </p>
            </div>
            <Link
              to={viewAllTo}
              className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline shrink-0 ml-4"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Explore all <ChevronRight size={13} />
            </Link>
          </div>

          {/* Stat cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

            {/* Total events — highlighted */}
            <StatCard
              icon={Calendar}
              label="Events listed"
              rawValue={stats.totalEvents}
              highlight={true}
            />

            <StatCard
              icon={Users}
              label="Total attendees"
              rawValue={stats.totalAttendees}
            />

            <StatCard
              icon={Ticket}
              label="Tickets sold"
              rawValue={stats.ticketsSold}
            />

            <StatCard
              icon={Star}
              label="Average rating"
              rawValue={stats.avgRating}
              suffix=" / 5"
              decimals={1}
              sublabel="Based on verified reviews"
            />

            <StatCard
              icon={Building2}
              label="Event organisers"
              rawValue={stats.totalOrganizers}
            />

            <StatCard
              icon={MapPin}
              label="Cities covered"
              rawValue={stats.citiesCovered}
            />

            <StatCard
              icon={BadgeCheck}
              label="Events happening today"
              rawValue={stats.upcomingToday}
              sublabel="In your selected city"
            />

            {/* Top category — static */}
            <TopCategoryCard
              label="Most popular category"
              value={stats.topCategory}
              locationLabel={locationLabel}
            />

          </div>

        </div>
      </Container>
    </section>
  );
};

export default StatsSection;