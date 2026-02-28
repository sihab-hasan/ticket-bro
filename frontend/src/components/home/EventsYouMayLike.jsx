// src/components/EventsYouMayLike.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Zap } from "lucide-react";
import Container from "@/components/layout/Container";

const EventsYouMayLike = () => {
  const recommendedEvents = [
    {
      id: 1,
      title: "Digital Marketing Masterclass",
      date: "Mar 15, 2026",
      time: "10:00 AM",
      location: "Online (Zoom)",
      price: "Free",
      category: "Workshop",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=500",
      attendees: 234,
      match: "95%",
    },
    {
      id: 2,
      title: "Photography Workshop",
      date: "Mar 18, 2026",
      time: "2:00 PM",
      location: "Dhanmondi Lake",
      price: "$25",
      category: "Arts",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=500",
      attendees: 89,
      match: "92%",
    },
    {
      id: 3,
      title: "Startup Networking Mixer",
      date: "Mar 20, 2026",
      time: "6:30 PM",
      location: "Gulshan 2",
      price: "$15",
      category: "Networking",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=500",
      attendees: 156,
      match: "88%",
    },
  ];

  return (
    <section className="py-16 bg-background transition-colors duration-300">
      <Container>
        {/* Section Header - Font size reduced here */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-foreground  uppercase tracking-tighter leading-none mb-3">
              Events You <span className="text-lime-500">May Like</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="h-1 w-16 bg-lime-500 rounded-full"></div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                AI Personalized for you
              </p>
            </div>
          </div>
          <Link
            to="/recommendations"
            className="px-5 py-2.5 border border-border text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            See Everything →
          </Link>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-card border border-border rounded-[2rem] overflow-hidden flex flex-col shadow-sm"
            >
              {/* Card Top - Image Area */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-background/70 backdrop-blur-md border border-border rounded-full">
                    <Zap size={12} className="text-lime-500 fill-lime-500" />
                    <span className="text-[9px] font-black text-foreground uppercase tracking-tighter">
                      {event.match} Match
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent">
                  <span className="px-2.5 py-1 bg-lime-500 text-black text-[9px] font-black uppercase rounded-md">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1">
                {/* Event Title - Size reduced from 2xl to xl */}
                <h3 className="text-xl font-black text-foreground uppercase leading-tight mb-5 min-h-[2.5rem]">
                  {event.title}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar size={16} className="text-lime-500" />
                    <span className="text-[13px] font-bold uppercase tracking-tight">
                      {event.date} • {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <MapPin size={16} className="text-lime-500" />
                    <span className="text-[13px] font-bold uppercase tracking-tight truncate">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Users size={16} className="text-lime-500" />
                    <span className="text-[13px] font-bold uppercase tracking-tight">
                      {event.attendees} Attending
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase block mb-0.5">
                      Price
                    </span>
                    <span
                      className={`text-lg font-black ${event.price === "Free" ? "text-lime-500" : "text-foreground"}`}
                    >
                      {event.price}
                    </span>
                  </div>
                  <Link
                    to={`/event/${event.id}`}
                    className="px-5 py-2.5 bg-foreground text-background font-black text-[10px] uppercase tracking-tighter rounded-xl hover:opacity-90"
                  >
                    View Details
                  </Link>
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
