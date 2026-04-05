// frontend/src/components/home/ExploreByDate.jsx
import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Ticket, Radio } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";
import {
  getEventIdentity,
  getEventImage,
  getEventLocationLabel,
  getEventPriceLabel,
} from "@/utils/event-card";

const FALLBACK =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80";
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) =>
  new Date(startOfDay(date).getTime() + days * DAY_MS);

const parseEventDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isWithinDayRange = (date, start, endExclusive) => {
  const value = startOfDay(date).getTime();
  return value >= start.getTime() && value < endExclusive.getTime();
};

const getWeekendBounds = (today) => {
  const day = today.getDay();

  if (day === 6) {
    return { start: today, end: addDays(today, 2) };
  }

  if (day === 0) {
    const saturday = addDays(today, -1);
    return { start: saturday, end: addDays(saturday, 2) };
  }

  const saturday = addDays(today, 6 - day);
  return { start: saturday, end: addDays(saturday, 2) };
};

const getNextWeekBounds = (today) => {
  const daysUntilNextMonday = ((1 - today.getDay() + 7) % 7) || 7;
  const start = addDays(today, daysUntilNextMonday);
  return { start, end: addDays(start, 7) };
};

const fmtLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtRangeLabel = (start, endExclusive) =>
  `${fmtLabel(start)} - ${fmtLabel(addDays(endExclusive, -1))}`;

