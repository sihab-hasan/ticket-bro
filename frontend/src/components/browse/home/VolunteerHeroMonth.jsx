// src/components/VolunteerHeroMonth.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Globe, Video, Award } from "lucide-react";
import Container from "@/components/layout/Container";

const VolunteerHeroMonth = () => {
  const hero = {
    name: "Sarah Rahman",
    role: "Community Leader",
    location: "Dhaka, Bangladesh",
    hours: 247,
    targetHours: 300,
    impact: "Social Reformer",
    // Participated Events
    participatedEvents: [
      { id: 1, name: "Flood Relief 2024", type: "Crisis" },
      { id: 2, name: "Green Dhaka Drive", type: "Environment" },
      { id: 3, name: "Street School Tech", type: "Education" },
    ],
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    rank: "1",
    id: "sarah-rahman",
  };

  const progressPercent = (hero.hours / hero.targetHours) * 100;

  return (
    <div>
      <Container>
        <Link
          to={`/volunteer-heroes/${hero.id}`}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          {/* Left: Identity & Rank (Static) */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 p-1 bg-lime-500 rounded-full">
                <div className="w-full h-full bg-black rounded-full overflow-hidden border-2 border-black">
                  <img
                    src={hero.avatar}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border border-black">
                #{hero.rank}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">
                  Top Contributor
                </span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Globe size={10} /> {hero.location}
                </span>
              </div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight">
                {hero.name}
              </h3>
            </div>
          </div>

          {/* Middle: Impact Stats & Missions (Static) */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-12">
            {/* Hours Progress Bar */}
            <div className="hidden sm:block min-w-[160px]">
              <div className="flex justify-between text-[9px] font-black uppercase mb-1.5 text-zinc-500 tracking-tighter">
                <span>Mission Progress</span>
                <span className="text-white">
                  {hero.hours}h / {hero.targetHours}h
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full">
                <div
                  className="h-full bg-lime-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Participated Events / Missions Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mr-1">
                Recent Missions:
              </span>
              {hero.participatedEvents.map((event) => (
                <span
                  key={event.id}
                  className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-bold text-lime-500/80 uppercase italic tracking-tight"
                >
                  #{event.name}
                </span>
              ))}
            </div>
          </div>

          {/* Right: CTA Section (Static) */}
          <div className="flex items-center gap-4 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
            <div className="text-right hidden md:block">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">
                Focus Cause
              </p>
              <p className="text-sm font-black text-white italic uppercase tracking-tighter flex items-center gap-1.5 justify-end">
                <Award size={14} className="text-lime-500" /> {hero.impact}
              </p>
            </div>
            <div className="px-6 py-3 bg-lime-500 text-black font-black text-xs uppercase rounded-xl flex items-center gap-2 shadow-lg">
              View Profile
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </Container>
    </div>
  );
};

export default VolunteerHeroMonth;
