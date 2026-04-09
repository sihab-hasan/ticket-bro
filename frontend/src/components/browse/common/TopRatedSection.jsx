// frontend/src/components/browse/sections/TopRatedSection.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const TopRatedSection = () => {
  const { getTopRated, config, locationLabel, level, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getTopRated();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title =
    level === "root" ? "Top Rated Events" : `Top Rated ${config.label}`;
  return (
    <SectionShell
      title={title}
      subtitle={`Highest rated events in ${locationLabel}`}
      icon={Star}
      viewAllHref={resultsHref}
      viewAllLabel="View all results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {events.slice(0, 8).map((e) => (
          <BrowseEventCard
            key={e.id}
            event={e}
            variant="grid"
            saved={savedIds.has(e.id)}
            onSave={toggle}
          />
        ))}
      </div>
    </SectionShell>
  );
};
export default TopRatedSection;
