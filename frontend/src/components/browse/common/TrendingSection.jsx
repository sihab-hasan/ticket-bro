// frontend/src/components/browse/sections/TrendingSection.jsx
import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const TrendingSection = () => {
  const { getTrending, config, locationLabel, level, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getTrending();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title = level === "root" ? "Trending Now" : `Trending ${config.label}`;
  return (
    <SectionShell
      title={title}
      subtitle={`Most popular in ${locationLabel} right now`}
      icon={TrendingUp}
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
            showBadge
          />
        ))}
      </div>
    </SectionShell>
  );
};
export default TrendingSection;
