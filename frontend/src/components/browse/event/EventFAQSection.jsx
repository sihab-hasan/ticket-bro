/**
 * EventFAQSection.jsx
 * FAQ accordion — maps to event.model.js faqs[] (faqItemSchema)
 * Fields: faq.question, faq.answer
 */
import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SectionHeading } from "./shared/EventShared.jsx";

const EventFAQSection = ({ event }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const faqs = event.faqs || [];

  if (!faqs.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading>
        <HelpCircle size={18} className="inline mr-1.5 text-muted-foreground" />
        Frequently Asked Questions
      </SectionHeading>

      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={faq._id || i}
              className="rounded-xl border overflow-hidden transition-all"
              style={{
                borderColor: isOpen ? "var(--foreground)" : "var(--border)",
                background: "var(--card)",
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-left gap-3 hover:bg-accent/30 transition-colors"
              >
                <p
                  className="text-sm font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {faq.question}
                </p>
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-border">
                  <p
                    className="text-sm text-muted-foreground leading-relaxed pt-3"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventFAQSection;
