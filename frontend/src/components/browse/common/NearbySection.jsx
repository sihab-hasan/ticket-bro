// frontend/src/components/browse/sections/NearbySection.jsx
import React, { useState } from "react";
import { Navigation } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const NearbySection = () => {
  const { getNearby, config, locationLabel, level, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getNearby();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title =
    level === "root"
      ? `Near You in ${locationLabel}`
      : `${config.label} Near You`;
  return (
    <SectionShell
      title={title}
      subtitle={`Events closest to you in ${locationLabel}`}
      icon={Navigation}
      viewAllHref={resultsHref}
      viewAllLabel="View all results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {events.slice(0, 8).map((e) => (
          <BrowseEventCard
            key={e.id}
            event={e}
            variant="horizontal"
            saved={savedIds.has(e.id)}
            onSave={toggle}
            showDistance
          />
        ))}
      </div>
    </SectionShell>
  );
};
export default NearbySection;
