/**
 * EventAboutSection.jsx
 * About: description, shortDescription, highlights, tags, policies
 * Fields: description, shortDescription, highlights[], tags[],
 *         ageRestriction, dressCode, accessibilityInfo, refundPolicy
 */
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Accessibility,
  Shirt,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { SectionHeading, TagPill } from "./shared/EventShared.jsx";

const EventAboutSection = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  const desc = event.description || "";
  const isLong = desc.length > 500;
  const shown = isLong && !expanded ? desc.slice(0, 500) + "…" : desc;

  const tags = event.tags || [];
  const dressCode = event.dressCode;
  const access = event.accessibilityInfo;
  const refund = event.refundPolicy;
  const ageLabel = event.ageLabel || "All Ages";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading>About this event</SectionHeading>

      {/* Description */}
      <div>
        <p
          className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {shown}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 text-xs font-semibold text-foreground hover:opacity-70 transition-opacity mt-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {expanded ? (
              <>
                <ChevronUp size={12} /> Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} /> Read more
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <TagPill key={i}>{t.name || t}</TagPill>
          ))}
        </div>
      )}

      {/* Policy chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Age */}
        <div
          className="flex flex-col gap-1 p-3 rounded-lg border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <AlertCircle size={14} className="text-muted-foreground" />
          <p
            className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Age
          </p>
          <p
            className="text-xs font-semibold text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {ageLabel}
          </p>
        </div>
        {/* Dress code */}
        <div
          className="flex flex-col gap-1 p-3 rounded-lg border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <Shirt size={14} className="text-muted-foreground" />
          <p
            className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Dress Code
          </p>
          <p
            className="text-xs font-semibold text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {dressCode || "Casual"}
          </p>
        </div>
        {/* Refund */}
        <div
          className="flex flex-col gap-1 p-3 rounded-lg border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <RotateCcw size={14} className="text-muted-foreground" />
          <p
            className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Refunds
          </p>
          <p
            className="text-xs font-semibold text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {refund?.allowRefunds
              ? `${refund.percentageBack}% back`
              : "No refunds"}
          </p>
        </div>
        {/* Accessibility */}
        <div
          className="flex flex-col gap-1 p-3 rounded-lg border border-border"
          style={{ background: "var(--secondary)" }}
        >
          <Accessibility size={14} className="text-muted-foreground" />
          <p
            className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Accessibility
          </p>
          <p
            className="text-xs font-semibold text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {access ? "Available" : "See venue"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventAboutSection;
