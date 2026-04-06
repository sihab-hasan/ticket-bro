// frontend/src/components/home/ArtistSection.jsx
// Note: Organizer/artist data doesn't exist in useBrowse/EVENTS_POOL.
// We derive unique organizers from real events and tab-filter by category.
import React, { useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";
import { BadgeCheck } from "lucide-react";

const ArtistSection = () => {
  const { getEvents, locationLabel } = useBrowse();
  const [activeTab, setActiveTab] = useState("Popular");

  const events = getEvents();

  // Derive unique organizers from real events
  const organizers = useMemo(() => {
    const seen = new Set();
    const list = [];
    events.forEach((ev) => {
      if (!ev.organizer?.name || seen.has(ev.organizer.name)) return;
      seen.add(ev.organizer.name);
      list.push({
        id: ev._id,
        name: ev.organizer.name,
        isVerified: ev.organizer.isVerified,
        genre: ev.category?.name || "Events",
        sub: ev.subcategory?.name || "",
      });
    });
    return list.slice(0, 12);
  }, [events]);

  const categories = useMemo(() => {
    const cats = ["Popular", ...new Set(organizers.map((o) => o.genre))];
    return [...new Set(cats)].slice(0, 6);
  }, [organizers]);

  const displayed = useMemo(() => {
    if (activeTab === "Popular") return organizers.slice(0, 6);
    return organizers.filter((o) => o.genre === activeTab).slice(0, 6);
  }, [activeTab, organizers]);

  if (!organizers.length) return null;

  return (
    <section className="py-10 bg-background">
      <Container>
        <h2 className="text-2xl font-bold text-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}>
          Organisers Near {locationLabel}
        </h2>

        {/* Tab pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 border-b border-border/40 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full border text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === cat
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayed.map((org) => (
            <div key={org.id} className="flex flex-col items-center group">
              {/* Avatar placeholder */}
              <div className="relative w-28 h-28 md:h-32 md:w-32 mb-3 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center group-hover:border-primary transition-all overflow-hidden">
                <span className="text-xl font-black text-muted-foreground select-none" style={{ fontFamily: "var(--font-heading)" }}>
                  {org.name[0]}
                </span>
              </div>
              <h3 className="text-sm font-bold text-center leading-tight mb-0.5 flex items-center gap-1"
                style={{ fontFamily: "var(--font-heading)" }}>
                {org.name}
                {org.isVerified && <BadgeCheck size={13} className="text-primary shrink-0" />}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 text-center" style={{ fontFamily: "var(--font-sans)" }}>
                {org.sub || org.genre}
              </p>
              <button className="px-4 py-1 rounded-full border border-border bg-background text-xs font-bold transition-all hover:bg-foreground hover:text-background"
                style={{ fontFamily: "var(--font-sans)" }}>
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
