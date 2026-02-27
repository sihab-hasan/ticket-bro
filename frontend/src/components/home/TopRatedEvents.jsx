import React, { useState, useMemo } from "react";
import { Star, TrendingUp, ArrowRight, ChevronDown } from "lucide-react";
import Container from "@/components/layout/Container";

const TopRatedEvents = () => {
  const [showAll, setShowAll] = useState(false);

  // Expanded unique data pool
  const allTopEvents = useMemo(
    () => [
      {
        id: 1,
        rank: 1,
        title: "Coke Studio Bangla Live",
        rating: 4.9,
        reviews: "2.4k",
        category: "Music",
        price: "From $1500",
      },
      {
        id: 2,
        rank: 2,
        title: "Dhaka International Art Biennale",
        rating: 4.8,
        reviews: "1.1k",
        category: "Exhibitions",
        price: "Free",
      },
      {
        id: 3,
        rank: 3,
        title: "Underground Comedy Roast",
        rating: 4.7,
        reviews: "850",
        category: "Comedy",
        price: "$400",
      },
      {
        id: 4,
        rank: 4,
        title: "Tech Expo 2026",
        rating: 4.6,
        reviews: "2.1k",
        category: "Business",
        price: "Free",
      },
      {
        id: 5,
        rank: 5,
        title: "Dhaka Lit Fest Night",
        rating: 4.6,
        reviews: "900",
        category: "Performances",
        price: "$300",
      },
      {
        id: 6,
        rank: 6,
        title: "Street Food Carnival",
        rating: 4.5,
        reviews: "3.2k",
        category: "Food & Drinks",
        price: "Free",
      },
    ],
    [],
  );

  // Determine which events to show
  const displayEvents = showAll ? allTopEvents : allTopEvents.slice(0, 3);

  return (
    <section className="py-16 px-4 md:px-8 bg-background transition-all duration-700">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-amber-400" size={20} />
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest font-sans">
                Dhaka's Favorites
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              Top Rated Events
            </h2>
          </div>

          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
            >
              View All Leaderboard
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          )}
        </div>

        {/* Top Rated Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents.map((event, idx) => (
            <div
              key={event.id}
              className="group relative flex flex-col bg-card/30 rounded-3xl border border-border/50 overflow-hidden hover:border-amber-400/50 transition-all duration-500 hover:-translate-y-2 shadow-xl animate-in fade-in zoom-in-95 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Ranking Badge */}
              <div className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center border border-amber-400/30 text-amber-400 font-bold font-heading shadow-lg">
                #{event.rank}
              </div>

              {/* Blank Image Placeholder */}
              <div className="relative aspect-video bg-muted/50 border-b border-border/50 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <span className="text-muted-foreground font-sans text-[10px] uppercase tracking-widest opacity-40">
                  {event.category} Visual
                </span>
              </div>

              {/* Event Content */}
              <div className="p-6 space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold font-sans">
                      {event.rating}
                    </span>
                    <span className="text-muted-foreground text-[10px] ml-1">
                      ({event.reviews})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                    Verified Result
                  </span>
                </div>

                <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-amber-400 transition-colors line-clamp-1">
                  {event.title}
                </h3>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-foreground font-sans">
                    {event.price}
                  </span>
                  <button className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-amber-400 hover:text-background transition-all transform active:scale-95">
                    Tickets
                  </button>
                </div>
              </div>

              {/* Decorative Accent Glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-400/5 blur-[50px] group-hover:bg-amber-400/10 transition-all"></div>
            </div>
          ))}
        </div>

        {/* Collapse Button (Optional) */}
        {showAll && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-all font-bold cursor-pointer"
            >
              Show Less <ChevronDown size={18} />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default TopRatedEvents;
