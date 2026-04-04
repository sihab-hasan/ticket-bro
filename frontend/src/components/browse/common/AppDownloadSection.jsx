// frontend/src/components/browse/sections/AppDownloadSection.jsx
import React from "react";
import { Smartphone, Star, Bell, Ticket, MapPin } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const AppDownloadSection = () => {
  const { locationLabel, locationFlag } = useBrowse();
  const features = [
    { icon: Bell, label: "Instant alerts" },
    { icon: Ticket, label: "Digital tickets" },
    { icon: MapPin, label: `Events in ${locationLabel}` },
    { icon: Star, label: "Save favourites" },
  ];
  return (
    <section className="w-full bg-background" aria-label="App download">
      <Container>
        <div className="py-10">
          <div className="rounded-xl border border-border bg-secondary/5 p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Smartphone size={16} />
                  </span>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase text-primary"
                    style={{ fontFamily: "var(--font-brand)" }}
                  >
                    Mobile App
                  </span>
                </div>
                <h2
                  className="text-2xl font-extrabold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Book Events Anywhere in {locationLabel}
                </h2>
                <p
                  className="text-sm text-muted-foreground mb-5 max-w-sm"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {locationFlag} Download the Ticket Bro app and never miss an
                  event happening near you.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {features.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <Icon size={12} className="text-primary shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{
                      background: "var(--foreground)",
                      color: "var(--background)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <span className="text-base">🍎</span> App Store
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent transition-all text-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <span className="text-base">🤖</span> Google Play
                  </button>
                </div>
              </div>
              <div className="w-32 h-32 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Smartphone size={48} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default AppDownloadSection;
