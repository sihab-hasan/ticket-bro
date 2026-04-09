// frontend/src/components/browse/sections/RecommendedSection.jsx
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const RecommendedSection = () => {
  const { getRecommended, locationLabel, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getRecommended();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  return (
    <SectionShell
      title="Recommended for You"
      subtitle={`Personalised picks in ${locationLabel}`}
      icon={Sparkles}
      viewAllHref={resultsHref}
      viewAllLabel="View all results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.slice(0, 6).map((e) => (
          <BrowseEventCard
            key={e.id}
            event={e}
            variant="horizontal"
            saved={savedIds.has(e.id)}
            onSave={toggle}
            showReason
          />
        ))}
      </div>
    </SectionShell>
  );
};
export default RecommendedSection;
