// frontend/src/components/home/EventsYouMayLike.jsx
import React, { useState } from "react";
import { MapPin, Calendar, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const FALLBACK = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80";

const fmtDate = (d) => {
  if (!d) return "Date TBA";
  try { return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }
  catch { return ""; }
};

const EventsYouMayLike = () => {
  const navigate = useNavigate();
  const { getRecommended, getFeatured, buildEventUrl, locationLabel } = useBrowse();

  // Recommended first; fall back to featured if none
  const recommended = getRecommended();
  const events = (recommended.length ? recommended : getFeatured()).slice(0, 3);

  if (!events.length) return null;

  // Simulate a match % based on trendScore
  const matchPct = (ev) => ev.trendScore ? `${Math.min(99, Math.round(50 + ev.trendScore / 2))}%` : "90%";

  return (
    <section className="py-12 bg-background">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-2"
              style={{ fontFamily: "var(--font-heading)" }}>
              Events You <span style={{ color: "var(--color-brand-primary)" }}>May Like</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 rounded-full" style={{ background: "var(--color-brand-primary)" }} />
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest"
                style={{ fontFamily: "var(--font-sans)" }}>
                Personalised for {locationLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/browse")}
            className="px-5 py-2 text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background  rounded-sm"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            See Everything →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-card rounded-sm overflow-hidden flex flex-col cursor-pointer group hover:shadow-md transition-all"
              onClick={() => navigate(buildEventUrl(ev))}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={ev.coverImage || ev.images?.[0] || FALLBACK}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  onError={(e) => { e.target.src = FALLBACK; }}
                />
                {/* Match badge */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-background/75 backdrop-blur-md rounded-full">
                    <Zap size={11} style={{ color: "var(--color-brand-primary)" }} className="fill-current" />
                    <span className="text-[9px] font-black text-foreground uppercase tracking-tight">
                      {matchPct(ev)} Match
                    </span>
                  </div>
                </div>
                {/* Category */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-sm"
                    style={{ background: "var(--color-brand-primary)", color: "var(--primary-foreground, #1a2e05)" }}>
                    {ev.category?.name || "Event"}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-black text-foreground uppercase leading-tight mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}>
                  {ev.title}
                </h3>
                <div className="space-y-2 mb-5 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} style={{ color: "var(--color-brand-primary)" }} />
                    <span className="text-xs font-bold uppercase tracking-tight"
                      style={{ fontFamily: "var(--font-sans)" }}>
                      {fmtDate(ev.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} style={{ color: "var(--color-brand-primary)" }} />
                    <span className="text-xs font-bold uppercase tracking-tight truncate"
                      style={{ fontFamily: "var(--font-sans)" }}>
                      {ev.location?.name || ev.location?.city || locationLabel}
                    </span>
                  </div>
                  {ev.totalSold > 0 && (
                    <div className="flex items-center gap-2">
                      <Users size={13} style={{ color: "var(--color-brand-primary)" }} />
                      <span className="text-xs font-bold uppercase tracking-tight"
                        style={{ fontFamily: "var(--font-sans)" }}>
                        {ev.totalSold.toLocaleString()} attending
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase block mb-0.5">Price</span>
                    <span className="text-base font-black"
                      style={{ color: ev.isFree ? "var(--color-brand-primary)" : "var(--foreground)", fontFamily: "var(--font-heading)" }}>
                      {ev.isFree ? "Free" : `${ev.currency || "BDT"} ${(ev.minPrice || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <button className="px-4 py-2 bg-foreground text-background font-black text-[10px] uppercase tracking-tight rounded-sm hover:opacity-90 transition-opacity"
                    style={{ fontFamily: "var(--font-sans)" }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default EventsYouMayLike;
