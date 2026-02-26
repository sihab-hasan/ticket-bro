// frontend/src/pages/browse/sections/HeroSection.jsx
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  ChevronRight,
  SlidersHorizontal,
  Tag,
  LayoutGrid,
  Music,
  Dumbbell,
  Palette,
  UtensilsCrossed,
  Briefcase,
  GraduationCap,
  Heart,
  Cpu,
  Baby,
  Users,
  Layers,
  ChevronDown,
  Check,
  Locate,
  X,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useLocation, LOCATIONS } from "@/context/LocationContext";

/* ═══════════════════════════════════════════════════════════════
   CATEGORY CONFIG - Using theme colors only
═══════════════════════════════════════════════════════════════ */
const CATEGORY_MAP = {
  music: {
    label: "Music",
    icon: Music,
    description: "Live concerts, festivals, club nights and more.",
    totalEvents: 1284,
    cities: 48,
    thisWeek: 73,
    subcategories: [
      "Concerts",
      "Festivals",
      "Club Nights",
      "Live Bands",
      "Open Mic",
    ],
  },
  sports: {
    label: "Sports",
    icon: Dumbbell,
    description: "Football, cricket, tennis, and every sport in between.",
    totalEvents: 894,
    cities: 32,
    thisWeek: 51,
    subcategories: ["Football", "Cricket", "Tennis", "Basketball", "Athletics"],
  },
  "arts-culture": {
    label: "Arts & Culture",
    icon: Palette,
    description: "Theatre, exhibitions, film screenings, and performances.",
    totalEvents: 642,
    cities: 27,
    thisWeek: 38,
    subcategories: ["Theatre", "Exhibitions", "Film", "Dance", "Literature"],
  },
  "food-drink": {
    label: "Food & Drink",
    icon: UtensilsCrossed,
    description: "Pop-ups, tastings, dining events, and food festivals.",
    totalEvents: 431,
    cities: 19,
    thisWeek: 29,
    subcategories: ["Dining", "Tastings", "Pop-Up", "Street Food", "Wine"],
  },
  business: {
    label: "Business",
    icon: Briefcase,
    description: "Conferences, networking, expos, and workshops.",
    totalEvents: 318,
    cities: 22,
    thisWeek: 17,
    subcategories: [
      "Conferences",
      "Networking",
      "Workshops",
      "Seminars",
      "Expos",
    ],
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    description: "Lectures, courses, seminars, and bootcamps.",
    totalEvents: 276,
    cities: 18,
    thisWeek: 21,
    subcategories: [
      "Seminars",
      "Courses",
      "Workshops",
      "Lectures",
      "Boot Camps",
    ],
  },
  health: {
    label: "Health & Wellness",
    icon: Heart,
    description: "Yoga, meditation, fitness classes, and wellness retreats.",
    totalEvents: 509,
    cities: 30,
    thisWeek: 44,
    subcategories: [
      "Yoga",
      "Meditation",
      "Fitness",
      "Nutrition",
      "Mental Health",
    ],
  },
  technology: {
    label: "Technology",
    icon: Cpu,
    description: "Hackathons, meetups, AI events, and developer gatherings.",
    totalEvents: 387,
    cities: 24,
    thisWeek: 33,
    subcategories: ["Hackathons", "Meetups", "AI & ML", "Web Dev", "Startups"],
  },
  "kids-family": {
    label: "Kids & Family",
    icon: Baby,
    description: "Shows, activities, and experiences for the whole family.",
    totalEvents: 223,
    cities: 15,
    thisWeek: 19,
    subcategories: ["Shows", "Outdoor", "Indoor", "Workshops", "Storytelling"],
  },
  community: {
    label: "Community",
    icon: Users,
    description: "Charity runs, markets, volunteering, and local gatherings.",
    totalEvents: 194,
    cities: 21,
    thisWeek: 16,
    subcategories: [
      "Charity",
      "Markets",
      "Volunteering",
      "Fundraisers",
      "Local",
    ],
  },
};

