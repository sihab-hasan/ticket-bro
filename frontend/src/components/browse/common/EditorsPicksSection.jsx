// frontend/src/components/browse/sections/EditorsPicksSection.jsx
import React, { useState } from "react";
import { Award } from "lucide-react";
import { useBrowse } from "@/hooks";
import BrowseEventCard from "@/components/shared/cards/EventCard";
import SectionShell from "./SectionShell";

const EditorsPicksSection = () => {
  const { getEditorsPicks, locationLabel, resultsHref } = useBrowse();
  const [savedIds, setSavedIds] = useState(new Set());
  const events = getEditorsPicks();
  if (!events.length) return null;
  const toggle = (id) =>
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const title = "Editor's Picks";
  return (
    <SectionShell
      title={title}
      subtitle={`Handpicked by our team in ${locationLabel}`}
      icon={Award}
      viewAllHref={resultsHref}
      viewAllLabel="View all results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.slice(0, 6).map((e) => (
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
export default EditorsPicksSection;
