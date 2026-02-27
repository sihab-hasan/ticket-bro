import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { serviceTypes } from "../../data/serviceTypes"; // Adjust path
import Container from "@/components/layout/Container";

const MostLovedCategories = () => {
  // We'll take a few key categories from your serviceTypes
  // or define the specific ones shown in your image
  const displayCategories = [
    {
      id: "music",
      label: "Music",
      color: "bg-blue-100/50",
      textColor: "text-blue-900",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    },
    {
      id: "business",
      label: "Business",
      color: "bg-indigo-100/50",
      textColor: "text-indigo-900",
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
    },
    {
      id: "parties",
      label: "Parties",
      color: "bg-orange-100/50",
      textColor: "text-orange-900",
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
    },
    {
      id: "food-drinks",
      label: "Food & Drinks",
      color: "bg-red-100/50",
      textColor: "text-red-900",
      img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    },
    {
      id: "dating",
      label: "Dating",
      color: "bg-pink-100/50",
      textColor: "text-pink-900",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
    },
    {
      id: "festivals",
      label: "Festivals",
      color: "bg-purple-100/50",
      textColor: "text-purple-900",
      img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
    },
    {
      id: "health-wellness",
      label: "Health & Wellness",
      color: "bg-green-100/50",
      textColor: "text-green-900",
      img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
    },
    {
      id: "kids",
      label: "Kids",
      color: "bg-cyan-100/50",
      textColor: "text-cyan-900",
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80",
    },
    {
      id: "photography",
      label: "Photography",
      sub: "Events",
      color: "bg-slate-100/50",
      textColor: "text-slate-900",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
    },
  ];

  return (
    <section className="py-12 px-6 bg-background">
      <Container>
        <h2 className="text-2xl font-bold font-heading mb-8 text-foreground">
          Dhaka's Most-Loved
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              className={`group relative flex items-center h-32 rounded-2xl border border-border overflow-hidden bg-card hover:shadow-lg transition-all duration-300 cursor-pointer`}
            >
              {/* Text Side */}
              <div className="flex-1 pl-6 z-10">
                <h3
                  className={`text-lg font-bold font-heading ${cat.textColor} dark:text-foreground`}
                >
                  {cat.label}
                </h3>
                {cat.sub && (
                  <p className="text-xs text-muted-foreground font-sans">
                    {cat.sub}
                  </p>
                )}
              </div>

              {/* Image & Gradient Side */}
              <div
                className={`absolute right-0 top-0 h-full w-1/2 ${cat.color} clip-path-slant transition-transform group-hover:scale-105 duration-500`}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover mix-blend-multiply opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card/20" />
              </div>
            </div>
          ))}

          {/* View All Card */}
          <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group">
            <span className="text-xs text-muted-foreground font-sans">
              View All
            </span>
            <h3 className="text-lg font-bold font-heading text-foreground mb-3">
              Categories
            </h3>
            <div className="flex gap-4">
              <button className="p-2 rounded-full border border-border bg-background hover:bg-accent transition-colors">
                <ArrowLeft size={16} />
              </button>
              <button className="p-2 rounded-full border border-border bg-background hover:bg-accent transition-colors">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .clip-path-slant {
          clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
      `}</style>
    </section>
  );
};

export default MostLovedCategories;
