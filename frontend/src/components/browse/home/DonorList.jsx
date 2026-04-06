// src/components/TopDonorListSimple.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trophy, Heart, ArrowRight, User, Users } from "lucide-react";
import Container from "@/components/layout/Container";

const TopDonorListSimple = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const donors = [
    { rank: 1, name: "Samantha", amount: 1020 },
    { rank: 2, name: "Bernadette", amount: 1000 },
    { rank: 3, name: "Alexandra", amount: 720 },
    { rank: 4, name: "Michael", amount: 650 },
    { rank: 5, name: "Jennifer", amount: 600 },
  ];

  const filteredDonors = donors.filter((donor) =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section className="py-8 bg-background transition-colors duration-300">
      <Container>
        {/* --- HEADER (More Compact) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-l-4 border-lime-500 pl-4 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
              <span className="text-lime-500">TOP DONOR</span>{" "}
              <span className="text-foreground">SQUAD</span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/10">
                <Users size={12} className="text-lime-500" />
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground">
                  1,200+ Donors
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-full">
                <Heart size={10} className="text-lime-500 fill-lime-500" />
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground">
                  $45,500 Raised
                </span>
              </div>
            </div>
          </div>

          <div className="relative group min-w-[220px]">
            <input
              type="text"
              placeholder="Find a hero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-full py-2 pl-9 pr-4 text-[9px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:border-lime-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          </div>
        </div>

        {/* --- GRID CARDS (Smaller Padding) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {filteredDonors.length > 0 ? (
            filteredDonors.map((donor) => (
              <div
                key={donor.rank}
                className={`group relative bg-card border-b-2 ${donor.rank === 1 ? "border-lime-500 shadow-md shadow-lime-500/5" : "border-border"} p-4 rounded-2xl hover:translate-y-[-2px] transition-all duration-300 overflow-hidden`}
              >
                <div
                  className={`absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-[9px] font-black ${donor.rank === 1 ? "bg-lime-500 text-black" : "bg-muted text-muted-foreground"}`}
                >
                  #{donor.rank}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${donor.rank === 1 ? "border-lime-500" : "border-muted"} bg-muted/30`}
                  >
                    {donor.rank === 1 ? (
                      <Trophy size={16} className="text-lime-500" />
                    ) : (
                      <User size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-tight">
                      {donor.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase">
                        Gave
                      </span>
                      <span className="text-xs font-black text-lime-500">
                        ${donor.amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-muted-foreground text-[9px] font-black uppercase border border-dashed border-border rounded-2xl">
              No donors found.
            </div>
          )}
        </div>

        {/* --- COMPACT THANKING (Slimmer) --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-lime-500/5 p-4 rounded-2xl border border-lime-500/10 gap-4">
          <div className="flex items-center gap-3">
            <Heart
              className="text-lime-700 dark:text-lime-400 fill-current"
              size={16}
            />
            <div>
              <h3 className="text-sm font-black text-lime-700 dark:text-lime-400 uppercase leading-none">
                Thanks to all who contribute!
              </h3>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                You are our real-life superheroes.
              </p>
            </div>
          </div>

          <Link
            to="/donate"
            className="flex items-center gap-2 px-6 py-2 bg-lime-500 text-black font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-foreground hover:text-background transition-all shadow-sm"
          >
            Support <ArrowRight size={12} />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default TopDonorListSimple;
