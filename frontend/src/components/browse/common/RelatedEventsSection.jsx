// frontend/src/components/browse/sections/RelatedEventsSection.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, MapPin, Star, BadgeCheck, BookmarkCheck, Bookmark } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const RelatedEventsSection = () => {
  const { getEvents, categorySlug, buildEventUrl, locationLabel, config } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const toggle = (id) => setSavedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const events = getEvents().slice(0, 4);
  if (!events.length) return null;
  return (
    <section className="w-full bg-background" aria-label="Related events">
      <Container>
        <div className="py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              More {config.label} Events
            </h2>
            <Link to={categorySlug ? `/${categorySlug}` : "/browse"}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 "
              style={{ fontFamily: "var(--font-sans)" }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((e) => (
              <Link key={e.id} to={buildEventUrl(e)}
                className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all">
                <div className="relative h-36 overflow-hidden bg-muted shrink-0">
                  <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" onError={(x) => x.target.style.display="none"} />
                  <button onClick={(ev) => { ev.preventDefault(); toggle(e.id); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm">
                    {savedIds.has(e.id) ? <BookmarkCheck size={12} className="text-white" /> : <Bookmark size={12} className="text-white" />}
                  </button>
                  {e.price === 0 && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-brand)" }}>Free</span>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-2 group-hover:underline" style={{ fontFamily: "var(--font-heading)" }}>
                    {e.title}{e.verified && <BadgeCheck size={10} className="inline ml-1" />}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                    <Calendar size={9} /><span>{e.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                    <MapPin size={9} /><span className="truncate">{e.venue}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-border mt-auto">
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-foreground fill-foreground" />
                      <span className="text-[11px] font-semibold" style={{ fontFamily: "var(--font-sans)" }}>{e.rating}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ fontFamily: "var(--font-heading)" }}>{e.priceLabel}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default RelatedEventsSection;
