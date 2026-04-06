// frontend/src/components/browse/sections/StatsSection.jsx
import React, { useEffect, useRef, useState } from "react";
import { Calendar, Users, Ticket, Star, MapPin, TrendingUp, BadgeCheck } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const useCountUp = (target, duration = 1200) => {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const t = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.round(current));
    }, duration / steps);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
};

const StatItem = ({ icon: Icon, value, label, suffix = "" }) => {
  const animated = useCountUp(typeof value === "number" ? value : 0);
  const display = typeof value === "number" ? animated.toLocaleString() + suffix : value;
  return (
    <div className="flex flex-col items-center text-center p-5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-secondary/5 transition-all group">
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 mb-3 group-hover:bg-primary/20 ">
        <Icon size={18} strokeWidth={2} />
      </span>
      <p className="text-2xl font-extrabold text-foreground leading-none mb-1" style={{ fontFamily: "var(--font-heading)" }}>{display}</p>
      <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const { getStats, locationLabel, config, level } = useBrowse();
  const s = getStats();
  const items = [
    { icon: Calendar,   value: s.events,       suffix: "+", label: `Events in ${locationLabel}` },
    { icon: Users,      value: s.organizers,   suffix: "+", label: "Active Organizers" },
    { icon: MapPin,     value: s.cities,       suffix: "",  label: "Cities Covered" },
    { icon: Ticket,     value: s.ticketsSold,  suffix: "+", label: "Tickets Sold" },
    { icon: Star,       value: s.avgRating.toFixed(1), suffix: "", label: "Average Rating" },
    { icon: TrendingUp, value: config.thisWeek || 0,  suffix: "",  label: "Events This Week" },
  ];
  const title = level === "root" ? "Platform Stats" : `${config.label} in Numbers`;
  return (
    <section className="w-full bg-background" aria-label="Platform stats">
      <Container>
        <div className="py-8">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
              <BadgeCheck size={13} strokeWidth={2} />
            </span>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-lg" style={{ fontFamily: "var(--font-sans)" }}>
            Real-time numbers from Ticket Bro — your trusted event platform in {locationLabel}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((s) => <StatItem key={s.label} {...s} />)}
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default StatsSection;
