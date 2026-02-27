import React, { useMemo } from "react";
import { Timer, Zap, AlertTriangle, ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";

const LastChance = () => {
  const urgentEvents = useMemo(
    () => [
      {
        id: 801,
        title: "Boishakhi Mela Pre-Booking",
        timeLeft: "02h : 45m",
        status: "Ending Soon",
        ticketsLeft: 12,
        totalTickets: 100,
        category: "Festival",
        isCriticallyLow: false,
      },
      {
        id: 802,
        title: "Art of Living Workshop",
        timeLeft: "05h : 12m",
        status: "Almost Gone",
        ticketsLeft: 3,
        totalTickets: 50,
        category: "Workshop",
        isCriticallyLow: true,
      },
      {
        id: 803,
        title: "Dhaka Rock Carnival 2026",
        timeLeft: "14h : 20m",
        status: "Selling Fast",
        ticketsLeft: 24,
        totalTickets: 500,
        category: "Music",
        isCriticallyLow: false,
      },
    ],
    [],
  );

  return (
    <section className="py-16 px-4 md:px-8 bg-background relative overflow-hidden">
      <Container>
        {/* Header with Urgency Label */}
        <div className="flex flex-col mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-500 font-bold text-xs uppercase tracking-[0.2em]">
              Live Urgency
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Last Chance{" "}
            <span className="text-muted-foreground/50">to attend</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {urgentEvents.map((event) => {
            const progress = (event.ticketsLeft / event.totalTickets) * 100;

            return (
              <div
                key={event.id}
                className={`group relative bg-card/40 border rounded-3xl p-6 transition-all duration-500 overflow-hidden
                  ${event.isCriticallyLow ? "border-red-500/40 bg-red-500/5" : "border-border/50 hover:border-red-500/30"}`}
              >
                {/* Header: Status and Countdown */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`flex flex-col gap-1`}>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${event.isCriticallyLow ? "text-red-500" : "text-muted-foreground"}`}
                    >
                      {event.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-foreground font-mono font-bold">
                      <Timer size={14} className="text-red-500" />
                      {event.timeLeft}
                    </div>
                  </div>

                  {event.isCriticallyLow && (
                    <div className="bg-red-500 text-white p-2 rounded-xl animate-bounce">
                      <AlertTriangle size={16} />
                    </div>
                  )}
                </div>

                {/* Title and Category */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold font-heading text-foreground mb-1 group-hover:text-red-500 transition-colors leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {event.category}
                  </p>
                </div>

                {/* Scarcity Section (The "Less in Number" Part) */}
                <div className="bg-background/40 rounded-2xl p-4 border border-border/20 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Remaining Spots
                    </span>
                    <span
                      className={`text-sm font-black ${event.isCriticallyLow ? "text-red-500 animate-pulse" : "text-foreground"}`}
                    >
                      {event.ticketsLeft} / {event.totalTickets}
                    </span>
                  </div>
                  {/* Visual Gauge */}
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${event.isCriticallyLow ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-orange-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full py-4 rounded-2xl bg-foreground text-background font-bold text-sm transition-all hover:bg-red-500 hover:text-white flex items-center justify-center gap-2 group/btn">
                  Claim Your Ticket
                  <ChevronRight
                    size={18}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
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
