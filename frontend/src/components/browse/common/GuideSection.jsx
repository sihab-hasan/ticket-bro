// frontend/src/components/browse/sections/GuideSection.jsx
import React from "react";
import Container from "@/components/layout/Container";
import { BookOpen } from "lucide-react";
import { useBrowse } from "@/hooks";

const DEFAULT_GUIDES = [
  { id: 1, title: "How to Find the Best Events Near You", description: "Use location filters and the map view to discover events in your neighbourhood." },
  { id: 2, title: "First-Time Buyer Guide", description: "A step-by-step walkthrough from browsing to booking your first ticket on Ticket Bro." },
  { id: 3, title: "Getting the Best Deals", description: "Enable deal alerts and check the Free Events filter to save on your next experience." },
];

const GuideSection = ({ guides = DEFAULT_GUIDES }) => {
  const { locationLabel } = useBrowse();
  return (
    <section className="w-full bg-background" aria-label="Event guides">
      <Container>
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20"><BookOpen size={13} /></span>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Event Guides</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {guides.map((g) => (
              <div key={g.id} className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all">
                <h3 className="text-sm font-bold text-foreground mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>{g.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default GuideSection;
