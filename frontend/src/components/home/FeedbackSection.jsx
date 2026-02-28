// src/components/FeedbackSection.jsx
import React, { useState } from "react";
import { Star, Quote, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/layout/Container";

const RateFeedback = () => {
  const [stats, setStats] = useState({ avg: 4.7, total: 12453 });
  const [userRating, setUserRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const initialFeedbacks = [
    {
      id: 1,
      name: "Arif Ahmed",
      role: "Organizer",
      text: "The best platform for local concerts. Clean UI!",
      rating: 5,
    },
    {
      id: 2,
      name: "Sara Islam",
      role: "Attendee",
      text: "Found an amazing photography workshop here. Highly recommended!",
      rating: 4,
    },
    {
      id: 3,
      name: "Tanvir Hossain",
      role: "Tech Lead",
      text: "The performance is super fast. Best in the market.",
      rating: 5,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTotal = stats.total + 1;
    const newAvg = (stats.avg * stats.total + userRating) / newTotal;
    setStats({ avg: parseFloat(newAvg.toFixed(1)), total: newTotal });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setUserRating(0);
    }, 4000);
  };

  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <Container>
        {/* --- HEADER (Moved to Left with Lime Green) --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-l-4 border-lime-500 pl-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-lime-500 uppercase tracking-tighter leading-none">
              Review and Rating
            </h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-3">
              Community Ratings & Live Feedback
            </p>
          </div>
          <Link
            to="/reviews"
            className="flex items-center gap-2 text-lime-500 font-black uppercase tracking-widest text-[10px] hover:text-lime-400 transition-colors pb-1"
          >
            See All Reviews <ArrowRight size={14} />
          </Link>
        </div>

        {/* --- STATS & FORM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Global Score Card - Updated for Theme */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border flex flex-col items-center justify-center text-center shadow-sm">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
              Global Satisfaction
            </h4>
            <div className="text-6xl font-black text-foreground mb-2">
              {stats.avg}
            </div>
            <div className="flex gap-1 mb-4 text-lime-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(stats.avg) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              From {stats.total.toLocaleString()} users
            </p>
          </div>

          {/* User Input Form - Updated for Theme */}
          <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border flex flex-col justify-center shadow-sm">
            {submitted ? (
              <div className="text-center py-6">
                <TrendingUp size={40} className="text-lime-500 mx-auto mb-4" />
                <h3 className="text-foreground font-black uppercase text-xl">
                  Feedback Received!
                </h3>
                <p className="text-muted-foreground text-[10px] mt-2 uppercase tracking-widest">
                  Your rating has been added to the global average.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                    Share Your Experience
                  </span>
                  <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-xl border border-border">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`transition-all ${userRating >= star ? "text-lime-500 scale-110" : "text-muted-foreground/30"}`}
                      >
                        <Star
                          size={24}
                          fill={userRating >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Describe your thoughts..."
                    required
                    className="w-full bg-background border border-border rounded-2xl py-5 px-6 text-sm text-foreground focus:outline-none focus:border-lime-500/50 transition-all"
                  />
                  <button
                    disabled={userRating === 0}
                    type="submit"
                    className={`absolute right-3 top-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                      userRating === 0
                        ? "bg-muted text-muted-foreground"
                        : "bg-lime-500 text-black shadow-lg shadow-lime-500/20 active:scale-95"
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* --- FEEDBACK GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialFeedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border p-8 rounded-[2.5rem] relative group shadow-sm hover:border-lime-500/30 transition-all"
            >
              <Quote className="absolute -right-2 -top-2 text-foreground/5 w-24 h-24 group-hover:text-lime-500/5 transition-colors" />
              <div className="flex gap-0.5 mb-4 text-lime-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < item.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 italic relative z-10 font-medium">
                "{item.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center font-black text-xs text-foreground border border-border italic">
                  {item.name[0]}
                </div>
                <div>
                  <h4 className="text-foreground text-[10px] font-black uppercase tracking-widest">
                    {item.name}
                  </h4>
                  <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-tighter">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default RateFeedback;
