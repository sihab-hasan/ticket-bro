// frontend/src/components/browse/sections/FAQSection.jsx
import React, { useState } from "react";
import Container from "@/components/layout/Container";
import { ChevronDown } from "lucide-react";
import { useBrowse } from "@/hooks";

const DEFAULT_FAQS = [
  { q: "How do I book tickets?", a: "Browse events, select your tickets, add to cart and checkout securely with your preferred payment method." },
  { q: "Can I get a refund?", a: "Refund policies vary by organizer. Check the event page for specific refund terms before purchasing." },
  { q: "How does location filtering work?", a: "Select your city from the location picker in the header or search bar. All sections will automatically show events near you." },
  { q: "Are there free events?", a: "Yes! Use the Price filter and select 'Free' to browse no-cost events in your city." },
];

const FAQSection = ({ faqs = DEFAULT_FAQS }) => {
  const [open, setOpen] = useState(null);
  const { locationLabel } = useBrowse();
  return (
    <section className="w-full bg-background" aria-label="FAQ">
      <Container>
        <div className="py-8 max-w-2xl">
          <h2 className="text-xl font-bold text-foreground mb-5" style={{ fontFamily: "var(--font-heading)" }}>Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-md border border-border overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-accent "
                  style={{ fontFamily: "var(--font-heading)" }}>
                  {faq.q}
                  <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 text-muted-foreground ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed border-t border-border" style={{ fontFamily: "var(--font-sans)" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full h-px bg-border" />
      </Container>
    </section>
  );
};

export default FAQSection;
