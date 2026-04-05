// frontend/src/components/browse/sections/MapSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";
import { useBrowse } from "@/hooks";

// Map placeholder — in production replace with react-leaflet or Google Maps
const MapPlaceholder = ({ locationLabel, eventCount }) => (
  <div className="relative w-full rounded-lg border border-border overflow-hidden bg-secondary/10" style={{ height: "320px" }}>
    {/* Decorative grid lines */}
    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    {/* Center pin */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary animate-pulse">
        <MapPin size={22} className="text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{locationLabel}</p>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{eventCount} events near you</p>
      </div>
      <p className="text-[10px] text-muted-foreground border border-border rounded px-2 py-1 bg-background/70" style={{ fontFamily: "var(--font-sans)" }}>
        Interactive map coming soon · Install react-leaflet to enable
      </p>
    </div>
    {/* Fake scatter dots */}
    {[{x:20,y:30},{x:65,y:20},{x:40,y:55},{x:80,y:65},{x:15,y:70},{x:55,y:75}].map((p, i) => (
      <div key={i} className="absolute w-3 h-3 rounded-full bg-primary/60 border border-primary animate-pulse"
        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i*0.2}s` }} />
    ))}
  </div>
);

const MapSection = () => {
  const { getNearby, locationLabel, locationFlag, config, level, buildEventUrl } = useBrowse();
  const events = getNearby();
  const title = level === "root" ? `Events Map — ${locationLabel}` : `${config.label} Map`;

  if (!events.length) {
    return null;
  }

  return (
    <section className="w-full bg-background" aria-label="Events map">
      <div className="content-shell">
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
              <Navigation size={13} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{locationFlag} {events.length} events near you in {locationLabel}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <MapPlaceholder locationLabel={locationLabel} eventCount={events.length} />
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {events.slice(0, 6).map((e) => (
                <Link key={e.id} to={buildEventUrl(e)}
                  className="group flex items-center gap-2.5 p-2.5 rounded-md border border-border bg-card hover:border-foreground/20 hover:bg-accent/20 transition-all">
                  <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-muted">
                    <img src={e.coverImage} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(x) => x.target.style.display="none"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:underline" style={{ fontFamily: "var(--font-heading)" }}>
                      {e.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                      <MapPin size={8} /><span className="truncate">{e.location?.name || e.location?.city || "Venue TBA"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground shrink-0" style={{ fontFamily: "var(--font-heading)" }}>{e.priceLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </div>
    </section>
  );
};

export default MapSection;