const ALL_EVENTS = {
  label: "All Events",
  icon: Layers,
  description: "Explore thousands of events across every category and city.",
  totalEvents: 5442,
  cities: 60,
  thisWeek: 312,
  subcategories: [],
};

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

const toSlug = (str) => str.toLowerCase().replace(/[&\s]+/g, "-");

const getLevel = (categorySlug, subCategorySlug, eventTypeSlug) => {
  if (eventTypeSlug) return "eventType";
  if (subCategorySlug) return "subCategory";
  if (categorySlug) return "category";
  return "root";
};

/* ═══════════════════════════════════════════════════════════════
   INLINE LOCATION SELECTOR
═══════════════════════════════════════════════════════════════ */
const InlineLocationPicker = ({ selectedLocation, onLocationChange }) => {
  const [open, setOpen] = useState(false);
  const [locSearch, setLocSearch] = useState("");
  const ref = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setLocSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = LOCATIONS.filter(
    (l) =>
      l.label.toLowerCase().includes(locSearch.toLowerCase()) ||
      l.country.toLowerCase().includes(locSearch.toLowerCase()),
  );

  const handleDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(() => {
      onLocationChange({
        id: "current",
        label: "Current Location",
        country: "",
        flag: "📍",
      });
      setOpen(false);
    });
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      {/* Trigger inside search bar */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 h-full text-muted-foreground hover:text-primary transition-colors duration-200"
      >
        <MapPin size={13} className="text-primary shrink-0" />
        <span
          className="text-xs font-medium hidden sm:inline max-w-[80px] truncate"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {selectedLocation?.label || "Location"}
        </span>
        <ChevronDown
          size={11}
          className={`shrink-0 transition-all duration-200 ${
            open ? "rotate-180 text-primary" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-64 rounded-md border border-border bg-popover shadow-lg z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search city..."
                value={locSearch}
                onChange={(e) => setLocSearch(e.target.value)}
                className="w-full pl-7 pr-7 py-1.5 text-xs bg-muted rounded outline-none text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary transition-all"
              />
              {locSearch && (
                <button
                  type="button"
                  onClick={() => setLocSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Detect */}
          <div className="px-1 pt-1 border-b border-border pb-1">
            <button
              type="button"
              onClick={handleDetect}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs hover:bg-primary/10 hover:text-primary transition-colors text-left group"
            >
              <Locate size={12} className="text-primary shrink-0" />
              <span className="font-medium text-foreground group-hover:text-primary">
                Use my current location
              </span>
            </button>
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto p-1">
            {!locSearch && (
              <p className="text-[10px] font-semibold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                Popular Cities
              </p>
            )}
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                No results
              </p>
            ) : (
              filtered.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onLocationChange(loc);
                    setOpen(false);
                    setLocSearch("");
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs hover:bg-primary/10 transition-colors text-left group"
                >
                  <span className="text-sm leading-none shrink-0">
                    {loc.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary leading-none">
                      {loc.label}
                    </p>
                    {loc.country && (
                      <p className="text-[10px] text-muted-foreground group-hover:text-primary/70 mt-0.5">
                        {loc.country}
                      </p>
                    )}
                  </div>
                  {selectedLocation?.id === loc.id && (
                    <Check size={12} className="text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STAT CARD - Using theme colors
═══════════════════════════════════════════════════════════════ */
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-secondary/5 hover:bg-secondary/10 transition-all duration-200 hover:border-primary/30 group">
    <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
      <Icon size={13} strokeWidth={2} />
    </span>
    <div>
      <p
        className="text-sm font-bold leading-none text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground group-hover:text-primary/80 mt-0.5 leading-none transition-colors">
        {label}
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CRUMB HELPERS
═══════════════════════════════════════════════════════════════ */
const CrumbLink = ({ to, children }) => (
  <>
    <Link
      to={to}
      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-xs whitespace-nowrap"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {children}
    </Link>
    <ChevronRight size={10} className="text-muted-foreground/40 shrink-0" />
  </>
);

const CrumbCurrent = ({ children }) => (
  <span
    className="text-foreground font-semibold text-xs truncate max-w-[200px]"
    style={{ fontFamily: "var(--font-sans)" }}
  >
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION - Single theme color throughout
═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const navigate = useNavigate();

  // ── Location from global context ──────────
  const { selectedLocation, changeLocation } = useLocation();

  // ── Category config ───────────────────────
  const config = CATEGORY_MAP[categorySlug] || ALL_EVENTS;
  const Icon = config.icon;
  const level = getLevel(categorySlug, subCategorySlug, eventTypeSlug);

  // Result count
  const totalCount =
    level === "root" || level === "category"
      ? config.totalEvents
      : level === "subCategory"
        ? Math.round(
            config.totalEvents / Math.max(config.subcategories.length, 1),
          )
        : Math.round(
            config.totalEvents / Math.max(config.subcategories.length, 1) / 3,
          );

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const params = new URLSearchParams({
      q: search,
      location: selectedLocation?.id || "",
      ...(categorySlug && { category: categorySlug }),
      ...(subCategorySlug && { sub: subCategorySlug }),
      ...(eventTypeSlug && { type: eventTypeSlug }),
    });
    navigate(`/search/results?${params.toString()}`);
  };

  /* ── Location-aware copy ─────────────────── */
  const locationLabel = selectedLocation?.label || "your city";
  const locationFlag = selectedLocation?.flag || "📍";

  const description =
    level === "root"
      ? `Discover thousands of events happening in ${locationLabel} and beyond.`
      : level === "category"
        ? `${config.description} Events near ${locationLabel}.`
        : level === "subCategory"
          ? `Explore all ${unslugify(subCategorySlug)} events in ${locationLabel}.`
          : `All ${unslugify(eventTypeSlug)} events in ${unslugify(subCategorySlug)}, ${locationLabel}.`;

  /* ── Title ───────────────────────────────── */
  const titleNode = (() => {
    if (level === "root")
      return (
        <h1
          className="text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-tight text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Find Your Next
          <br />
          <span className="border-b-3 border-primary pb-0.5 inline">
            Experience
          </span>
        </h1>
      );
    if (level === "category")
      return (
        <h1
          className="text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-tight text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Browse{" "}
          <span className="border-b-3 border-primary pb-0.5 inline">
            {config.label}
          </span>
          <br />
          Events
        </h1>
      );
    if (level === "subCategory")
      return (
        <h1
          className="text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-tight text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="border-b-3 border-primary pb-0.5 inline">
            {unslugify(subCategorySlug)}
          </span>
          <br />
          <span className="text-muted-foreground font-semibold text-2xl sm:text-3xl">
            in {config.label}
          </span>
        </h1>
      );
    return (
      <h1
        className="text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-tight text-foreground mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="border-b-3 border-primary pb-0.5 inline">
          {unslugify(eventTypeSlug)}
        </span>
        <br />
        <span className="text-muted-foreground font-semibold text-xl sm:text-2xl">
          {unslugify(subCategorySlug)} &middot; {config.label}
        </span>
      </h1>
    );
  })();

  /* ── Badge label ─────────────────────────── */
  const badgeLabel = {
    root: "All Categories",
    category: "Category",
    subCategory: "Subcategory",
    eventType: "Event Type",
  }[level];

  /* ── Quick chips ─────────────────────────── */
  const chipNodes = (() => {
    if (level === "root") {
      return Object.entries(CATEGORY_MAP)
        .slice(0, 8)
        .map(([slug, cat]) => (
          <Link
            key={slug}
            to={`/browse/${slug}`}
            className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 whitespace-nowrap"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {cat.label}
          </Link>
        ));
    }
    if (level === "category") {
      return config.subcategories.map((child) => (
        <Link
          key={child}
          to={`/browse/${categorySlug}/${toSlug(child)}`}
          className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 whitespace-nowrap"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {child}
        </Link>
      ));
    }
    return config.subcategories.map((child) => (
      <button
        key={child}
        onClick={() => setActiveTag(activeTag === child ? null : child)}
        className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap ${
          activeTag === child
            ? "bg-primary/10 border-primary/30 text-primary"
            : "border-border bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
        }`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {child}
      </button>
    ));
  })();

  /* ── Stat cards ──────────────────────────── */
  const statCards = [
    {
      icon: Layers,
      value: totalCount.toLocaleString() + "+",
      label: `Events in ${locationLabel}`,
    },
    {
      icon: MapPin,
      value: selectedLocation?.flag
        ? `${locationFlag} ${locationLabel}`
        : locationLabel,
      label: "Current City",
    },
    { icon: Calendar, value: config.thisWeek, label: "This Week" },
    {
      icon: Tag,
      value: config.subcategories.length || "All",
      label:
        level === "category"
          ? "Subcategories"
          : level === "root"
            ? "Categories"
            : "Types",
    },
  ];

  return (
    <section
      className="w-full bg-background"
      aria-label={`${config.label} hero`}
    >
      {/* Hero body */}
      <Container aria-label="Hero content">
        <div className="py-4">
          {/* Breadcrumb */}
          <div className="mb-6" aria-label="Breadcrumb">
            <nav
              className="flex items-center gap-1.5 flex-wrap"
              aria-label="Breadcrumb"
            >
              <CrumbLink to="/">Home</CrumbLink>
              {level === "root" ? (
                <CrumbCurrent>Browse</CrumbCurrent>
              ) : (
                <CrumbLink to="/browse">Browse</CrumbLink>
              )}
              {categorySlug &&
                level !== "root" &&
                (level === "category" ? (
                  <CrumbCurrent>{config.label}</CrumbCurrent>
                ) : (
                  <CrumbLink to={`/browse/${categorySlug}`}>
                    {config.label}
                  </CrumbLink>
                ))}
              {subCategorySlug &&
                (level === "subCategory" ? (
                  <CrumbCurrent>{unslugify(subCategorySlug)}</CrumbCurrent>
                ) : (
                  <CrumbLink to={`/browse/${categorySlug}/${subCategorySlug}`}>
                    {unslugify(subCategorySlug)}
                  </CrumbLink>
                ))}
              {eventTypeSlug && (
                <CrumbCurrent>{unslugify(eventTypeSlug)}</CrumbCurrent>
              )}
            </nav>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
            {/* LEFT */}
            <div className="flex-1 min-w-0">
              {/* Badge row */}
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase text-primary"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  {config.label}
                </span>
                {level !== "root" && level !== "category" && (
                  <>
                    <span className="text-muted-foreground/40 text-[10px]">
                      /
                    </span>
                    <span
                      className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground"
                      style={{ fontFamily: "var(--font-brand)" }}
                    >
                      {badgeLabel}
                    </span>
                  </>
                )}

                {/* Location pill */}
                <div
                  className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-1 bg-background/50 backdrop-blur-sm"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <span>{locationFlag}</span>
                  <span className="font-medium text-foreground">
                    {locationLabel}
                  </span>
                </div>
              </div>

              {/* Title */}
              {titleNode}

              {/* Description */}
              <p
                className="text-sm text-muted-foreground mb-7 max-w-md leading-relaxed"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {description}
              </p>

              {/* Quick chips */}
              {chipNodes.length > 0 && (
                <div className="flex flex-wrap gap-2">{chipNodes}</div>
              )}
            </div>

            {/* RIGHT — Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-[220px] shrink-0">
              {statCards.map((s) => (
                <StatCard
                  key={s.label}
                  icon={s.icon}
                  value={s.value}
                  label={s.label}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Accent bar - using primary color */}
        <div className="w-full h-[3px] bg-primary/60" />
      </Container>
    </section>
  );
};

export default HeroSection;
