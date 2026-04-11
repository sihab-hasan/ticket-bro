// frontend/src/components/browse/sections/CalendarSection.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Star,
  BadgeCheck,
  Ticket,
} from "lucide-react";
import {
  getEventImage,
  getEventLocationLabel,
  getEventPriceLabel,
  getEventUrl,
} from "@/utils/event-card";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";
import { formatEventDateSpanLabel, getEventDaysInMonth } from "@/lib/eventDates";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CalendarSection = () => {
  const { getEvents, locationLabel, config, level } = useBrowse();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const events = getEvents();

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = {};
  events.forEach((e) => {
    getEventDaysInMonth(e, year, month).forEach((day) => {
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push(e);
    });
  });

  Object.values(eventsByDay).forEach((dayEvents) => {
    dayEvents.sort((left, right) => new Date(left.startDate) - new Date(right.startDate));
  });

  const selectedEvents = eventsByDay[selectedDay] || [];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(1); };

  const title = level === "root" ? "Events Calendar" : `${config.label} Calendar`;

  return (
    <section className="w-full bg-background" aria-label="Events calendar">
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
                <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground ">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{MONTHS[month]} {year}</span>
                <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground ">
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
                  const hasEvents = !!eventsByDay[day];
                  const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                  const isSelected = day === selectedDay;
                  return (
                    <button key={day} onClick={() => setSelectedDay(day)}
                      className={`relative h-9 flex flex-col items-center justify-center text-xs font-medium transition-all ${
                        isSelected ? "text-background rounded" :
                        isToday ? "text-primary font-bold" :
                        hasEvents ? "text-foreground hover:bg-accent rounded" : "text-muted-foreground hover:bg-accent rounded"
                      }`}
                      style={{ background: isSelected ? "var(--foreground)" : undefined, fontFamily: "var(--font-sans)" }}>
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
                  ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${MONTHS[month]} ${selectedDay}`
                  : `No events on ${MONTHS[month]} ${selectedDay}`}
              </p>
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-border text-center">
                  <Calendar size={24} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>No events on this day. Pick another date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.slice(0, 4).map((e) => {
                    // Build values using event utility helpers. Fallbacks ensure graceful degradation.
                    const href = getEventUrl(e);
                    const image = getEventImage(e);
                    const title = e?.title || "Untitled";
                    const scheduleLabel = formatEventDateSpanLabel(e, "en-BD");
                    const time = e?.startDate
                      ? new Date(e.startDate).toLocaleTimeString("en-BD", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Time TBA";
                    const venueLabel = getEventLocationLabel(e);
                    const rating = Number(e?.averageRating || e?.avgRating || e?.rating || 0).toFixed(1);
                    const price = getEventPriceLabel(e);
                    const verified = e?.organizer?.isVerified;
                    return (
                      <Link
                        key={e.id || e._id || e.slug}
                        to={href}
                        className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all"
                      >
                        <div className="w-14 h-14 rounded shrink-0 overflow-hidden bg-muted">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(ev) => (ev.target.style.display = "none")}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground/40">
                              <Ticket size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-sm font-bold text-foreground line-clamp-1 group-hover:underline"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {title}
                            {verified && <BadgeCheck size={11} className="inline ml-1" />}
                          </h4>
                          <div
                            className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5"
                            style={{ fontFamily: "var(--font-sans)" }}
                          >
                            <span className="flex items-center gap-0.5">
                              <Calendar size={9} />
                              {scheduleLabel}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5"
                            style={{ fontFamily: "var(--font-sans)" }}
                          >
                            <span className="flex items-center gap-0.5">
                              <Clock size={9} />
                              {time}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin size={9} />
                              {venueLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="text-foreground fill-foreground" />
                            <span
                              className="text-[11px] font-semibold text-foreground"
                              style={{ fontFamily: "var(--font-sans)" }}
                            >
                              {rating}
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-sm font-bold text-foreground shrink-0"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {price}
                        </span>
                      </Link>
                    );
                  })}
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
