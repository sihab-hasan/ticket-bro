/**
 * Navbar — Professional Category Navigation
 *
 * Fixed 3-level flyout system:
 *  - Level 1: Top nav item → hovers to show Level 2 panel (drops below)
 *  - Level 2: Category row → hovers to show Level 3 panel (flies out to side)
 *  - Level 3: Subcategory panel (flies out from Level 2)
 *
 * Each level uses its own isolated group class so hover states don't bleed.
 */

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  memo,
  forwardRef,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronLeft, X } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

// ─────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────

const useRouteActive = () => {
  const { pathname } = useLocation();
  const seg = pathname.split("/").filter(Boolean);

  // Routes: /:cat, /:cat/:sub, /:cat/:sub/:type, /:cat/:sub/:type/:slug
  // seg: [0]=categorySlug, [1]=subCategorySlug, [2]=eventTypeSlug, [3]=eventSlug
  const isTopActive  = useCallback((s)       => seg[0] === s, [seg]);
  const isCatActive  = useCallback((t, c)    => seg[0] === t && seg[1] === c, [seg]);
  const isSubActive  = useCallback((t, c, s) => seg[0] === t && seg[1] === c && seg[2] === s, [seg]);

  return { pathname, isTopActive, isCatActive, isSubActive };
};

const useNavOverflow = (items, containerRef, anchorRef, itemRefs) => {
  const [visibleCount, setVisibleCount] = useState(items.length);
  const MORE_BTN_W = 72;

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;

      const totalW  = container.offsetWidth;
      const anchorW = anchorRef.current?.offsetWidth ?? 0;
      let used      = anchorW;
      let count     = 0;

      for (let i = 0; i < items.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const prevVis = el.style.visibility;
        const prevPos = el.style.position;
        el.style.visibility = "visible";
        el.style.position   = "static";
        const w = el.offsetWidth;
        el.style.visibility = prevVis;
        el.style.position   = prevPos;

        const isLastPossible = i === items.length - 1;
        const needed = used + w + (isLastPossible ? 0 : MORE_BTN_W);
        if (needed > totalW) break;

        used += w;
        count++;
      }

      setVisibleCount(count);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  return visibleCount;
};

const useFlyoutSide = (panelWidth = 224) => {
  const ref = useRef(null);
  const [openLeft, setOpenLeft] = useState(false);

  const detect = useCallback(() => {
    if (!ref.current) return;
    const { right } = ref.current.getBoundingClientRect();
    setOpenLeft(right + panelWidth > window.innerWidth);
  }, [panelWidth]);

  useLayoutEffect(() => {
    detect();
  }, [detect]);

  useEffect(() => {
    window.addEventListener("resize", detect, { passive: true });
    return () => window.removeEventListener("resize", detect);
  }, [detect]);

  return { ref, openLeft, detect };
};

// ─────────────────────────────────────────────────────────────────
// ANIMATED ACCORDION — shared hook for smooth expand/collapse
// ─────────────────────────────────────────────────────────────────

/**
 * useAccordion(open)
 * Returns a ref to attach to the content wrapper and inline styles.
 * Uses max-height + opacity for a smooth clip-in/out effect.
 */
const useAccordion = (open) => {
  const ref = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Cancel any pending rAF
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (open) {
      // First: measure natural height
      el.style.maxHeight = "none";
      const fullH = el.scrollHeight;
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
      el.style.overflow = "hidden";

      // Force reflow then animate to full height
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          el.style.transition = "max-height 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease";
          el.style.maxHeight = `${fullH}px`;
          el.style.opacity = "1";

          // After transition, remove max-height cap so dynamic content works
          const onEnd = () => {
            el.style.maxHeight = "none";
            el.style.overflow = "visible";
            el.removeEventListener("transitionend", onEnd);
          };
          el.addEventListener("transitionend", onEnd);
        });
      });
    } else {
      // Snap to current height then animate to 0
      const fullH = el.scrollHeight;
      el.style.maxHeight = `${fullH}px`;
      el.style.overflow = "hidden";

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          el.style.transition = "max-height 240ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease";
          el.style.maxHeight = "0px";
          el.style.opacity = "0";
        });
      });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  return ref;
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 3 — Subcategory side panel
// ─────────────────────────────────────────────────────────────────

