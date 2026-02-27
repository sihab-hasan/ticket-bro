import React, { useState, useMemo } from "react";
import { Star, ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";

const Scenes = ({ city = "Dhaka" }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(4);

  // 1. Corrected & Categorized Event Data
  const uniqueEvents = useMemo(
    () => [
      {
        id: 1,
        category: "Education",
        title: "STEM Scholarships Application Day for Women's | AHZ",
        date: "Sun, 08 Mar",
        time: "11:00 AM",
        venue: "AHZ Gulshan, Dhaka",
        interested: 850,
        price: "Free",
        image:
          "https://images.unsplash.com/photo-1523240715632-d984bb4ad950?w=600&q=80",
      },
      {
        id: 2,
        category: "Music",
        title: "Winter Music Festival 2026",
        date: "Sat, 12 Dec",
        time: "03:00 PM",
        venue: "Army Stadium, Dhaka",
        interested: 5600,
        price: 1200,
        image:
          "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=600&q=80",
      },
      {
        id: 3,
        category: "Comedy",
        title: "Dhaka Stand-up Night: Uncut",
        date: "Thu, 26 Feb",
        time: "08:00 PM",
        venue: "BICC, Dhaka",
        interested: 1090,
        price: 500,
        image:
          "https://images.unsplash.com/photo-1514525253361-b83f859b73c0?w=600&q=80",
      },
      {
        id: 4,
        category: "Performances",
        title: "Inspiring Bangladesh Half Marathon 2026",
        date: "Fri, 20 Nov",
        time: "05:00 AM",
        venue: "Hatirjheel Amphitheatre",
        interested: 644,
        price: 200,
        image:
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
      },
      {
        id: 5,
        category: "Business",
        title: "Startup Pitch Night & Networking",
        date: "Mon, 23 Nov",
        time: "06:00 PM",
        venue: "Kickstart Cafe, Dhaka",
        interested: 890,
        price: "Free",
        image:
          "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
      },
      {
        id: 6,
        category: "Exhibitions",
        title: "Dhaka Art Summit 2026",
        date: "Fri, 04 Dec",
        time: "11:00 AM",
        venue: "Bangladesh Shilpakala Academy",
        interested: 1800,
        price: "Free",
        image:
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=80",
      },
      {
        id: 7,
        category: "Food & Drinks",
        title: "Food Fest Dhaka 2026",
        date: "Sat, 21 Nov",
        time: "12:00 PM",
        venue: "Hatirjheel Food Court",
        interested: 4560,
        price: "Free",
        image:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
      },
      {
        id: 8,
        category: "Entrepreneurship",
        title: "Tech Summit 2026",
        date: "Wed, 25 Nov",
        time: "09:00 AM",
        venue: "ICCB, Dhaka",
        interested: 3200,
        price: 1500,
        image:
          "https://images.unsplash.com/photo-1540575861501-7ad0582373f2?w=600&q=80",
      },
    ],
    [],
  );

  // 2. Categories with Emojis
  const categoryNav = [
    { name: "All Events", icon: "✨" },
    { name: "Music", icon: "🎸" },
    { name: "Comedy", icon: "🎭" },
    { name: "Performances", icon: "🎪" },
    { name: "Business", icon: "💼" },
    { name: "Exhibitions", icon: "🖼️" },
    { name: "Food & Drinks", icon: "🍔" },
    { name: "Entrepreneurship", icon: "💡" },
    { name: "Education", icon: "🎓" },
  ];

  // 3. Filtering logic
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "all") return uniqueEvents;
    return uniqueEvents.filter((event) => event.category === selectedCategory);
  }, [selectedCategory, uniqueEvents]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMoreEvents = filteredEvents.length > visibleCount;

  return (
    <section className="py-12 px-4 md:px-8 bg-background">
      <Container>
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-3xl font-bold font-heading text-foreground">
            {city}'s Scene
          </h2>
          <span className="text-3xl">🤩</span>
        </div>

        {/* Emoji Navigation */}
        <div className="flex items-center gap-8 overflow-x-auto pb-6 mb-8 no-scrollbar border-b border-border/50">
          {categoryNav.map((cat) => {
            const isActive =
              (selectedCategory === "all" && cat.name === "All Events") ||
              selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(
                    cat.name === "All Events" ? "all" : cat.name,
                  );
                  setVisibleCount(4);
                }}
                className={`flex flex-col items-center gap-3 min-w-[80px] transition-all cursor-pointer group
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all
                  ${
                    isActive
                      ? "bg-primary/10 border-2 border-primary/20 shadow-sm"
                      : "bg-secondary/20 border border-transparent group-hover:bg-secondary/40"
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="text-sm font-medium font-sans whitespace-nowrap">
                  {cat.name}
                </span>
                {isActive && (
                  <div className="h-1 w-full bg-primary rounded-full mt-[-4px]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleEvents.map((event) => (
            <div key={event.id} className="group cursor-pointer">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-muted border border-border/50">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground transition-colors shadow-sm">
                  <Star size={18} />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-chart-1 uppercase tracking-widest font-sans">
                  {event.date} • {event.time}
                </p>
                <h3 className="text-base font-bold font-heading leading-tight line-clamp-2 text-foreground h-11">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground font-sans truncate">
                  {event.venue}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
                      >
                        <img
                          src={`https://i.pravatar.cc/100?u=${event.id + i}`}
                          alt="user"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium font-sans">
                    {event.interested.toLocaleString()}+ Interested
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-sm font-bold text-foreground">
                    {event.price === "Free" ? "Free" : `$${event.price}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        {hasMoreEvents && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="inline-flex items-center px-8 py-3 rounded-full border border-border bg-card font-bold text-foreground hover:bg-accent transition-all group cursor-pointer font-heading"
            >
              <span>View More Events</span>
              <ChevronRight
                size={20}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default Scenes;
