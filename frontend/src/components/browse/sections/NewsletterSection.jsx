// frontend/src/pages/browse/sections/NewsletterSection.jsx
//
// Email newsletter signup scoped to current browse level + selected location.
// In production: POST /api/newsletter/subscribe { email, location, category, preferences }
//
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Mail, Check, Loader2, ArrowRight,
  Bell, Tag, Calendar, MapPin,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { useLocation } from "@/context/LocationContext";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const unslugify = (slug) =>
  slug ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

const getLevel = (categorySlug, subCategorySlug, eventTypeSlug) => {
  if (eventTypeSlug) return "eventType";
  if (subCategorySlug) return "subCategory";
  if (categorySlug) return "category";
  return "root";
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ═══════════════════════════════════════════════════════════════
   COPY PER LEVEL
═══════════════════════════════════════════════════════════════ */
const getCopy = (level, categorySlug, subCategorySlug, eventTypeSlug, locationLabel) => {
  if (level === "root") return {
    title:    `Never miss an event in ${locationLabel}`,
    subtitle: `Get personalised event alerts, early-bird deals, and weekly roundups delivered straight to your inbox.`,
    badge:    "Weekly digest · Early access · Exclusive deals",
  };
  if (level === "category") return {
    title:    `Stay in the loop on ${unslugify(categorySlug)} events`,
    subtitle: `Be the first to know about new ${unslugify(categorySlug)} events, lineup announcements, and ticket drops in ${locationLabel}.`,
    badge:    `${unslugify(categorySlug)} alerts · Early access · Exclusive deals`,
  };
  if (level === "subCategory") return {
    title:    `${unslugify(subCategorySlug)} alerts, straight to you`,
    subtitle: `Never miss a ${unslugify(subCategorySlug)} event in ${locationLabel}. Get ticket drops, lineup news, and curated picks weekly.`,
    badge:    `${unslugify(subCategorySlug)} alerts · Early access · No spam`,
  };
  return {
    title:    `Get notified about ${unslugify(eventTypeSlug)} events`,
    subtitle: `Subscribe for instant alerts whenever new ${unslugify(eventTypeSlug)} events are listed in ${locationLabel}.`,
    badge:    `Instant alerts · Early access · No spam`,
  };
};

/* ═══════════════════════════════════════════════════════════════
   PREFERENCE CHIPS
   User can pick what kind of updates they want.
═══════════════════════════════════════════════════════════════ */
const PREFERENCES = [
  { id: "new-events",    label: "New Events",       icon: Bell },
  { id: "price-drops",  label: "Price Drops",      icon: Tag },
  { id: "this-week",    label: "This Week",        icon: Calendar },
  { id: "near-me",      label: "Near Me",          icon: MapPin },
];

const PreferenceChip = ({ pref, active, onToggle }) => {
  const Icon = pref.icon;
  return (
    <button
      onClick={() => onToggle(pref.id)}
      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-medium transition-colors"
      style={{
        background:  active ? "var(--foreground)" : "var(--background)",
        borderColor: active ? "var(--foreground)" : "var(--border)",
        color:       active ? "var(--background)" : "var(--muted-foreground)",
        fontFamily:  "var(--font-sans)",
      }}
    >
      <Icon size={11} />
      {pref.label}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEWSLETTER SECTION
═══════════════════════════════════════════════════════════════ */
const NewsletterSection = () => {
  const { categorySlug, subCategorySlug, eventTypeSlug } = useParams();
  const { selectedLocation } = useLocation();

  const [email,       setEmail]       = useState("");
  const [status,      setStatus]      = useState("idle"); // idle | loading | success | error
  const [errorMsg,    setErrorMsg]    = useState("");
  const [activePrefs, setActivePrefs] = useState(new Set(["new-events", "near-me"]));

  const level         = getLevel(categorySlug, subCategorySlug, eventTypeSlug);
  const locationId    = selectedLocation?.id;
  const locationLabel = selectedLocation?.label || "your city";

  const copy = getCopy(level, categorySlug, subCategorySlug, eventTypeSlug, locationLabel);

  const togglePref = (id) => {
    setActivePrefs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    // Simulate API call
    await new Promise((res) => setTimeout(res, 1200));

    // In production:
    // await fetch("/api/newsletter/subscribe", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     email,
    //     location:     locationId,
    //     category:     categorySlug || null,
    //     subCategory:  subCategorySlug || null,
    //     eventType:    eventTypeSlug || null,
    //     preferences:  [...activePrefs],
    //   }),
    // });

    setStatus("success");
  };

  return (
    <section className="w-full border-b border-border bg-background" aria-label="Newsletter signup">
      <Container>
        <div className="py-10">

          {/* Card */}
          <div
            className="relative rounded-xl border border-border overflow-hidden"
            style={{ background: "var(--card)" }}
          >
            {/* Decorative background pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, var(--foreground) 1px, transparent 1px),
                                  radial-gradient(circle at 80% 20%, var(--foreground) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8">

              {/* LEFT — copy */}
              <div className="flex flex-col justify-center gap-4">

                {/* Badge */}
                <span
                  className="inline-flex items-center gap-1.5 w-fit text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: "var(--border)",
                    color:       "var(--muted-foreground)",
                    background:  "var(--secondary)",
                    fontFamily:  "var(--font-brand)",
                  }}
                >
                  <Mail size={10} />
                  Newsletter
                </span>

                {/* Title */}
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {copy.title}
                </h2>

                {/* Subtitle */}
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {copy.subtitle}
                </p>

                {/* Feature list */}
                <ul className="flex flex-col gap-1.5">
                  {copy.badge.split(" · ").map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
                      >
                        <Check size={9} className="text-foreground" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Subscriber count social proof */}
                <div className="flex items-center gap-2 pt-1">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {["S", "R", "N", "K"].map((initial, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border-2"
                        style={{
                          background:  "var(--foreground)",
                          color:       "var(--background)",
                          borderColor: "var(--card)",
                          fontFamily:  "var(--font-heading)",
                          zIndex:      4 - i,
                        }}
                      >
                        {initial}
                      </span>
                    ))}
                  </div>
                  <p
                    className="text-xs text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Join <span className="font-semibold text-foreground">12,400+</span> subscribers
                  </p>
                </div>
              </div>

              {/* RIGHT — form */}
              <div className="flex flex-col justify-center gap-5">

                {status === "success" ? (
                  /* Success state */
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-8">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "var(--foreground)" }}
                    >
                      <Check size={24} className="text-background" />
                    </div>
                    <h3
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      You're subscribed!
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Welcome aboard. Check your inbox for a confirmation email.
                    </p>
                    <button
                      onClick={() => { setStatus("idle"); setEmail(""); }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Subscribe another email
                    </button>
                  </div>

                ) : (
                  <>
                    {/* Preference chips */}
                    <div>
                      <p
                        className="text-xs font-semibold text-foreground mb-2"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        I want updates about:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {PREFERENCES.map((pref) => (
                          <PreferenceChip
                            key={pref.id}
                            pref={pref}
                            active={activePrefs.has(pref.id)}
                            onToggle={togglePref}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="flex flex-col gap-2">
                      <div
                        className="flex items-center gap-2 rounded-lg border px-3 focus-within:ring-1 transition-all"
                        style={{
                          borderColor: errorMsg ? "var(--destructive)" : "var(--border)",
                          background:  "var(--background)",
                          // @ts-ignore
                          "--tw-ring-color": "var(--foreground)",
                        }}
                      >
                        <Mail size={14} className="text-muted-foreground shrink-0" />
                        <input
                          type="email"
                          placeholder={`Your email for ${locationLabel} updates`}
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                          className="flex-1 h-11 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                          style={{ fontFamily: "var(--font-sans)" }}
                          disabled={status === "loading"}
                        />
                      </div>

                      {/* Error message */}
                      {errorMsg && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--destructive)", fontFamily: "var(--font-sans)" }}
                        >
                          {errorMsg}
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      onClick={handleSubmit}
                      disabled={status === "loading"}
                      className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all disabled:opacity-70"
                      style={{
                        background:  "var(--foreground)",
                        color:       "var(--background)",
                        fontFamily:  "var(--font-sans)",
                      }}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>

                    {/* Privacy note */}
                    <p
                      className="text-[11px] text-center text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      No spam, ever. Unsubscribe anytime. By subscribing you agree to our{" "}
                      <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                        Privacy Policy
                      </a>.
                    </p>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default NewsletterSection;