// src/components/OnlineEventsSection.jsx
import Container from "@/components/layout/Container";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const OnlineEventsSection = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "weekend", label: "This Weekend" },
    { id: "month", label: "This Month" },
  ];

  const onlineEvents = [
    {
      id: 1,
      day: "Fri",
      date: "19",
      month: "Jun",
      time: "04:00 AM",
      title: "Virtual Yoga & Meditation Summit",
      organizer: "Wellness Online",
      location: "Zoom • Online",
      interested: 7938,
      category: "Wellness",
      link: "/online-events/yoga-summit",
      icon: "🧘",
    },
    {
      id: 2,
      day: "Thu",
      date: "26",
      month: "Feb",
      time: "09:00 AM",
      title: "Global e-Commerce Expo-2025",
      organizer: "Digital Trade Association",
      location: "Virtual Platform • Online",
      interested: 1090,
      category: "Business",
      link: "/online-events/ecommerce-expo",
      icon: "🛍️",
    },
    {
      id: 3,
      day: "Wed",
      date: "18",
      month: "Mar",
      time: "10:00 AM",
      title: "Chaa Draat Fest by Priyanka's Events",
      organizer: "Priyanka's Events",
      location: "Live Stream • Online",
      interested: 366,
      category: "Festival",
      link: "/online-events/chaa-draat",
      icon: "🎉",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-background transition-colors duration-300">
      <Container>
        {/* Header - Left Aligned with Lime Green */}
        <div className="mb-10 border-l-4 border-lime-500 pl-5">
          <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter leading-none">
            Popular <span className="text-lime-500">Online</span> Events
          </h2>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Join from anywhere in the world
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border ${
                activeFilter === filter.id
                  ? "bg-lime-500 border-lime-500 text-black"
                  : "bg-card border-border text-muted-foreground hover:border-lime-500/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Online Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {onlineEvents.map((event) => (
            <Link
              key={event.id}
              to={event.link}
              className="group bg-card rounded-[2rem] border border-border overflow-hidden hover:border-lime-500/40 transition-all duration-300 flex flex-col p-6 shadow-sm"
            >
              {/* Date and Time Row - Mini Labels 10px */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-4">
                <span className="text-lime-500">●</span>
                <span>
                  {event.day}, {event.date} {event.month}
                </span>
                <span>•</span>
                <span>{event.time}</span>
              </div>

              {/* Title and Icon - Event Title 20px (text-xl) */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-lime-500/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-lime-500/20 transition-colors">
                  {event.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase leading-tight group-hover:text-lime-500 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tight">
                    By {event.organizer}
                  </p>
                </div>
              </div>

              {/* Online Location Badge - Mini Labels 9px/10px */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-500/20">
                  🌐 Virtual Event
                </span>
                <span className="text-[10px] font-bold text-muted-foreground truncate">
                  {event.location}
                </span>
              </div>

              {/* Footer Row */}
              <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                  <span className="text-lime-500">★</span>
                  {event.interested.toLocaleString()} Interested
                </div>

                {/* Live Badge for specific event */}
                {event.id === 1 && (
                  <span className="text-[9px] font-black bg-red-500 text-white px-2.5 py-1 rounded-md animate-pulse">
                    LIVE NOW
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/online-events"
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-lime-500 hover:text-black transition-all"
          >
            Explore All Online Events
            <span className="text-lg">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default OnlineEventsSection;
