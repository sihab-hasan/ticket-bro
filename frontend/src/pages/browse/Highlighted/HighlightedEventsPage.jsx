import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Ticket } from "lucide-react";
import Container from "@/components/layout/Container";
import Breadcrumb from "@/components/shared/common/Breadcrumb";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "@/components/browse/common/SectionShell";
import { EmptyState, SectionLoader } from "@/components/shared/Loader";

const MetricTile = ({ value, label, tone = "default" }) => (
  <div
    className={`rounded-2xl border p-4 ${
      tone === "inverse"
        ? "border-white/10 bg-white/5 text-white"
        : "border-border bg-card text-foreground"
    }`}
  >
    <p
      className={`text-2xl font-bold leading-none ${
        tone === "inverse" ? "text-white" : "text-foreground"
      }`}
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {value}
    </p>
    <p
      className={`mt-2 text-xs ${
        tone === "inverse" ? "text-white/70" : "text-muted-foreground"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {label}
    </p>
  </div>
);

const HighlightedEventsPage = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  heroStats = [],
  events = [],
  loading = false,
  error = null,
  onRetry,
  topSectionTitle,
  topSectionSubtitle,
  gridSectionTitle,
  gridSectionSubtitle,
  emptyTitle,
  emptyMessage,
  showTrendingBadge = false,
  theme = {},
}) => {
  const [savedIds, setSavedIds] = useState(new Set());

  const spotlight = events.slice(0, 3);
  const leadEvent = spotlight[0];
  const supportEvents = spotlight.slice(1);
  const remainingEvents = events.slice(3);

  const categoryLabels = useMemo(() => {
    const labels = [];
    const seen = new Set();

    events.forEach((event) => {
      const name = event?.category?.name;
      if (!name || seen.has(name)) {
        return;
      }
      seen.add(name);
      labels.push(name);
    });

    return labels.slice(0, 6);
  }, [events]);

  const previewEvents = events.slice(0, 3);

  const toggleSaved = (eventId) =>
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });

  return (
    <div className="bg-background pb-10">
      <section className="w-full border-b border-border bg-background">
        <Container>
          <div className="py-4">
            <Breadcrumb />
          </div>
          <div
            className="overflow-hidden rounded-[32px] border border-border"
            style={{
              background:
                theme.heroBackground ||
                "linear-gradient(135deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0) 65%)",
            }}
          >
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 backdrop-blur-sm">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"
                  >
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {eyebrow}
                  </span>
                </div>

                <h1
                  className="max-w-3xl text-4xl font-bold leading-[1.02] text-foreground sm:text-5xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h1>
                <p
                  className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {description}
                </p>

                {categoryLabels.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {categoryLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/browse"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85"
                    style={{
                      background: theme.ctaBackground || "var(--foreground)",
                      color: theme.ctaColor || "var(--background)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Browse all events
                    <ArrowRight size={14} />
                  </Link>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <RefreshCw size={14} />
                      Refresh
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-border bg-black/[0.03] p-6 sm:p-8 lg:border-l lg:border-t-0">
                <div className="grid grid-cols-2 gap-3">
                  {heroStats.map((stat) => (
                    <MetricTile
                      key={stat.label}
                      value={stat.value}
                      label={stat.label}
                      tone={theme.inverseMetrics ? "inverse" : "default"}
                    />
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-border bg-background/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        Live preview
                      </p>
                      <p
                        className="mt-1 text-sm font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        Real event cards from this feed
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {events.length} events
                    </span>
                  </div>
                  <div className="space-y-3">
                    {previewEvents.map((event) => {
                      const key = event.id || event._id || event.slug;
                      return (
                        <BrowseEventCard
                          key={key}
                          event={event}
                          variant="compact"
                          saved={savedIds.has(key)}
                          onSave={toggleSaved}
                          showDistance
                        />
                      );
                    })}
                    {!previewEvents.length && (
                      <div className="rounded-2xl border border-dashed border-border p-5 text-center">
                        <Ticket size={22} className="mx-auto mb-3 text-muted-foreground/40" />
                        <p
                          className="text-sm font-semibold text-foreground"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          Feed updates will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {loading ? (
        <SectionLoader text="Loading events..." height="h-96" />
      ) : error ? (
        <Container>
          <div className="py-10">
            <div className="rounded-[28px] border border-border bg-card p-10 text-center">
              <p
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                We couldn&apos;t load this feed right now.
              </p>
              <p
                className="mt-2 text-sm text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {error?.message || "Please try again in a moment."}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              )}
            </div>
          </div>
        </Container>
      ) : events.length === 0 ? (
        <Container>
          <div className="py-10">
            <EmptyState
              icon={Icon}
              title={emptyTitle}
              message={emptyMessage}
              actionText="Reload"
              onAction={onRetry}
            />
          </div>
        </Container>
      ) : (
        <>
          {leadEvent && (
            <SectionShell
              title={topSectionTitle}
              subtitle={topSectionSubtitle}
              icon={Icon}
            >
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <BrowseEventCard
                  event={leadEvent}
                  variant="featured"
                  saved={savedIds.has(leadEvent.id || leadEvent._id || leadEvent.slug)}
                  onSave={toggleSaved}
                  showBadge={showTrendingBadge}
                />
                <div className="grid gap-4">
                  {supportEvents.map((event) => {
                    const key = event.id || event._id || event.slug;
                    return (
                      <BrowseEventCard
                        key={key}
                        event={event}
                        variant="horizontal"
                        saved={savedIds.has(key)}
                        onSave={toggleSaved}
                        showBadge={showTrendingBadge}
                        showReason={!showTrendingBadge}
                      />
                    );
                  })}
                </div>
              </div>
            </SectionShell>
          )}

          <SectionShell
            title={gridSectionTitle}
            subtitle={gridSectionSubtitle}
            icon={Icon}
            divider={false}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {remainingEvents.map((event) => {
                const key = event.id || event._id || event.slug;
                return (
                  <BrowseEventCard
                    key={key}
                    event={event}
                    variant="grid"
                    saved={savedIds.has(key)}
                    onSave={toggleSaved}
                    showBadge={showTrendingBadge}
                  />
                );
              })}
            </div>
          </SectionShell>
        </>
      )}
    </div>
  );
};

export default HighlightedEventsPage;
