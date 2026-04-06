// frontend/src/components/browse/sections/NewsletterSection.jsx
import React, { useState } from "react";
import { Mail, Check, Loader2, Bell, Tag, Calendar, MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import Container from "@/components/layout/Container";
import { useBrowse, unslugify } from "@/hooks";

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const NewsletterSection = () => {
  const { level, config, locationLabel, locationFlag } = useBrowse();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    setError(""); setStatus("loading");
    await new Promise((r) => setTimeout(r, 900)); // simulate API
    setStatus("success");
    // In production: POST /api/newsletter/subscribe { email, location, category }
  };

  const perks = [
    { icon: Bell, label: "Event alerts first" },
    { icon: Tag, label: "Exclusive discounts" },
    { icon: Calendar, label: "Weekly digest" },
    { icon: MapPin, label: `Updates for ${locationLabel}` },
  ];

  const title = level === "root"
    ? `Stay Updated on Events in ${locationLabel}`
    : `Get ${config.label} Event Alerts for ${locationLabel}`;

  return (
    <section className="w-full bg-background" aria-label="Newsletter signup">
      <Container>
        <div className="py-10">
          <div className="max-w-2xl mx-auto rounded-xl border border-border bg-secondary/5 p-8 text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
              <Mail size={18} />
            </span>
            <h2 className="text-2xl font-extrabold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto" style={{ fontFamily: "var(--font-sans)" }}>
              {locationFlag} Join thousands of event-goers in {locationLabel}. Unsubscribe any time.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                  <Icon size={12} className="text-primary shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {status === "success" ? (
              <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-md bg-primary/10 border border-primary/20 text-sm font-semibold text-primary" style={{ fontFamily: "var(--font-sans)" }}>
                <Check size={16} /> You're subscribed! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
                <div className="flex-1">
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder={`Your email for ${locationLabel} events...`}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
                    style={{ fontFamily: "var(--font-sans)" }} />
                  {error && <p className="text-[11px] text-destructive mt-1 text-left" style={{ fontFamily: "var(--font-sans)" }}>{error}</p>}
                </div>
                <button type="submit" disabled={status === "loading"}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-md text-xs font-semibold disabled:opacity-60 shrink-0 transition-all"
                  style={{ background: "var(--foreground)", color: "var(--background)", fontFamily: "var(--font-sans)" }}>
                  {status === "loading" ? <><Loader2 size={13} className="animate-spin" />Subscribing...</> : "Subscribe"}
                </button>
              </form>
            )}
            <p className="text-[10px] text-muted-foreground mt-3" style={{ fontFamily: "var(--font-sans)" }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default NewsletterSection;
