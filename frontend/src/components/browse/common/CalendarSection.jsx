// frontend/src/components/browse/sections/CalendarSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Star, BadgeCheck } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";
import { getEventImage, getEventLocationLabel, getEventPriceLabel } from "@/utils/event-card";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const parseEventDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fmtTime = (value) => {
  const date = parseEventDate(value);
  if (!date) {
    return "Time TBA";
  }

  return date.toLocaleTimeString("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getMonthEventDays = (events, year, month) =>
  events
    .map((event) => parseEventDate(event.startDate))
    .filter((date) => date && date.getFullYear() === year && date.getMonth() === month)
    .map((date) => date.getDate())
    .sort((a, b) => a - b);

const pickFocusDate = (events, today) => {
  const todayValue = today.getTime();
  const upcoming = events.find((event) => {
    const date = parseEventDate(event.startDate);
    return date && date.getTime() >= todayValue;
  });

  return parseEventDate(upcoming?.startDate || events[0]?.startDate) || today;
};

const CalendarSection = () => {
  const { getEvents, locationLabel, config, level, buildEventUrl } = useBrowse();
  const today = useMemo(() => new Date(), []);
  const initialDate = today;
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const events = getEvents()
    .filter((event) => parseEventDate(event.startDate))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const focusDate = pickFocusDate(events, today);
  const focusYear = focusDate.getFullYear();
  const focusMonth = focusDate.getMonth();
  const focusDay = focusDate.getDate();
  const eventSignature = events
    .map((event) => `${event.id || event._id || event.slug}:${event.startDate || ""}`)
    .join("|");

  useEffect(() => {
    if (!events.length) {
      setYear(today.getFullYear());
      setMonth(today.getMonth());
      setSelectedDay(today.getDate());
      return;
    }

    setYear(focusYear);
    setMonth(focusMonth);
    setSelectedDay(focusDay);
  }, [eventSignature, events.length, focusDay, focusMonth, focusYear, today]);

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  while (cells.length % 7 !== 0) cells.push(null);

  // Map events to the real calendar day for the visible month.
  const eventsByDay = {};
  events.forEach((event) => {
    const date = parseEventDate(event.startDate);
    if (!date || date.getFullYear() !== year || date.getMonth() !== month) {
      return;
    }

    const day = date.getDate();
    if (!eventsByDay[day]) {
      eventsByDay[day] = [];
    }
    eventsByDay[day].push(event);
  });
  Object.values(eventsByDay).forEach((dayEvents) => {
    dayEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  });

  const selectedEvents = eventsByDay[selectedDay] || [];
  const selectedDateLabel = new Date(year, month, selectedDay).toLocaleDateString("en-BD", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const changeMonth = (offset) => {
    const nextDate = new Date(year, month + offset, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = nextDate.getMonth();
    const nextMonthEventDays = getMonthEventDays(events, nextYear, nextMonth);

    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDay(nextMonthEventDays[0] || 1);
  };

  const title = level === "root" ? "Events Calendar" : `${config.label} Calendar`;

  return (
    <section
      id="events-calendar"
      className="w-full bg-background"
      aria-label="Events calendar"
    >
      <Container>
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
              <Calendar size={13} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>Events in {locationLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
            {/* Calendar */}
            <div className="w-full lg:w-[320px] rounded-lg border border-border overflow-hidden bg-card">
              {/* Month nav */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground "
                  aria-label="Previous month"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{MONTHS[month]} {year}</span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground "
                  aria-label="Next month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {DAYS.map((d) => (
                  <div key={d} className="py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-sans)" }}>{d}</div>
                ))}
              </div>
              {/* Cells */}
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} className="h-9" />;
                  const dayEvents = eventsByDay[day] || [];
                  const hasEvents = dayEvents.length > 0;
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const isSelected = day === selectedDay;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`relative h-9 flex flex-col items-center justify-center text-xs font-medium transition-all ${
                        isSelected ? "text-background rounded" :
                        isToday ? "text-primary font-bold" :
                        hasEvents ? "text-foreground hover:bg-accent rounded" : "text-muted-foreground hover:bg-accent rounded"
                      }`}
                      style={{ background: isSelected ? "var(--foreground)" : undefined, fontFamily: "var(--font-sans)" }}
                      aria-label={`${MONTHS[month]} ${day}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                    >
                      {day}
                      {hasEvents && !isSelected && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day events */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                {selectedEvents.length
                  ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${selectedDateLabel}`
                  : `No events on ${selectedDateLabel}`}
              </p>
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-border text-center">
                  <Calendar size={24} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                    {events.length
                      ? "No events on this day. Pick another date."
                      : "No scheduled events are available for the current filters yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.slice(0, 4).map((e) => (
                    <Link
                      key={e.id || e._id || e.slug}
                      to={buildEventUrl(e)}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all">
                      <div className="w-14 h-14 rounded shrink-0 overflow-hidden bg-muted">
                        {getEventImage(e) ? (
                          <img
                            src={getEventImage(e)}
                            alt={e.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:underline" style={{ fontFamily: "var(--font-heading)" }}>
                          {e.title}
                          {(e.isVerified || e.organizer?.isVerified) && <BadgeCheck size={11} className="inline ml-1" />}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                          <span className="flex items-center gap-0.5"><Clock size={9} />{fmtTime(e.startDate)}</span>
                          <span className="flex items-center gap-0.5"><MapPin size={9} />{getEventLocationLabel(e)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} className="text-foreground fill-foreground" />
                          <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                            {Number(e.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground shrink-0" style={{ fontFamily: "var(--font-heading)" }}>
                        {getEventPriceLabel(e)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default CalendarSection;
