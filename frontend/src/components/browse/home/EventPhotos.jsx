// src/components/EventPhotos.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";

const EventPhotos = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Photos" },
    { id: "concerts", label: "Concerts" },
    { id: "sports", label: "Sports" },
    { id: "festivals", label: "Festivals" },
    { id: "workshops", label: "Workshops" },
  ];

  const photoCategories = [
    {
      id: "concerts",
      name: "Concerts",
      photos: [
        {
          id: 1,
          title: "Rock Night 2026",
          image:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
          likes: 234,
          comments: 12,
          eventId: "rock-night",
        },
        {
          id: 2,
          title: "Jazz Festival Live",
          image:
            "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600",
          likes: 189,
          comments: 8,
          eventId: "jazz-fest",
        },
      ],
    },
    {
      id: "sports",
      name: "Sports",
      photos: [
        {
          id: 4,
          title: "Stadium Finals",
          image:
            "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=600",
          likes: 567,
          comments: 34,
          eventId: "football-final",
        },
      ],
    },
    // ... baki data same thakbe
  ];

  const allPhotos = photoCategories.flatMap((category) =>
    category.photos.map((photo) => ({ ...photo, categoryName: category.name })),
  );

  const displayedPhotos =
    activeFilter === "all"
      ? allPhotos
      : photoCategories
          .find((c) => c.id === activeFilter)
          ?.photos.map((photo) => ({
            ...photo,
            categoryName: photoCategories.find((c) => c.id === activeFilter)
              ?.name,
          })) || [];

  return (
    <section className="py-16 bg-background transition-colors duration-300">
      <Container>
        {/* Header - Left Aligned with Specs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-l-4 border-lime-500 pl-5">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter leading-none">
              Captured <span className="text-lime-500">Moments</span>
            </h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Live Gallery Update 2026
            </p>
          </div>
          <Link
            to="/gallery"
            className="flex items-center gap-2 text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-lime-500 transition-colors pb-1"
          >
            Full Archive <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filter Tabs - Mini Labels 9px/10px */}
        <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${
                activeFilter === filter.id
                  ? "bg-lime-500 border-lime-500 text-black"
                  : "bg-card border-border text-muted-foreground hover:border-lime-500/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedPhotos.slice(0, 8).map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <Link
                to={`/event/${photo.eventId}/photos`}
                className="block w-full h-full"
              >
                <div className="w-full h-full bg-card rounded-[2rem] overflow-hidden border border-border relative shadow-sm group-hover:border-lime-500/30 transition-all">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent p-6 flex flex-col justify-end">
                    <span className="text-[9px] font-black text-lime-500 uppercase tracking-[0.2em] mb-1">
                      {photo.categoryName}
                    </span>
                    {/* Event Title - text-xl (20px) as requested */}
                    <h3 className="text-foreground text-xl font-black uppercase leading-tight mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.title}
                    </h3>

                    <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-black">
                      <span className="flex items-center gap-1.5">
                        <Heart
                          size={12}
                          className="text-red-500 fill-red-500"
                        />
                        {photo.likes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-lime-500" />
                        {photo.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default EventPhotos;
