// frontend/src/components/home/LiveNearYou.jsx
import React from "react";
import { MapPin, Navigation, Bell, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const FALLBACK = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80";

const LiveNearYou = () => {
  const navigate = useNavigate();
  const { getNearby, getUpcoming, buildEventUrl, locationLabel } = useBrowse();

  // Nearby events are "live / very close"; upcoming fills the rest
  const nearby   = getNearby().slice(0, 2);
  const upcoming = getUpcoming().slice(0, 2);

  // Tag nearby events as live, upcoming as… upcoming
  const events = [
    ...nearby.map((e) => ({ ...e, _isLive: true })),
    ...upcoming.map((e) => ({ ...e, _isLive: false })),
  ].slice(0, 4);

  if (!events.length) return null;

  const fmtDate = (d) => {
    if (!d) return "Date TBA";
    try { return new Date(d).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }); }
    catch { return ""; }
  };

  return (
    <section className="py-10 bg-background">
      <Container>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1"
              style={{ fontFamily: "var(--font-brand)" }}>
              Ticket Bro Proximity
            </p>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Near <span className="text-primary italic">You</span>
            </h2>
          </div>
          <button onClick={() => navigate("/browse")}
            className="text-xs font-semibold text-primary hover:text-primary/80 "
            style={{ fontFamily: "var(--font-sans)" }}>
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              onClick={() => navigate(buildEventUrl(ev))}
              className={`group relative p-4 rounded-sm border transition-all duration-300 cursor-pointer ${
                ev._isLive
                  ? "bg-primary/[0.03] border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                  : "bg-card/50 border-border/50 hover:border-primary/20"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-32 rounded-sm overflow-hidden mb-3 bg-muted">
                <img
                  src={ev.coverImage || ev.images?.[0] || FALLBACK}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  onError={(e) => { e.target.src = FALLBACK; }}
                />
                <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${ev._isLive ? "bg-red-500 text-white" : "bg-black/50 text-white"}`}>
                  {ev._isLive && <Radio size={9} className="animate-pulse" />}
                  {ev._isLive ? "Live" : "Upcoming"}
                </div>
              </div>

              <h3 className="font-bold text-foreground text-sm leading-tight mb-1 line-clamp-2"
                style={{ fontFamily: "var(--font-heading)" }}>
                {ev.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1 truncate"
                style={{ fontFamily: "var(--font-sans)" }}>
                <MapPin size={10} /> {ev.location?.name || ev.location?.city || locationLabel}
              </p>

              <div className="pt-3 border-t border-border/50">
                {ev._isLive ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.title)}`); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-sm text-[11px] font-bold transition-all"
                    style={{ background: "var(--color-brand-primary)", color: "var(--primary-foreground, #1a2e05)" }}
                  >
                    <Navigation size={11} /> Open in Maps
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                      {fmtDate(ev.startDate)}
                    </span>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-sm "
                    >
                      <Bell size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default LiveNearYou;
