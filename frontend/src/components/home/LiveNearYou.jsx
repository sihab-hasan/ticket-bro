import React from "react";
import { MapPin, Navigation, Bell, ArrowRight, Radio } from "lucide-react";
import Container from "@/components/layout/Container";

const LiveNearYou = () => {
  const events = [
    {
      name: "Tech Carnival 2026",
      location: "ICC Purbachal, Dhaka",
      isLive: true,
      time: "Happening Now",
      type: "Conference",
      distance: "2.4 km away",
    },
    {
      name: "Art & Soul Exhibition",
      location: "Dhanmondi Gallery",
      isLive: false,
      time: "Starts at 6:00 PM",
      type: "Art Show",
    },
    {
      name: "Underground Rock Fest",
      location: "Banani Club",
      isLive: true,
      time: "Live: Stage 2",
      type: "Music",
      distance: "0.8 km away",
    },
    {
      name: "Startup Meetup",
      location: "Gulshan Hub",
      isLive: false,
      time: "Tomorrow, 10 AM",
      type: "Networking",
    },
  ];

  return (
    <section className="py-12 px-4 md:px-8 bg-background transition-colors duration-500">
      <Container>
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Ticket Bro Proximity
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Near <span className="text-primary italic">You</span>
            </h2>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {events.map((event, index) => (
            <div
              key={index}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 shadow-sm 
                ${
                  event.isLive
                    ? "bg-primary/[0.03] border-primary/30 shadow-primary/5 hover:shadow-primary/10"
                    : "bg-card/50 border-border/50 hover:border-primary/20"
                }`}
            >
              {/* Top Row: Status & Distance */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                    event.isLive
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500"
                  }`}
                >
                  {event.isLive && (
                    <Radio size={10} className="animate-pulse" />
                  )}
                  {event.isLive ? "Live" : "Upcoming"}
                </div>
                {event.isLive && (
                  <span className="text-[10px] font-bold text-primary italic animate-bounce">
                    {event.distance}
                  </span>
                )}
              </div>

              {/* Event Info */}
              <h3 className="font-bold text-foreground text-lg leading-tight mb-1">
                {event.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4 flex items-center gap-1">
                <MapPin size={10} /> {event.location}
              </p>

              {/* Action Area: Different for Live vs Upcoming */}
              <div className="pt-4 border-t border-border/50">
                {event.isLive ? (
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-[11px] font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    <Navigation size={12} fill="white" />
                    Open in Maps
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 italic">
                      {event.time}
                    </span>
                    <button className="p-2 bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <Bell size={14} />
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
