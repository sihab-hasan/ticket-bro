// frontend/src/components/browse/sections/UpcomingSection.jsx
import React, { useState } from "react";
import { Clock } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const UpcomingSection = () => {
  const { getUpcoming, config, locationLabel, level, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getUpcoming();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title =
    level === "root" ? "Upcoming This Week" : `Upcoming ${config.label}`;
  return (
    <SectionShell
      title={title}
      subtitle={`Happening soon in ${locationLabel}`}
      icon={Clock}
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
export default UpcomingSection;
