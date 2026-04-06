// frontend/src/components/home/Scenes.jsx
import React, { useState, useMemo } from "react";
import { Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const fmtDate = (d) => {
  if (!d) return "Date TBA";
  try { return new Date(d).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }); }
  catch { return ""; }
};
const fmtTime = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true }); }
  catch { return ""; }
};

const FALLBACK = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80";

const Scenes = () => {
  const navigate = useNavigate();
  const { getEvents, locationLabel, buildEventUrl, categoryItems } = useBrowse();

  const [selectedCat, setSelectedCat] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const allEvents = getEvents();

  const categoryNav = useMemo(() => {
    const cats = [{ slug: "all", label: "All Events", icon: "✨" }];
    categoryItems.forEach((category) => {
      if (allEvents.some((event) => event.category?.slug === category.slug)) {
        cats.push({
          slug: category.slug,
          label: category.label,
          icon: null,
          Icon: category.icon,
        });
      }
    });
    return cats;
  }, [allEvents, categoryItems]);

  const filtered = useMemo(() =>
    selectedCat === "all" ? allEvents : allEvents.filter((e) => e.category?.slug === selectedCat),
  [selectedCat, allEvents]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <section className="py-10 bg-background">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}>
            {locationLabel}'s Scene <span className="text-2xl">🤩</span>
          </h2>
          <button onClick={() => navigate("/browse")}
            className="text-xs font-semibold text-primary hover:text-primary/80 "
            style={{ fontFamily: "var(--font-sans)" }}>
            View all →
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4 mb-6 border-b border-border/50 no-scrollbar">
          {categoryNav.map(({ slug, label, Icon }) => {
            const active = selectedCat === slug;
            return (
              <button
                key={slug}
                onClick={() => { setSelectedCat(slug); setVisibleCount(8); }}
                className={`flex flex-col items-center gap-2 min-w-[64px] transition-all cursor-pointer group ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <div className={`w-12 h-12 rounded-sm flex items-center justify-center transition-all border ${active ? "bg-primary/10 border-primary/30" : "bg-secondary/20 border-transparent group-hover:bg-secondary/40"}`}>
                  {Icon ? <Icon size={18} strokeWidth={1.5} /> : <span className="text-xl">✨</span>}
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap" style={{ fontFamily: "var(--font-sans)" }}>
                  {label}
                </span>
                {active && <div className="h-0.5 w-full bg-primary rounded-full -mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Event grid */}
        {visible.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-sm">
            <p className="text-muted-foreground text-sm">No events found for this category.</p>
            <button onClick={() => setSelectedCat("all")} className="mt-3 text-xs text-primary hover:underline">
              Show all events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visible.map((ev) => (
              <div key={ev._id} className="group cursor-pointer"
                onClick={() => navigate(buildEventUrl(ev))}>
                <div className="relative aspect-video rounded-sm overflow-hidden mb-3 bg-muted ">
                  <img
                    src={ev.coverImage || ev.images?.[0] || FALLBACK}
                    alt={ev.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = FALLBACK; }}
                  />
                  {ev.isFeatured && (
                    <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm"
                      style={{ background: "var(--color-brand-primary)", color: "var(--primary-foreground, #1a2e05)" }}>
                      Featured
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--color-brand-primary)", fontFamily: "var(--font-sans)" }}>
                    {fmtDate(ev.startDate)}{ev.startDate ? ` · ${fmtTime(ev.startDate)}` : ""}
                  </p>
                  <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2"
                    style={{ fontFamily: "var(--font-heading)" }}>
                    {ev.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: "var(--font-sans)" }}>
                    {ev.location?.name || ev.location?.city}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    {ev.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                          {ev.averageRating} · {(ev.totalSold || 0).toLocaleString()}+ attending
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-bold text-foreground ml-auto" style={{ fontFamily: "var(--font-heading)" }}>
                      {ev.isFree ? "Free" : `${ev.currency || "BDT"} ${(ev.minPrice || 0).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more */}
        {filtered.length > visibleCount && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((p) => p + 8)}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-sm bg-card font-bold text-sm text-foreground hover:bg-accent transition-all"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              View More <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default Scenes;
