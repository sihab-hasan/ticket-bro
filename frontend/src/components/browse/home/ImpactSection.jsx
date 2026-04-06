// src/components/ImpactSection.jsx
import Container from "@/components/layout/Container";
import React from "react";
import { Link } from "react-router-dom";

const ImpactSection = () => {
  const impactItems = [
    {
      id: 1,
      title: "Donate Blood and Save a Life",
      category: "Volunteer",
      link: "/volunteer/blood-donation",
      image:
        "https://images.unsplash.com/photo-1615461066841-6116ecaaba90?auto=format&fit=crop&q=80&w=600&h=400",
    },
    {
      id: 2,
      title: "Plant a Tree in Your Name",
      category: "Volunteer",
      link: "/volunteer/plant-tree",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600&h=400",
    },
    {
      id: 3,
      title: "Spread Happiness by Charity",
      category: "Charity",
      link: "/charity/spread-happiness",
      image:
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600&h=400",
    },
    {
      id: 4,
      title: "Participate as a Volunteer",
      category: "Volunteer",
      link: "/volunteer/serve-people",
      image:
        "https://images.unsplash.com/photo-1559027615-cd762186c6ca?auto=format&fit=crop&q=80&w=600&h=400",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background transition-colors duration-300">
      <Container>
        {/* Section Header - Moved to Left Corner */}
        <div className="text-left mb-16 border-l-4 border-lime-500 pl-6">
          <h2 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tighter uppercase">
            MAKE AN <span className="text-lime-500">IMPACT</span> TODAY
          </h2>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Contribute to the community growth
          </p>
        </div>

        {/* 4 Column Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {impactItems.map((item) => (
            <Link key={item.id} to={item.link} className="group block w-full">
              <div className="bg-card rounded-[2.5rem] aspect-square overflow-hidden border border-border p-6 flex flex-col justify-between shadow-sm hover:border-lime-500/50 transition-all">
                {/* Image */}
                <div className="w-full h-32 md:h-36 rounded-2xl overflow-hidden mb-4 shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 px-1">
                  <h3 className="text-foreground text-xl font-black leading-tight mb-2 line-clamp-2 uppercase">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                    {item.category}
                  </p>
                </div>

                {/* Event Badge */}
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-lime-500 text-black rounded-full w-fit">
                  <span className="text-[10px] font-black uppercase">
                    40+ events
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-20">
          <Link
            to="/impact"
            className="inline-flex items-center gap-4 px-10 py-5 bg-lime-500 text-black text-lg font-black rounded-2xl shadow-xl hover:bg-lime-400 transition-all"
          >
            EXPLORE ALL OPPORTUNITIES
            <span className="text-xl">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default ImpactSection;
