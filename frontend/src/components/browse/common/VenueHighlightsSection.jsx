// frontend/src/components/browse/sections/VenueHighlightsSection.jsx
import React from "react";
import Container from "@/components/layout/Container";
import { Building2, MapPin, Users } from "lucide-react";
import { useBrowse } from "@/hooks";

const DEFAULT_VENUES = [
  { id: 1, name: "Bangabandhu National Stadium",  location: "Motijheel, Dhaka",     capacity: 36000, type: "Stadium" },
  { id: 2, name: "ICCB",                          location: "Agargaon, Dhaka",       capacity: 5000,  type: "Convention Centre" },
  { id: 3, name: "Bashundhara City Arena",         location: "Panthapath, Dhaka",    capacity: 3000,  type: "Indoor Arena" },
  { id: 4, name: "Hatirjheel Amphitheatre",        location: "Rampura, Dhaka",       capacity: 2000,  type: "Outdoor" },
];

const VenueHighlightsSection = ({ venues = DEFAULT_VENUES }) => {
  const { locationLabel } = useBrowse();
  return (
    <section className="w-full bg-background" aria-label="Venue highlights">
      <Container>
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20"><Building2 size={13} /></span>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Top Venues in {locationLabel}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {venues.map((v) => (
              <div key={v.id} className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 border border-primary/20 mb-3">
                  <Building2 size={14} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>{v.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                  <MapPin size={9} /><span>{v.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5" style={{ fontFamily: "var(--font-sans)" }}>{v.type}</span>
                  <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                    <Users size={9} /><span>{v.capacity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default VenueHighlightsSection;
