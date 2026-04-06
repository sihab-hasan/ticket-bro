// frontend/src/components/home/ExploreByDate.jsx
import React, { useState, useRef, useMemo } from "react";
import { Calendar, MapPin, Clock, Ticket, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const FALLBACK = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80";

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

const fmtLabel = (d) => d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
const fmtDate  = (d) => {
  if (!d) return "Date TBA";
  try { return new Date(d).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }); }
  catch { return ""; }
};
const fmtTime = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true }); }
  catch { return ""; }
};

const ExploreByDate = () => {
  const navigate = useNavigate();
  const { getUpcoming, getEvents, buildEventUrl, locationLabel } = useBrowse();

  const [tab, setTab] = useState("today");
  const [customDate, setCustomDate] = useState(null);
  const dateRef = useRef(null);

  const today     = startOfDay(new Date());
  const tomorrow  = addDays(today, 1);
  const weekEnd   = addDays(today, 7);

  const tabs = [
    { id: "today",    label: "Today",       sublabel: fmtLabel(today)    },
    { id: "tomorrow", label: "Tomorrow",    sublabel: fmtLabel(tomorrow) },
    { id: "weekend",  label: "This Weekend",sublabel: `${fmtLabel(today)} – ${fmtLabel(addDays(today,6))}` },
    { id: "next",     label: "Next Week",   sublabel: fmtLabel(addDays(today,7)) },
    { id: "custom",   label: "Custom Date", sublabel: customDate ? fmtLabel(customDate) : "Pick Date", isCustom: true },
  ];

  const allEvents = [...getUpcoming(), ...getEvents()];

  const filtered = useMemo(() => {
    const uniq = new Map();
    allEvents.forEach((e) => uniq.set(e._id, e));
    const pool = [...uniq.values()].filter((e) => e.startDate);
    if (tab === "today")    return pool.filter((e) => isSameDay(new Date(e.startDate), today));
    if (tab === "tomorrow") return pool.filter((e) => isSameDay(new Date(e.startDate), tomorrow));
    if (tab === "weekend")  return pool.filter((e) => { const d = startOfDay(new Date(e.startDate)); return d >= today && d < weekEnd; });
    if (tab === "next")     return pool.filter((e) => { const d = startOfDay(new Date(e.startDate)); return d >= weekEnd && d < addDays(today, 14); });
    if (tab === "custom" && customDate) return pool.filter((e) => isSameDay(new Date(e.startDate), customDate));
    return pool;
  }, [tab, customDate, allEvents]);

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
                  onChange={(e) => {
                    if (e.target.value) {
                      setCustomDate(new Date(e.target.value + "T00:00:00"));
                      setTab("custom");
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
              )}
              <button
                onClick={() => {
                  if (t.isCustom) { dateRef.current?.showPicker(); }
                  else { setTab(t.id); }
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
              <button onClick={() => setTab("weekend")} className="mt-3 text-xs text-primary hover:underline">
                Try this weekend instead
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, 6).map((ev) => (
                <div
                  key={ev._id}
                  onClick={() => navigate(buildEventUrl(ev))}
                  className="group bg-card rounded-sm overflow-hidden hover:shadow-lg cursor-pointer transition-all duration-300"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={ev.coverImage || ev.images?.[0] || FALLBACK}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      onError={(e) => { e.target.src = FALLBACK; }}
                    />
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-sans)" }}>
                      {ev.category?.name || "Event"}
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-base font-bold mb-2 group-hover:text-primary "
                      style={{ fontFamily: "var(--font-heading)" }}>
                      {ev.title}
                    </h4>
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                        <MapPin size={12} /> {ev.location?.name || ev.location?.city}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                        <Clock size={12} /> {fmtDate(ev.startDate)}{ev.startDate ? ` · ${fmtTime(ev.startDate)}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                        {ev.isFree ? "Free" : `${ev.currency || "BDT"} ${(ev.minPrice || 0).toLocaleString()}`}
                      </span>
                      <button
                        className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-bold transition-all"
                        style={{ background: "var(--color-brand-primary)", color: "var(--primary-foreground, #1a2e05)", fontFamily: "var(--font-sans)" }}
                      >
                        <Ticket size={12} /> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default ExploreByDate;