const SubPanel = memo(({ subcategories, topSlug, catSlug, openLeft, isSubActive }) => {
  if (!subcategories?.length) return null;

  const panelPos   = openLeft ? "right-full top-0 mr-0" : "left-full top-0 ml-0";
  const bridgePos  = openLeft ? "right-0 translate-x-full" : "left-0 -translate-x-full";

  return (
    <div className={`absolute z-[70] ${panelPos} hidden group-hover/cat:block`}>
      <div className={`absolute inset-y-0 w-3 ${bridgePos}`} />

      <ul className="bg-popover rounded-none shadow-xl min-w-[200px] py-1">
        {subcategories.map((sub) => {
          const active = isSubActive(topSlug, catSlug, sub.slug);
          return (
            <li key={sub.id}>
              <Link
                to={`/${topSlug}/${catSlug}/${sub.slug}`}
                className={[
                  "flex items-center px-4 py-2 text-xs whitespace-nowrap ",
                  active
                    ? "bg-accent text-primary font-medium"
                    : "text-foreground hover:bg-accent ",
                ].join(" ")}
              >
                {sub.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
SubPanel.displayName = "SubPanel";

// ─────────────────────────────────────────────────────────────────
// LEVEL 2 — Category row inside a top-level panel
// ─────────────────────────────────────────────────────────────────

const CategoryRow = memo(({ category, topSlug, isCatActive, isSubActive }) => {
  const { ref, openLeft, detect } = useFlyoutSide(208);
  const hasSubs = !!category.subcategories?.length;
  const active  = isCatActive(topSlug, category.slug);

  return (
    <li ref={ref} className="relative group/cat">
      <Link
        to={`/${topSlug}/${category.slug}`}
        className={[
          "flex items-center justify-between gap-4 px-4 py-2 text-xs whitespace-nowrap ",
          active
            ? "bg-accent text-primary font-medium"
            : "text-foreground hover:bg-accent ",
        ].join(" ")}
      >
        <span>{category.name}</span>
        {hasSubs && (
          openLeft
            ? <ChevronLeft className="h-3 w-3 shrink-0 opacity-50" />
            : <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
        )}
      </Link>

      {hasSubs && (
        <SubPanel
          subcategories={category.subcategories}
          topSlug={topSlug}
          catSlug={category.slug}
          openLeft={openLeft}
          isSubActive={isSubActive}
        />
      )}
    </li>
  );
});
CategoryRow.displayName = "CategoryRow";

// ─────────────────────────────────────────────────────────────────
// LEVEL 2 panel container
// ─────────────────────────────────────────────────────────────────

const CategoryPanel = memo(({ categories, topSlug, align = "left", isCatActive, isSubActive }) => {
  if (!categories?.length) return null;

  const edgeClass = align === "right" ? "right-0" : "left-0";

  return (
    <div className={`absolute top-full ${edgeClass} z-50 pt-0 hidden group-hover/top:block`}>
      <ul className="bg-popover rounded-none shadow-xl min-w-[220px] py-1">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            topSlug={topSlug}
            isCatActive={isCatActive}
            isSubActive={isSubActive}
          />
        ))}
      </ul>
    </div>
  );
});
CategoryPanel.displayName = "CategoryPanel";

// ─────────────────────────────────────────────────────────────────
// LEVEL 1 — Inline desktop nav item
// ─────────────────────────────────────────────────────────────────

const DesktopNavItem = memo(
  forwardRef(({ item, isTopActive, isCatActive, isSubActive, hidden }, ref) => {
    const active = isTopActive(item.slug);

    return (
      <li
        ref={ref}
        style={hidden ? { visibility: "hidden", position: "absolute", pointerEvents: "none" } : undefined}
        className="relative group/top h-full shrink-0"
      >
        <Link
          to={`/${item.slug}`}
          className={[
            "relative flex items-center h-full px-3.5 text-xs font-medium tracking-wide",
            "whitespace-nowrap  select-none",
            active ? "text-primary" : "text-foreground",
          ].join(" ")}
        >
          {item.name}
          <span
            className={[
              "absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-primary",
              "transition-all duration-300 origin-center",
              active ? "w-[70%]" : "w-0 group-hover/top:w-[60%]",
            ].join(" ")}
          />
        </Link>

        <CategoryPanel
          categories={item.categories}
          topSlug={item.slug}
          align="left"
          isCatActive={isCatActive}
          isSubActive={isSubActive}
        />
      </li>
    );
  })
);
DesktopNavItem.displayName = "DesktopNavItem";

// ─────────────────────────────────────────────────────────────────
// "More" overflow
// ─────────────────────────────────────────────────────────────────

const MoreItem = memo(({ item, isTopActive, isCatActive, isSubActive }) => {
  const { ref, openLeft, detect } = useFlyoutSide(224);
  const hasCategories = !!item.categories?.length;
  const active        = isTopActive(item.slug);

  const panelPos  = openLeft ? "right-full top-0 mr-0" : "left-full top-0 ml-0";
  const bridgePos = openLeft ? "right-0 translate-x-full" : "left-0 -translate-x-full";

  return (
    <li ref={ref} className="relative group/moreitem">
      <Link
        to={`/${item.slug}`}
        className={[
          "flex items-center justify-between gap-4 px-4 py-2 text-xs whitespace-nowrap",
          active
            ? "bg-accent text-primary font-medium"
            : "text-foreground hover:bg-accent ",
        ].join(" ")}
      >
        <span>{item.name}</span>
        {hasCategories && (
          openLeft
            ? <ChevronLeft className="h-3 w-3 shrink-0 opacity-50" />
            : <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
        )}
      </Link>

      {hasCategories && (
        <div className={`absolute z-[70] ${panelPos} hidden group-hover/moreitem:block`}>
          <div className={`absolute inset-y-0 w-3 ${bridgePos}`} />
          <ul className="relative bg-popover rounded-none shadow-xl min-w-[220px] py-1">
            {item.categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                topSlug={item.slug}
                isCatActive={isCatActive}
                isSubActive={isSubActive}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
});
MoreItem.displayName = "MoreItem";

// ─────────────────────────────────────────────────────────────────
// "More ▾" button
// ─────────────────────────────────────────────────────────────────

const MoreDropdown = memo(({ items, isTopActive, isCatActive, isSubActive, onMoreClick }) => {
  if (!items.length) return null;

  return (
    <li className="relative group/top h-full shrink-0 ml-1">
      <button
        type="button"
        aria-haspopup="true"
        aria-label="More categories"
        onClick={onMoreClick}
        className={[
          "relative flex items-center gap-1 h-full px-3.5 text-xs font-medium tracking-wide",
          "whitespace-nowrap select-none cursor-pointer",
          "text-foreground ",
        ].join(" ")}
      >
        More
        <ChevronDown className="h-3 w-3 opacity-60" />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-primary transition-all duration-300 origin-center w-0 group-hover/top:w-[60%]" />
      </button>

      <div className="absolute top-full right-0 z-50 pt-0 hidden group-hover/top:block">
        <ul className="bg-popover rounded-none shadow-xl min-w-[220px] py-1">
          {items.map((item) => (
            <MoreItem
              key={item.id}
              item={item}
              isTopActive={isTopActive}
              isCatActive={isCatActive}
              isSubActive={isSubActive}
            />
          ))}
        </ul>
      </div>
    </li>
  );
});
MoreDropdown.displayName = "MoreDropdown";

// ─────────────────────────────────────────────────────────────────
// MOBILE — Drawer + Independent Column Accordion
// ─────────────────────────────────────────────────────────────────

const MobileSubItem = memo(({ sub, topSlug, catSlug, isSubActive, onClose }) => {
  const active = isSubActive(topSlug, catSlug, sub.slug);
  return (
    <li>
      <Link
        to={`/${topSlug}/${catSlug}/${sub.slug}`}
        onClick={onClose}
        className={[
          "block pl-14 pr-4 py-2.5 text-xs ",
          active ? "text-primary font-medium" : "text-foreground ",
        ].join(" ")}
      >
        {sub.name}
      </Link>
    </li>
  );
});
MobileSubItem.displayName = "MobileSubItem";

// ─────────────────────────────────────────────────────────────────
// Animated subcategory list
// ─────────────────────────────────────────────────────────────────

const AnimatedSubList = memo(({ open, subcategories, topSlug, catSlug, isSubActive, onClose }) => {
  const contentRef = useAccordion(open);

  return (
    <div
      ref={contentRef}
      style={{ maxHeight: 0, opacity: 0, overflow: "hidden" }}
    >
      <ul className="bg-muted/20">
        {subcategories.map((sub) => (
          <MobileSubItem
            key={sub.id}
            sub={sub}
            topSlug={topSlug}
            catSlug={catSlug}
            isSubActive={isSubActive}
            onClose={onClose}
          />
        ))}
      </ul>
    </div>
  );
});
AnimatedSubList.displayName = "AnimatedSubList";

const MobileCatItemControlled = memo(({ category, topSlug, openCatId, onToggleCat, isCatActive, isSubActive, onClose }) => {
  const hasSubs = !!category.subcategories?.length;
  const active  = isCatActive(topSlug, category.slug);
  const open    = openCatId === category.id;

  return (
    <li className="last:border-0">
      <div className="flex items-center pl-8 pr-2">
        <Link
          to={`/${topSlug}/${category.slug}`}
          onClick={onClose}
          className={[
            "flex-1 py-2.5 text-xs ",
            active ? "text-primary font-medium" : "text-foreground ",
          ].join(" ")}
        >
          {category.name}
        </Link>
        {hasSubs && (
          <button
            type="button"
            onClick={() => onToggleCat(category.id)}
            className="flex items-center justify-center w-9 h-9 text-foreground  rounded-none hover:bg-accent"
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
          >
            <ChevronDown
              className="h-3.5 w-3.5"
              style={{
                transition: "transform 260ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
        )}
      </div>

      {hasSubs && (
        <AnimatedSubList
          open={open}
          subcategories={category.subcategories}
          topSlug={topSlug}
          catSlug={category.slug}
          isSubActive={isSubActive}
          onClose={onClose}
        />
      )}
    </li>
  );
});
MobileCatItemControlled.displayName = "MobileCatItemControlled";

// ─────────────────────────────────────────────────────────────────
// Animated category list
// ─────────────────────────────────────────────────────────────────

const AnimatedCatList = memo(({ open, categories, topSlug, openCatId, toggleCat, isCatActive, isSubActive, onClose }) => {
  const contentRef = useAccordion(open);

  return (
    <div
      ref={contentRef}
      style={{ maxHeight: 0, opacity: 0, overflow: "hidden" }}
    >
      <ul className="bg-muted/15">
        {categories.map((cat) => (
          <MobileCatItemControlled
            key={cat.id}
            category={cat}
            topSlug={topSlug}
            openCatId={openCatId}
            onToggleCat={toggleCat}
            isCatActive={isCatActive}
            isSubActive={isSubActive}
            onClose={onClose}
          />
        ))}
      </ul>
    </div>
  );
});
AnimatedCatList.displayName = "AnimatedCatList";

// Each top-level item in a column — owns its own sub-accordion state.
const MobileColumnItem = memo(({ item, openId, setOpenId, isTopActive, isCatActive, isSubActive, onClose }) => {
  const [openCatId, setOpenCatId] = useState(null);
  const toggleCat = useCallback((id) => setOpenCatId((p) => (p === id ? null : id)), []);
  const active    = isTopActive(item.slug);
  const open      = openId === item.id;
  const hasCats   = !!item.categories?.length;

  useEffect(() => { if (!open) setOpenCatId(null); }, [open]);

  return (
    <div>
      {/* Top-level row */}
      <div className="flex items-center pr-2">
        <Link
          to={`/${item.slug}`}
          onClick={onClose}
          className={[
            "flex-1 px-4 py-3.5 text-sm font-medium ",
            active ? "text-primary" : "text-foreground hover:text-primary",
          ].join(" ")}
        >
          {item.name}
        </Link>
        {hasCats && (
          <button
            type="button"
            onClick={() => setOpenId(open ? null : item.id)}
            className="flex items-center justify-center w-10 h-10 text-foreground  rounded-none hover:bg-accent shrink-0"
            aria-label={open ? `Collapse ${item.name}` : `Expand ${item.name}`}
            aria-expanded={open}
          >
            <ChevronDown
              className="h-4 w-4"
              style={{
                transition: "transform 260ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
        )}
      </div>

      {/* Categories — animated expand/collapse */}
      {hasCats && (
        <AnimatedCatList
          open={open}
          categories={item.categories}
          topSlug={item.slug}
          openCatId={openCatId}
          toggleCat={toggleCat}
          isCatActive={isCatActive}
          isSubActive={isSubActive}
          onClose={onClose}
        />
      )}
    </div>
  );
});
MobileColumnItem.displayName = "MobileColumnItem";

// One of 3 vertical columns — fully independent, never affects siblings.
const MobileColumn = memo(({ items, openId, setOpenId, isTopActive, isCatActive, isSubActive, onClose }) => (
  <div className="flex-1 min-w-0" style={{ borderRight: "1px solid hsl(var(--border) / 0.3)" }}>
    {items.map((item) => (
      <MobileColumnItem
        key={item.id}
        item={item}
        openId={openId}
        setOpenId={setOpenId}
        isTopActive={isTopActive}
        isCatActive={isCatActive}
        isSubActive={isSubActive}
        onClose={onClose}
      />
    ))}
  </div>
));
MobileColumn.displayName = "MobileColumn";

const COLS = 3;

// ─────────────────────────────────────────────────────────────────
// MobileDrawer — with slide-down + fade open/close animation
// ─────────────────────────────────────────────────────────────────

const MobileDrawer = memo(({ items, open, onClose, pathname, isTopActive, isCatActive, isSubActive }) => {
  const [openId, setOpenId] = useState(null);

  // Two-phase state: `mounted` keeps DOM alive during exit animation,
  // `animIn` drives the CSS transition class.
  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn]   = useState(false);
  const exitTimerRef          = useRef(null);

  useEffect(() => {
    if (open) {
      // Clear any pending unmount
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setMounted(true);
      // Double rAF so the browser paints the initial (hidden) state first
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimIn(true))
      );
    } else {
      setAnimIn(false);
      // Keep mounted until exit transition finishes (300ms)
      exitTimerRef.current = setTimeout(() => setMounted(false), 300);
    }
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [open]);

  // Route change → close
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Reset accordion when drawer closes
  useEffect(() => {
    if (!open) setOpenId(null);
  }, [open]);

  // Keyboard + scroll close
  useEffect(() => {
    if (!open) return;
    const onKey    = (e) => { if (e.key === "Escape") onClose(); };
    const onScroll = () => onClose();
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, onClose]);

  const handleSetOpenId = useCallback((id) => setOpenId((prev) => (prev === id ? null : id)), []);

  if (!mounted) return null;

  const ITEMS_PER_COL = Math.ceil(items.length / COLS) || 1;
  const columns = Array.from({ length: COLS }, (_, ci) =>
    items.slice(ci * ITEMS_PER_COL, (ci + 1) * ITEMS_PER_COL)
  ).filter((col) => col.length > 0);

  return (
    <>
      {/* Backdrop — fades in/out */}
      <div
        className="xl:hidden fixed inset-0 z-30"
        onClick={onClose}
        aria-hidden="true"
        style={{
          backgroundColor: "hsl(var(--background) / 0.01)",
          transition: "opacity 280ms ease",
          opacity: animIn ? 1 : 0,
        }}
      />

      {/* Drawer panel — slides down from navbar + fades */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Browse categories"
        className="xl:hidden fixed left-0 right-0 z-40 bg-background border-b border-border shadow-lg overflow-y-auto"
        style={{
          top: "103px",
          maxHeight: "calc(100vh - 103px)",
          // Slide + fade: translate up 10px when hidden, 0 when visible
          transform: animIn ? "translateY(0)" : "translateY(-10px)",
          opacity: animIn ? 1 : 0,
          transition: animIn
            ? "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease"
            : "transform 240ms cubic-bezier(0.4, 0, 1, 1), opacity 200ms ease",
          // Clip the slide so it doesn't bleed above the navbar
          clipPath: "inset(0 0 -100vh 0)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between pr-2 h-11">
          <Link
            to="/browse"
            onClick={onClose}
            className="flex-1 px-4 py-3.5 text-sm font-medium text-foreground hover:text-primary "
          >
            Browse Events
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-accent "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 truly independent columns */}
        <div className="flex items-start" style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}>
          {columns.map((colItems, ci) => (
            <MobileColumn
              key={ci}
              items={colItems}
              openId={openId}
              setOpenId={handleSetOpenId}
              isTopActive={isTopActive}
              isCatActive={isCatActive}
              isSubActive={isSubActive}
              onClose={onClose}
            />
          ))}
        </div>
      </div>
    </>
  );
});
MobileDrawer.displayName = "MobileDrawer";

// ─────────────────────────────────────────────────────────────────
// NAVBAR (main export)
// ─────────────────────────────────────────────────────────────────

const Navbar = () => {
  const { pathname, isTopActive, isCatActive, isSubActive } = useRouteActive();
  const { navigationItems } = useBrowse();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const containerRef = useRef(null);
  const anchorRef    = useRef(null);
  const itemRefs     = useRef([]);

  const visibleCount  = useNavOverflow(navigationItems, containerRef, anchorRef, itemRefs);
  const overflowItems = navigationItems.slice(visibleCount);
  const hasOverflow   = overflowItems.length > 0;

  const openDrawer  = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <nav className="w-full" aria-label="Category navigation">
        <Container>

          {/* ── Desktop ─────────────────────────────────────── */}
          <div
            ref={containerRef}
            className="hidden xl:flex items-center h-11 w-full border-b border-border"
          >
            <ul className="flex items-center h-full w-full min-w-0">

              <li ref={anchorRef} className="relative group/top h-full shrink-0">
                <Link
                  to="/browse"
                  className={[
                    "relative flex items-center h-full px-3.5 text-xs font-medium tracking-wide",
                    "whitespace-nowrap  select-none",
                    pathname === "/browse" ? "text-primary" : "text-foreground ",
                  ].join(" ")}
                >
                  All Events
                  <span
                    className={[
                      "absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-primary",
                      "transition-all duration-300 origin-center",
                      pathname === "/browse" ? "w-[70%]" : "w-0 group-hover/top:w-[60%]",
                    ].join(" ")}
                  />
                </Link>
              </li>

              {navigationItems.map((item, i) => (
                <DesktopNavItem
                  key={item.id}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  item={item}
                  isTopActive={isTopActive}
                  isCatActive={isCatActive}
                  isSubActive={isSubActive}
                  hidden={i >= visibleCount}
                />
              ))}

              {hasOverflow && (
                <MoreDropdown
                  items={overflowItems}
                  isTopActive={isTopActive}
                  isCatActive={isCatActive}
                  isSubActive={isSubActive}
                  onMoreClick={openDrawer}
                />
              )}

            </ul>
          </div>

          {/* ── Mobile ──────────────────────────────────────── */}
          <div className="flex xl:hidden items-center justify-between h-11 border-b border-border px-1">
            <Link
              to="/browse"
              className={[
                "text-xs font-medium tracking-wide ",
                pathname === "/browse" ? "text-primary" : "text-foreground ",
              ].join(" ")}
            >
              All Events
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label="Browse categories"
              className="flex items-center gap-1.5 h-full px-3 text-xs font-medium text-foreground  border-l border-border ml-2"
            >
              Browse
              <ChevronDown
                className="h-3 w-3 opacity-60"
                style={{
                  transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: drawerOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          </div>

        </Container>
      </nav>

      <MobileDrawer
        items={navigationItems}
        open={drawerOpen}
        onClose={closeDrawer}
        pathname={pathname}
        isTopActive={isTopActive}
        isCatActive={isCatActive}
        isSubActive={isSubActive}
      />
    </>
  );
};

export default Navbar;
