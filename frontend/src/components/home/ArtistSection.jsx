import Container from "@/components/layout/Container";
import React, { useState, useMemo } from "react";

const ArtistSection = () => {
  const [activeTab, setActiveTab] = useState("Popular");

  const artists = useMemo(
    () => [
      { id: 101, name: "Arijit Singh", genre: "Music", sub: "Bollywood" },
      { id: 102, name: "Tahsan Khan", genre: "Music", sub: "Bangla Pop" },
      { id: 103, name: "Shreya Ghoshal", genre: "Music", sub: "Classical" },
      { id: 201, name: "Naveed Mahbub", genre: "Comedy", sub: "Stand-up" },
      { id: 202, name: "Zakir Khan", genre: "Comedy", sub: "Storytelling" },
      { id: 301, name: "Arnob", genre: "Performances", sub: "Folk-Fusion" },
      { id: 302, name: "Lalon Band", genre: "Performances", sub: "Folk Rock" },
      {
        id: 401,
        name: "Fahim Mashroor",
        genre: "Business",
        sub: "Entrepreneur",
      },
      { id: 402, name: "Ayman Sadiq", genre: "Business", sub: "Educationist" },
    ],
    [],
  );

  const categories = ["Popular", "Music", "Comedy", "Performances", "Business"];

  const displayArtists = useMemo(() => {
    if (activeTab === "Popular") {
      return [artists[0], artists[3], artists[5], artists[7]];
    }
    return artists.filter((a) => a.genre === activeTab);
  }, [activeTab, artists]);

  return (
    <section className="py-12 px-6 bg-background">
      <Container>
        <h2 className="text-3xl font-bold font-heading mb-8 text-foreground">
          Artists on tour near Dhaka
        </h2>

        <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar scroll-smooth border-b border-border/40 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap cursor-pointer
                ${
                  activeTab === cat
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {displayArtists.map((artist) => (
            <div
              key={artist.id}
              className="flex flex-col items-center group animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              {/* Blank Placeholder Image */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center group-hover:border-primary transition-all overflow-hidden">
                <span className="text-muted-foreground text-xs font-sans">
                  No Image
                </span>
              </div>

              <h3 className="text-base font-bold font-heading text-center leading-tight mb-1">
                {artist.name}
              </h3>
              <p className="text-xs font-sans text-muted-foreground mb-4">
                {artist.sub}
              </p>

              <button className="px-6 py-1.5 rounded-full border border-border bg-background text-xs font-bold transition-all hover:bg-foreground hover:text-background">
                Follow
              </button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default ArtistSection;
