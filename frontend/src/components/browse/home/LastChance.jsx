// frontend/src/components/home/LastChance.jsx
import React from "react";
import { Timer, Zap, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse, spotsPercent } from "@/hooks";

const LastChance = () => {
  const navigate = useNavigate();
  const { getEvents, buildEventUrl } = useBrowse();

  // Events where spotsLeft is very low (< 100) and not sold out
  const urgentEvents = getEvents()
    .filter((e) => e.spotsLeft > 0 && e.spotsLeft < 100)
    .sort((a, b) => a.spotsLeft - b.spotsLeft)
    .slice(0, 3);

  if (!urgentEvents.length) return null;

  const pct = (ev) => {
    const filled = 100 - spotsPercent(ev);
    return Math.min(filled, 99);
  };

  const isCritical = (ev) => ev.spotsLeft <= 10;

  return (
    <section className="py-12 bg-background">
      <Container>
        <div className="flex flex-col mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-red-500 font-bold text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-brand)" }}>
              Live Urgency
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Last Chance <span className="text-muted-foreground/50">to attend</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {urgentEvents.map((ev) => {
            const critical = isCritical(ev);
            return (
              <div
                key={ev._id}
                className={`group relative bg-card/40 border rounded-sm p-5 transition-all duration-300 overflow-hidden cursor-pointer ${
                  critical ? "border-red-500/40 bg-red-500/5" : "border-border/50 hover:border-red-500/30"
                }`}
                onClick={() => navigate(buildEventUrl(ev))}
              >
                {/* Top */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${critical ? "text-red-500" : "text-muted-foreground"}`}
                      style={{ fontFamily: "var(--font-sans)" }}>
                      {critical ? "Almost Gone" : "Selling Fast"}
                    </span>
                    <div className="flex items-center gap-1.5 text-foreground font-mono font-bold mt-1">
                      <Timer size={13} className="text-red-500" />
                      {ev.spotsLeft} spots left
                    </div>
                  </div>
                  {critical && (
                    <div className="bg-red-500 text-white p-1.5 rounded-sm animate-bounce">
                      <AlertTriangle size={14} />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-red-500  leading-tight"
                    style={{ fontFamily: "var(--font-heading)" }}>
                    {ev.title}
                  </h3>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                    {ev.category?.name}
                  </p>
                </div>

                {/* Capacity gauge */}
                <div className="bg-background/40 rounded-sm p-3 border border-border/20 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-sans)" }}>
                      Remaining Spots
                    </span>
                    <span className={`text-sm font-black ${critical ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                      {ev.spotsLeft} / {ev.totalCapacity}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${critical ? "bg-red-500" : "bg-orange-500"}`}
                      style={{ width: `${pct(ev)}%` }}
                    />
                  </div>
                </div>

                <button className="w-full py-3 rounded-sm bg-foreground text-background font-bold text-sm transition-all hover:bg-red-500 hover:text-white flex items-center justify-center gap-2 group/btn">
                  Claim Your Ticket
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default LastChance;
