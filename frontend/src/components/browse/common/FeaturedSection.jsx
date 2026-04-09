// frontend/src/components/browse/sections/FeaturedSection.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const FeaturedSection = () => {
  const { getFeatured, config, locationLabel, level, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getFeatured();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title =
    level === "root" ? "Featured Events" : `Featured ${config.label} Events`;
  return (
    <SectionShell
      title={title}
      subtitle={`${events.length} featured events in ${locationLabel}`}
      icon={Star}
      viewAllHref={resultsHref}
      viewAllLabel="View all results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e) => (
          <BrowseEventCard
            key={e.id}
            event={e}
            variant="featured"
            saved={savedIds.has(e.id)}
            onSave={toggle}
          />
        ))}
      </div>
    </SectionShell>
  );
};
export default FeaturedSection;
