// frontend/src/pages/browse/sections/CategoryNavSection.jsx
import React, { useRef, useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";

/* ═══════════════════════════════════════════════════════════════
   DATA
   In production replace with API response keyed by slug.
   Structure mirrors your route: /browse/:categorySlug/:subCategorySlug/:eventTypeSlug
═══════════════════════════════════════════════════════════════ */
const CATEGORY_MAP = {
  music: {
    label: "Music",
    subcategories: [
      { slug: "concerts",   label: "Concerts",    eventTypes: ["Live Bands", "Solo Artists", "Orchestra", "Open Mic"] },
      { slug: "festivals",  label: "Festivals",   eventTypes: ["Multi-Day", "Outdoor", "Indoor", "Virtual"] },
      { slug: "club-nights",label: "Club Nights", eventTypes: ["DJ Sets", "Theme Nights", "Rave"] },
      { slug: "live-bands", label: "Live Bands",  eventTypes: ["Rock", "Jazz", "Blues", "Folk"] },
      { slug: "open-mic",   label: "Open Mic",    eventTypes: ["Comedy", "Poetry", "Music"] },
    ],
  },
  sports: {
    label: "Sports",
    subcategories: [
      { slug: "football",   label: "Football",   eventTypes: ["League Matches", "Cup Games", "Friendlies"] },
      { slug: "cricket",    label: "Cricket",    eventTypes: ["T20", "ODI", "Test"] },
      { slug: "tennis",     label: "Tennis",     eventTypes: ["Singles", "Doubles", "Tournament"] },
      { slug: "basketball", label: "Basketball", eventTypes: ["NBL", "Street Ball", "3x3"] },
      { slug: "athletics",  label: "Athletics",  eventTypes: ["Sprint", "Marathon", "Field Events"] },
    ],
  },
  "arts-culture": {
    label: "Arts & Culture",
    subcategories: [
      { slug: "theatre",     label: "Theatre",     eventTypes: ["Drama", "Musical", "Comedy", "Improv"] },
      { slug: "exhibitions", label: "Exhibitions", eventTypes: ["Art Galleries", "Photography", "Sculpture"] },
      { slug: "film",        label: "Film",        eventTypes: ["Screenings", "Premieres", "Film Festival"] },
      { slug: "dance",       label: "Dance",       eventTypes: ["Ballet", "Contemporary", "Salsa"] },
      { slug: "literature",  label: "Literature",  eventTypes: ["Book Club", "Author Talk", "Poetry"] },
    ],
  },
  "food-drink": {
    label: "Food & Drink",
    subcategories: [
      { slug: "dining",      label: "Dining",      eventTypes: ["Pop-Up", "Fine Dining", "Tasting Menu"] },
      { slug: "tastings",    label: "Tastings",    eventTypes: ["Wine", "Craft Beer", "Spirits", "Tea"] },
      { slug: "pop-up",      label: "Pop-Up",      eventTypes: ["Street Food", "Night Market", "Brunch"] },
      { slug: "street-food", label: "Street Food", eventTypes: ["Hawker", "BBQ", "Vegan"] },
      { slug: "wine",        label: "Wine",        eventTypes: ["Masterclass", "Pairing", "Tour"] },
    ],
  },
  business: {
    label: "Business",
    subcategories: [
      { slug: "conferences", label: "Conferences", eventTypes: ["Tech", "Marketing", "Finance", "HR"] },
      { slug: "networking",  label: "Networking",  eventTypes: ["Speed Networking", "Mixers", "Roundtables"] },
      { slug: "workshops",   label: "Workshops",   eventTypes: ["Leadership", "Sales", "Productivity"] },
      { slug: "seminars",    label: "Seminars",    eventTypes: ["Investment", "Legal", "Strategy"] },
      { slug: "expos",       label: "Expos",       eventTypes: ["Trade Show", "Product Launch", "Showcase"] },
    ],
  },
  education: {
    label: "Education",
    subcategories: [
      { slug: "seminars",    label: "Seminars",    eventTypes: ["Science", "History", "Philosophy"] },
      { slug: "courses",     label: "Courses",     eventTypes: ["Online", "In-Person", "Hybrid"] },
      { slug: "workshops",   label: "Workshops",   eventTypes: ["Coding", "Design", "Writing"] },
      { slug: "lectures",    label: "Lectures",    eventTypes: ["Public", "Academic", "Industry"] },
      { slug: "boot-camps",  label: "Boot Camps",  eventTypes: ["Full Stack", "Data Science", "UX"] },
    ],
  },
  health: {
    label: "Health & Wellness",
    subcategories: [
      { slug: "yoga",          label: "Yoga",          eventTypes: ["Hatha", "Vinyasa", "Yin", "Hot Yoga"] },
      { slug: "meditation",    label: "Meditation",    eventTypes: ["Guided", "Silent", "Sound Bath"] },
      { slug: "fitness",       label: "Fitness",       eventTypes: ["HIIT", "CrossFit", "Pilates"] },
      { slug: "nutrition",     label: "Nutrition",     eventTypes: ["Meal Prep", "Diet Plans", "Cooking"] },
      { slug: "mental-health", label: "Mental Health", eventTypes: ["Therapy Groups", "Mindfulness", "CBT"] },
    ],
  },
  technology: {
    label: "Technology",
    subcategories: [
      { slug: "hackathons", label: "Hackathons", eventTypes: ["AI & ML", "Web Dev", "Mobile", "Blockchain"] },
      { slug: "meetups",    label: "Meetups",    eventTypes: ["React", "Python", "DevOps", "Cloud"] },
      { slug: "ai-ml",      label: "AI & ML",    eventTypes: ["NLP", "Computer Vision", "LLMs"] },
      { slug: "web-dev",    label: "Web Dev",    eventTypes: ["Frontend", "Backend", "Fullstack"] },
      { slug: "startups",   label: "Startups",   eventTypes: ["Pitch Night", "Demo Day", "Incubator"] },
    ],
  },
  "kids-family": {
    label: "Kids & Family",
    subcategories: [
      { slug: "shows",        label: "Shows",        eventTypes: ["Magic", "Puppet", "Circus"] },
      { slug: "outdoor",      label: "Outdoor",      eventTypes: ["Nature Walks", "Sports Day", "Camping"] },
      { slug: "indoor",       label: "Indoor",       eventTypes: ["Art & Craft", "Science", "Cooking"] },
      { slug: "workshops",    label: "Workshops",    eventTypes: ["Drawing", "Music", "Drama"] },
      { slug: "storytelling", label: "Storytelling", eventTypes: ["Reading Hour", "Author Visit", "Puppet"] },
    ],
  },
  community: {
    label: "Community",
    subcategories: [
      { slug: "charity",      label: "Charity",      eventTypes: ["Fundraisers", "Auctions", "Galas"] },
      { slug: "markets",      label: "Markets",      eventTypes: ["Farmers Market", "Craft Fair", "Flea"] },
      { slug: "volunteering", label: "Volunteering", eventTypes: ["Environmental", "Social", "Animal Care"] },
      { slug: "fundraisers",  label: "Fundraisers",  eventTypes: ["Run", "Bake Sale", "Concert"] },
      { slug: "local",        label: "Local",        eventTypes: ["Block Party", "Town Hall", "Clean Up"] },
    ],
  },
};

const toSlug = (str) => str.toLowerCase().replace(/[&\s]+/g, "-");

/* ═══════════════════════════════════════════════════════════════
   SCROLL ARROW BUTTON
═══════════════════════════════════════════════════════════════ */
const ScrollBtn = ({ direction, onClick, visible }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="absolute top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-r from-background to-transparent px-1 text-muted-foreground hover:text-foreground  "
      style={{ [direction === "left" ? "left" : "right"]: 0, background: direction === "right" ? "linear-gradient(to left, var(--background), transparent)" : "linear-gradient(to right, var(--background), transparent)" }}
      aria-label={`Scroll ${direction}`}
    >
      {direction === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NAV TAB ITEM
═══════════════════════════════════════════════════════════════ */
const NavTab = ({ to, label, isActive }) => (
  <Link
    to={to}
    className="relative flex items-center h-full px-4 text-sm whitespace-nowrap shrink-0  "
    style={{
      color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
      fontFamily: "var(--font-sans)",
      fontWeight: isActive ? 600 : 400,
    }}
  >
    {label}
    {/* Active indicator */}
    {isActive && (
      <span
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
        style={{ background: "var(--foreground)" }}
      />
    )}
  </Link>
);

/* ═══════════════════════════════════════════════════════════════
   CATEGORY NAV SECTION
   Level behaviour:
   - root (/browse)           → shows all top-level categories
   - category (/browse/:cat)  → shows subcategories of that category
   - subCategory              → shows event types of that subcategory
   - eventType                → shows sibling event types
═══════════════════════════════════════════════════════════════ */
const CategoryNavSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const location = useLocation();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const level = eventTypeSlug ? "eventType" : subCategorySlug ? "subCategory" : categorySlug ? "category" : "root";
  const categoryData = CATEGORY_MAP[categorySlug];
  const subcategoryData = categoryData?.subcategories?.find((s) => s.slug === subCategorySlug);

  /* ── Build tab list based on level ────── */
  const tabs = (() => {
    if (level === "root") {
      // All top-level categories
      return Object.entries(CATEGORY_MAP).map(([slug, cat]) => ({
        label: cat.label,
        to: `/browse/${slug}`,
        isActive: false, // root has no active tab — all are equal
      }));
    }

    if (level === "category") {
      // "All" tab + subcategories
      const all = { label: `All ${categoryData?.label || ""}`, to: `/browse/${categorySlug}`, isActive: location.pathname === `/browse/${categorySlug}` };
      const subs = (categoryData?.subcategories || []).map((sub) => ({
        label: sub.label,
        to: `/browse/${categorySlug}/${sub.slug}`,
        isActive: location.pathname === `/browse/${categorySlug}/${sub.slug}`,
      }));
      return [all, ...subs];
    }

    if (level === "subCategory") {
      // "All [subcat]" tab + event types
      const all = {
        label: `All ${subcategoryData?.label || ""}`,
        to: `/browse/${categorySlug}/${subCategorySlug}`,
        isActive: location.pathname === `/browse/${categorySlug}/${subCategorySlug}`,
      };
      const types = (subcategoryData?.eventTypes || []).map((type) => {
        const typeSlug = toSlug(type);
        return {
          label: type,
          to: `/browse/${categorySlug}/${subCategorySlug}/${typeSlug}`,
          isActive: location.pathname === `/browse/${categorySlug}/${subCategorySlug}/${typeSlug}`,
        };
      });
      return [all, ...types];
    }

    if (level === "eventType") {
      // Sibling event types (same subcategory)
      const all = {
        label: `All ${subcategoryData?.label || ""}`,
        to: `/browse/${categorySlug}/${subCategorySlug}`,
        isActive: false,
      };
      const types = (subcategoryData?.eventTypes || []).map((type) => {
        const typeSlug = toSlug(type);
        return {
          label: type,
          to: `/browse/${categorySlug}/${subCategorySlug}/${typeSlug}`,
          isActive: typeSlug === eventTypeSlug,
        };
      });
      return [all, ...types];
    }

    return [];
  })();

  /* ── Scroll shadow detection ─────────── */
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tabs.length]);

  // Scroll active tab into view on route change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector("[data-active='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [location.pathname]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  /* ── Section label ───────────────────── */
  const sectionLabel = (() => {
    if (level === "root") return "Browse by Category";
    if (level === "category") return categoryData?.label || "";
    if (level === "subCategory") return subcategoryData?.label || "";
    return subcategoryData?.label || "";
  })();

  if (tabs.length === 0) return null;

  return (
    <div className="w-full bg-background/90 sticky top-[64px] z-40">
      <Container aria-label="Category navigation">
        <div className="flex items-center h-11 gap-0 border-b border-border">
          {/* Section label — desktop only */}
          {level !== "root" && (
            <div className="hidden lg:flex items-center shrink-0 pr-4 mr-1 border-r border-border h-full">
              <span
                className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                {sectionLabel}
              </span>
            </div>
          )}

          {/* Scrollable tabs */}
          <div className="relative flex-1 h-full overflow-hidden">
            <ScrollBtn
              direction="left"
              onClick={() => scroll("left")}
              visible={canScrollLeft}
            />

            <div
              ref={scrollRef}
              className="flex items-center h-full overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onScroll={checkScroll}
            >
              <style>{`
                div::-webkit-scrollbar { display: none; }
              `}</style>

              {tabs.map((tab) => (
                <div
                  key={tab.to}
                  data-active={tab.isActive}
                  className="h-full flex items-center"
                >
                  <NavTab
                    to={tab.to}
                    label={tab.label}
                    isActive={tab.isActive}
                  />
                </div>
              ))}
            </div>

            <ScrollBtn
              direction="right"
              onClick={() => scroll("right")}
              visible={canScrollRight}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryNavSection;