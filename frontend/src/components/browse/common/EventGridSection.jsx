// frontend/src/components/browse/sections/EventGridSection.jsx
import React, { useState, useMemo, useEffect } from "react";
import { LayoutGrid, List, Inbox } from "lucide-react";
import { useBrowse, unslugify } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import Container from "@/components/layout/Container";

const EVENTS_PER_PAGE = 12;

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1))
      pages.push(i);
    else if (i === page - 2 || i === page + 2) pages.push("...");
  }
  const deduped = pages.filter((p, i) => p !== "..." || pages[i - 1] !== "...");
  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ‹
      </button>
      {deduped.map((p, i) =>
        p === "..." ? (
          <span
            key={`e${i}`}
            className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium"
            style={{
              background:
                p === page ? "var(--foreground)" : "var(--background)",
              borderColor: p === page ? "var(--foreground)" : "var(--border)",
              color:
                p === page ? "var(--background)" : "var(--muted-foreground)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
};

const EmptyState = ({ locationLabel, title }) => (
  <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-dashed border-border text-center">
    <Inbox size={28} className="text-muted-foreground mb-3" />
    <p
      className="text-sm font-semibold text-foreground mb-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      No {title} events found in {locationLabel}
    </p>
    <p
      className="text-xs text-muted-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Try adjusting your filters or changing your location.
    </p>
  </div>
);

const EventGridSection = () => {
  const {
    getEvents,
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    locationLabel,
    isLoading,
    error,
  } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  // Retrieve all filtered events from context
  const allEvents = useMemo(() => getEvents(), [getEvents]);
  const totalCount = allEvents.length;
  const totalPages = Math.ceil(totalCount / EVENTS_PER_PAGE) || 1;
  const pageEvents = allEvents.slice(
    (page - 1) * EVENTS_PER_PAGE,
    page * EVENTS_PER_PAGE,
  );

  // Reset page when the underlying events array length changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [totalPages, page]);

  const toggle = (id) =>
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const handlePage = (p) => {
    // Clamp page to valid range
    const newPage = Math.min(Math.max(1, p), totalPages);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sectionTitle =
    level === "root"
      ? "All Events"
      : level === "category"
        ? `All ${unslugify(categorySlug)} Events`
        : level === "subCategory"
          ? `All ${unslugify(subCategorySlug)} Events`
          : `All ${unslugify(eventTypeSlug)} Events`;

  const levelLabel =
    level === "root"
      ? ""
      : level === "category"
        ? unslugify(categorySlug)
        : level === "subCategory"
          ? unslugify(subCategorySlug)
          : unslugify(eventTypeSlug);

  return (
    <section className="w-full bg-background" aria-label="All events grid">
      <Container>
        <div className="py-8">
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <div>
              <h2
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {sectionTitle}
              </h2>
              <p
                className="text-sm text-muted-foreground mt-0.5"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <span className="font-semibold text-foreground">
                  {isLoading ? "…" : totalCount}
                </span>{" "}
                events in {locationLabel}
              </p>
            </div>
            <div className="flex items-center rounded-md border border-border overflow-hidden shrink-0">
              {[
                ["grid", LayoutGrid],
                ["list", List],
              ].map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="flex items-center justify-center w-8 h-8"
                  style={{
                    background:
                      viewMode === mode
                        ? "var(--foreground)"
                        : "var(--background)",
                    color:
                      viewMode === mode
                        ? "var(--background)"
                        : "var(--muted-foreground)",
                  }}
                  aria-label={`${mode} view`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-lg border border-border p-4 gap-2 bg-muted/20" />
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-semibold text-destructive mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Failed to load events
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                {error?.message || "Please try again later."}
              </p>
            </div>
          ) : pageEvents.length === 0 ? (
            <EmptyState locationLabel={locationLabel} title={levelLabel} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageEvents.map((e) => {
                const key = e.id || e._id || e.slug;
                return (
                  <BrowseEventCard
                    key={key}
                    event={e}
                    variant="grid"
                    saved={savedIds.has(key)}
                    onSave={() => toggle(key)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pageEvents.map((e) => {
                const key = e.id || e._id || e.slug;
                return (
                  <BrowseEventCard
                    key={key}
                    event={e}
                    variant="list"
                    saved={savedIds.has(key)}
                    onSave={() => toggle(key)}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {!isLoading && !error && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePage}
            />
          )}
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default EventGridSection;
