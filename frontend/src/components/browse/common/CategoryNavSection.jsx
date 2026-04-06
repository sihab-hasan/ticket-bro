// frontend/src/components/browse/sections/CategoryNavSection.jsx
import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation as useRRLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const CategoryNavSection = () => {
  const { categorySlug, buildCategoryUrl, categoryItems } = useBrowse();
  const { pathname } = useRRLocation();
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => { updateArrows(); }, [categoryItems.length]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
    setTimeout(updateArrows, 300);
  };

  const categories = [
    { slug: "browse", label: "All Events", icon: "🎭" },
    ...categoryItems.map((category) => ({
      slug: category.slug,
      label: category.label,
      icon: null,
      catData: category,
    })),
  ];

  return (
    <section className="w-full bg-background border-b border-border sticky top-0 z-30" aria-label="Category navigation">
      <Container>
        <div className="relative flex items-center">
          {canLeft && (
            <button onClick={() => scroll(-1)}
              className="absolute left-0 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground ">
              <ChevronLeft size={14} />
            </button>
          )}
          <div ref={scrollRef} onScroll={updateArrows}
            className="flex items-center gap-1 overflow-x-auto py-2 px-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {categories.map(({ slug, label, catData }) => {
              const href = slug === "browse" ? "/browse" : buildCategoryUrl(slug);
              const isActive = slug === "browse" ? pathname === "/browse" : categorySlug === slug;
              const Icon = catData?.icon;
              return (
                <Link key={slug} to={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  style={{ background: isActive ? "var(--foreground)" : undefined, fontFamily: "var(--font-sans)" }}>
                  {Icon && <Icon size={12} strokeWidth={2} />}
                  {label}
                </Link>
              );
            })}
          </div>
          {canRight && (
            <button onClick={() => scroll(1)}
              className="absolute right-0 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground ">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CategoryNavSection;
