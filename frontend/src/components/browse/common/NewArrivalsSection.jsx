// frontend/src/components/browse/sections/NewArrivalsSection.jsx
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const NewArrivalsSection = () => {
  const { getNewArrivals, config, locationLabel, level, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getNewArrivals();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title =
    level === "root" ? "New Arrivals" : `New ${config.label} Events`;
  return (
    <SectionShell
      title={title}
      subtitle={`Just added in ${locationLabel}`}
      icon={Sparkles}
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
export default NewArrivalsSection;
