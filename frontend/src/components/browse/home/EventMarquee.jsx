// frontend/src/components/home/EventMarquee.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const EventMarquee = () => {
  const navigate = useNavigate();
  const { getFeatured, getTrending, getNewArrivals, buildEventUrl } = useBrowse();

  // Build 3 rows from real data
  const featured    = getFeatured();
  const trending    = getTrending();
  const newArrivals = getNewArrivals();

  const rows = [
    { events: featured,    speed: "[animation-duration:100s]", rev: false },
    { events: trending,    speed: "[animation-duration:130s]", rev: true  },
    { events: newArrivals, speed: "[animation-duration:160s]", rev: false },
  ].filter((r) => r.events.length > 0);

  if (!rows.length) return null;

  const MarqueeTrack = ({ events, speedClass, reverse }) => {
    const animClass = reverse ? "animate-marquee-right" : "animate-marquee-left";
    // Duplicate so track never runs dry
    const display = [...events, ...events, ...events, ...events];
    const FALLBACK = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80";

    return (
      <div className="flex overflow-hidden py-1 select-none">
        <div className={`flex gap-2 shrink-0 ${animClass} ${speedClass}`}>
          {display.map((ev, i) => (
            <div
              key={`${ev._id}-${i}`}
              onClick={() => navigate(buildEventUrl(ev))}
              className="group relative w-64 md:w-[420px] aspect-video shrink-0 overflow-hidden rounded-sm cursor-pointer"
            >
              <img
                src={ev.coverImage || ev.images?.[0] || FALLBACK}
                alt={ev.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
                onError={(e) => { e.target.src = FALLBACK; }}
              />
              <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-4">
                <p className="text-foreground font-sans font-medium text-[10px] md:text-xs uppercase tracking-[0.2em] text-center px-4">
                  {ev.title}
                </p>
                <div className="mt-3 text-[9px] font-mono text-muted-foreground uppercase">
                  {ev.location?.name || ev.location?.city} —{" "}
                  {ev.isFree ? "Free" : `${ev.currency || "BDT"} ${(ev.minPrice || 0).toLocaleString()}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-background py-16 md:py-20">
      <Container>
        <div className="flex flex-col mb-10 border-l border-foreground/10 pl-6">
          <h2 className="text-3xl md:text-4xl text-foreground font-bold uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-heading)" }}>
            Events in the Spotlight
          </h2>
          <button
            onClick={() => navigate("/browse")}
            className="text-[9px] font-mono text-muted-foreground hover:text-foreground mt-2  uppercase tracking-widest text-left"
          >
            Explore all listings →
          </button>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <MarqueeTrack key={i} events={row.events} speedClass={row.speed} reverse={row.rev} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EventMarquee;