const fmtDate = (value) => {
  const date = parseEventDate(value);
  if (!date) {
    return "Date TBA";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const fmtTime = (value) => {
  const date = parseEventDate(value);
  if (!date) {
    return "Time TBA";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getCategoryLabel = (event) =>
  event.category?.name || event.category?.label || "Event";

const ExploreByDate = () => {
  const { getEvents, buildEventUrl, locationLabel } = useBrowse();

  const [tab, setTab] = useState("today");
  const [customDate, setCustomDate] = useState(null);
  const dateRef = useRef(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const weekend = useMemo(() => getWeekendBounds(today), [today]);
  const nextWeek = useMemo(() => getNextWeekBounds(today), [today]);
  const sourceEvents = getEvents();

  const legacyTabs = [
    { id: "today", label: "Today", sublabel: fmtLabel(today) },
    { id: "tomorrow", label: "Tomorrow", sublabel: fmtLabel(tomorrow) },
    { id: "weekend",  label: "This Weekend",sublabel: `${fmtLabel(today)} – ${fmtLabel(addDays(today,6))}` },
    { id: "next",     label: "Next Week",   sublabel: fmtLabel(addDays(today,7)) },
    { id: "custom",   label: "Custom Date", sublabel: customDate ? fmtLabel(customDate) : "Pick Date", isCustom: true },
  ];

  const tabs = [
    { id: "today", label: "Today", sublabel: fmtLabel(today) },
    { id: "tomorrow", label: "Tomorrow", sublabel: fmtLabel(tomorrow) },
    {
      id: "weekend",
      label: "This Weekend",
      sublabel: fmtRangeLabel(weekend.start, weekend.end),
    },
    {
      id: "next",
      label: "Next Week",
      sublabel: fmtRangeLabel(nextWeek.start, nextWeek.end),
    },
    {
      id: "custom",
      label: "Custom Date",
      sublabel: customDate ? fmtLabel(customDate) : "Pick Date",
      isCustom: true,
    },
  ];

  const events = useMemo(() => {
    const uniqueEvents = new Map();

    sourceEvents.forEach((event) => {
      const date = parseEventDate(event.startDate);
      if (!date) {
        return;
      }

      const key =
        getEventIdentity(event) ||
        `${event.slug || event.title || "event"}:${event.startDate}`;

      if (!uniqueEvents.has(key)) {
        uniqueEvents.set(key, event);
      }
    });

    return [...uniqueEvents.values()].sort(
      (left, right) =>
        parseEventDate(left.startDate).getTime() -
        parseEventDate(right.startDate).getTime(),
    );
  }, [sourceEvents]);

  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const date = parseEventDate(event.startDate);
        if (!date) {
          return false;
        }

        if (tab === "today") {
          return isSameDay(date, today);
        }

        if (tab === "tomorrow") {
          return isSameDay(date, tomorrow);
        }

        if (tab === "weekend") {
          return isWithinDayRange(date, weekend.start, weekend.end);
        }

        if (tab === "next") {
          return isWithinDayRange(date, nextWeek.start, nextWeek.end);
        }

        if (tab === "custom") {
          return customDate ? isSameDay(date, customDate) : false;
        }

        return true;
      }),
    [
      customDate,
      events,
      nextWeek.end,
      nextWeek.start,
      tab,
      today,
      tomorrow,
      weekend.end,
      weekend.start,
    ],
  );

  const openCustomPicker = () => {
    const input = dateRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
    input.focus();
  };

  const emptyStateAction =
    tab === "weekend"
      ? {
          label: "See next week instead",
          onClick: () => setTab("next"),
        }
      : {
          label: "Try this weekend instead",
          onClick: () => setTab("weekend"),
        };

  return (
    <section className="py-12 bg-background">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}>
            Explore events by <span className="text-primary italic">date</span>
          </h2>
          <div className="h-px flex-1 bg-border/40 ml-8 hidden md:block" />
        </div>

        {/* Date filter cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {tabs.map((t) => (
            <div key={t.id} className="relative">
              {t.isCustom && (
                <input
                  type="date"
                  ref={dateRef}
                  onChange={(event) => {
                    if (!event.target.value) {
                      return;
                    }

                    setCustomDate(new Date(`${event.target.value}T00:00:00`));
                    setTab("custom");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (t.isCustom) {
                    openCustomPicker();
                    return;
                  }

                  setTab(t.id);
                }}
                className={`w-full group relative overflow-hidden rounded-sm border transition-all duration-300 p-5 h-32 flex flex-col justify-between text-left ${
                  tab === t.id
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card/50 border-border/50 hover:border-primary/40"
                }`}
              >
                <div>
                  <h3 className={`text-base font-bold ${tab === t.id ? "text-primary" : "text-foreground"}`}
                    style={{ fontFamily: "var(--font-heading)" }}>
                    {t.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                    {t.sublabel}
                  </p>
                </div>
                <Calendar size={28} className={`self-end transition-all duration-300 ${tab === t.id ? "text-primary rotate-6 scale-110" : "text-muted-foreground/30 group-hover:text-primary/40"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Radio size={16} className="text-primary animate-pulse" />
            <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {filtered.length > 0 ? `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found` : "No events found"}
            </h3>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-sm">
              <p className="text-muted-foreground text-sm">No events for this date range in {locationLabel}.</p>
              <button
                type="button"
                onClick={emptyStateAction.onClick}
                className="mt-3 text-xs text-primary hover:underline"
              >
                {emptyStateAction.label}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, 6).map((event) => (
                <Link
                  key={getEventIdentity(event) || buildEventUrl(event)}
                  to={buildEventUrl(event)}
                  className="group bg-card rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={getEventImage(event) || FALLBACK}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      onError={(evt) => {
                        evt.currentTarget.src = FALLBACK;
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-sans)" }}>
                      {getCategoryLabel(event)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-base font-bold mb-2 group-hover:text-primary "
                      style={{ fontFamily: "var(--font-heading)" }}>
                      {event.title}
                    </h4>
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                        <MapPin size={12} /> {getEventLocationLabel(event)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                        <Clock size={12} /> {fmtDate(event.startDate)} | {fmtTime(event.startDate)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                        {getEventPriceLabel(event)}
                      </span>
                      <span
                        className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-bold transition-all"
                        style={{ background: "var(--color-brand-primary)", color: "var(--primary-foreground, #1a2e05)", fontFamily: "var(--font-sans)" }}
                      >
                        <Ticket size={12} /> Book Now
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default ExploreByDate;
