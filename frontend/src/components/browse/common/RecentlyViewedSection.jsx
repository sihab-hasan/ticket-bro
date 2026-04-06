// frontend/src/components/browse/sections/RecentlyViewedSection.jsx
import React from "react";
import Container from "@/components/layout/Container";
import { Eye } from "lucide-react";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import { useBrowse } from "@/hooks";
import { useState } from "react";

const RecentlyViewedSection = () => {
  const { getEvents } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  // In production: read from localStorage or user history API
  const events = getEvents().slice(0, 4);
  if (!events.length) return null;
  return (
    <section className="w-full bg-background" aria-label="Recently viewed">
      <Container>
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
              <Eye size={13} />
            </span>
            <h2
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Recently Viewed
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((e) => (
              <BrowseEventCard
                key={e.id}
                event={e}
                variant="grid"
                saved={savedIds.has(e.id)}
                onSave={toggle}
              />
            ))}
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default RecentlyViewedSection;
