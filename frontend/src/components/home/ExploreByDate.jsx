import React, { useState, useRef, useMemo } from "react";
import { Calendar, MapPin, Ticket, Clock, Radio } from "lucide-react";
import Container from "@/components/layout/Container";

const ExploreByDate = () => {
  const [activeTab, setActiveTab] = useState("Today");
  const [customDateDisplay, setCustomDateDisplay] = useState("Pick Date");
  const dateInputRef = useRef(null);

  // 1. Mock Data - Representing your MongoDB entries
  const allEvents = [
    {
      id: 1,
      title: "Dhaka Rock Fest",
      date: "2026-02-21",
      price: "৳1200",
      location: "Hatirjheel",
      category: "Music",
      image:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500",
    },
    {
      id: 2,
      title: "Tech Summit 2026",
      date: "2026-02-21",
      price: "Free",
      location: "ICC Purbachal",
      category: "Tech",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500",
    },
    {
      id: 3,
      title: "Art & Soul Expo",
      date: "2026-02-22",
      price: "৳500",
      location: "Dhanmondi",
      category: "Art",
      image:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500",
    },
    {
      id: 4,
      title: "Comedy Night Live",
      date: "2026-02-22",
      price: "৳800",
      location: "Banani",
      category: "Comedy",
      image:
        "https://images.unsplash.com/photo-1514525253344-f81bad3b7c2a?w=500",
    },
    {
      id: 5,
      title: "Startup Weekend",
      date: "2026-02-23",
      price: "৳1500",
      location: "Gulshan",
      category: "Business",
      image:
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500",
    },
    {
      id: 6,
      title: "Underground HipHop",
      date: "2026-02-27",
      price: "৳1000",
      location: "Uttara",
      category: "Music",
      image:
        "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500",
    },
  ];

  const dateFilters = [
    { title: "Today", label: "Feb 21" },
    { title: "Tomorrow", label: "Feb 22" },
    { title: "This Weekend", label: "Feb 21-23" },
    { title: "Next Week", label: "Feb 24+" },
    { title: "Custom Date", label: customDateDisplay, isCustom: true },
  ];

  // 2. Filtering Logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (activeTab === "Today") return event.date === "2026-02-21";
      if (activeTab === "Tomorrow") return event.date === "2026-02-22";
      if (activeTab === "This Weekend")
        return ["2026-02-21", "2026-02-22", "2026-02-23"].includes(event.date);
      if (activeTab === "Next Week") return event.date > "2026-02-23";
      if (activeTab === "Custom Date" && customDateDisplay !== "Pick Date") {
        // Logic for custom date selection would go here
        return true;
      }
      return true;
    });
  }, [activeTab, customDateDisplay]);

  const handleCardClick = (item) => {
    if (item.isCustom) {
      dateInputRef.current.showPicker();
    } else {
      setActiveTab(item.title);
      setCustomDateDisplay("Pick Date");
    }
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-background transition-colors duration-500">
      <Container>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">
            Explore events by <span className="text-primary italic">date</span>
          </h2>
          <div className="h-px flex-1 bg-border/40 ml-8 hidden md:block"></div>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {dateFilters.map((item, index) => (
            <div key={index} className="relative">
              {item.isCustom && (
                <input
                  type="date"
                  ref={dateInputRef}
                  onChange={(e) => {
                    const d = e.target.value;
                    setCustomDateDisplay(
                      new Date(d).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }),
                    );
                    setActiveTab("Custom Date");
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
              )}
              <button
                onClick={() => handleCardClick(item)}
                className={`w-full group relative overflow-hidden rounded-2xl border transition-all duration-500 p-6 h-36 flex flex-col justify-between text-left
                  ${activeTab === item.title ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" : "bg-card/50 border-border/50 hover:border-primary/50"}`}
              >
                <div className="relative z-10">
                  <h3
                    className={`text-xl font-bold font-heading ${activeTab === item.title ? "text-primary" : "text-foreground"}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.label}
                  </p>
                </div>
                <Calendar
                  size={32}
                  className={`self-end transition-all duration-500 ${activeTab === item.title ? "text-primary rotate-12 scale-110" : "text-muted/30 group-hover:text-primary/40"}`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Results Section */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <Radio size={18} className="text-primary animate-pulse" />
            <h3 className="text-xl font-bold">Available Events</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group bg-card rounded-[2rem] border border-border/50 overflow-hidden hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={14} /> {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={14} /> {event.date}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-foreground">
                        {event.price}
                      </span>
                      <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all">
                        <Ticket size={14} /> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-[3rem]">
                <p className="text-muted-foreground font-medium">
                  No events found for this selection.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ExploreByDate;
