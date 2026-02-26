import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { serviceTypes } from "@/data/serviceTypes";
import Container from "@/components/layout/Container";

const EventMarquee = () => {
  const navigate = useNavigate();

  const getRowData = (id) => {
    const service = serviceTypes.find((s) => s.id === id);
    if (!service) return [];
    return (
      service.categories.flatMap((cat) =>
        cat.subcategories.flatMap((sub) =>
          sub.events.map((event) => ({
            ...event,
            serviceId: service.id,
            catId: cat.id,
            subId: sub.id,
          })),
        ),
      ) || []
    );
  };

  const rows = [
    {
      data: getRowData("entertainment"),
      speed: "[animation-duration:120s]",
      rev: false,
    },
    {
      data: getRowData("sports"),
      speed: "[animation-duration:150s]",
      rev: true,
    },
    {
      data: getRowData("travel"),
      speed: "[animation-duration:180s]",
      rev: false,
    },
  ];

  const MarqueeTrack = ({ events, speedClass, reverse }) => {
    const animationClass = reverse
      ? "animate-marquee-right"
      : "animate-marquee-left";
    const displayEvents = [...events, ...events, ...events, ...events];

    return (
      <div className="flex overflow-hidden py-1 select-none relative">
        <div className={`flex gap-2 shrink-0 ${animationClass} ${speedClass}`}>
          {displayEvents.map((event, idx) => (
            <div
              key={`${event.id}-${idx}`}
              onClick={() =>
                navigate(
                  `/browse/${event.serviceId}/c/${event.catId}/s/${event.subId}/event/${event.id}`,
                )
              }
              className="group relative w-64 md:w-[420px] aspect-video shrink-0 overflow-hidden rounded-sm cursor-pointer"
            >
              {/* Raw Image - Grayscale by default for minimalism */}
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
              />

              {/* Minimal Hover Overlay */}
              <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-4">
                <p className="text-foreground font-sans font-medium text-[10px] md:text-xs uppercase tracking-[0.2em] text-center px-4">
                  {event.title}
                </p>
                <div className="mt-4 text-[9px] font-mono text-muted-foreground uppercase">
                  {event.venue} — ${event.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-background py-20">
      <Container className="mx-auto px-4 relative">
        {/* Minimal Header */}
        <div className="flex flex-col mb-12 border-l border-foreground/10 pl-6">
          <h2 className="text-4xl text-foreground font-bold uppercase tracking-[0.2em]">
            Flagship Events in Review
          </h2>
          <Link
            to="/browse"
            className="text-[9px] font-mono text-muted-foreground hover:text-foreground mt-2 transition-colors uppercase tracking-widest"
          >
            Explore all listings
          </Link>
        </div>

        {/* The Motion Wall */}
        <div className="relative">
          {/* Subtle Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <MarqueeTrack
                key={i}
                events={row.data.slice(0, 10)}
                speedClass={row.speed}
                reverse={row.rev}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EventMarquee;
