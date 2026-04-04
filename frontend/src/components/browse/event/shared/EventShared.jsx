/**
 * EventShared.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared primitive components used across all event detail sections.
 * All fields reference event.model.js schema.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from "react";
import { Star, BadgeCheck, Clock } from "lucide-react";

// ── Format helpers ────────────────────────────────────────────────────────

export const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-BD", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return String(d); }
};

export const fmtDateShort = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-BD", {
      weekday: "short", month: "short", day: "numeric",
    });
  } catch { return String(d); }
};

export const fmtTime = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleTimeString("en-BD", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
};

export const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

export const fmtNum = (n) =>
  n == null ? "–" : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ── Star rating row ───────────────────────────────────────────────────────

export const StarRow = ({ rating = 0, size = 12, className = "" }) => (
  <span className={`flex items-center gap-0.5 ${className}`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i} size={size}
        className={
          rating >= i
            ? "text-foreground fill-foreground"
            : rating >= i - 0.5
            ? "text-foreground fill-foreground opacity-50"
            : "text-border"
        }
      />
    ))}
  </span>
);

// ── Verified badge ────────────────────────────────────────────────────────

export const VerifiedBadge = ({ size = 13 }) => (
  <BadgeCheck size={size} className="text-foreground shrink-0" />
);

// ── Capacity progress bar ─────────────────────────────────────────────────

export const CapacityBar = ({ soldPercentage = 0, className = "" }) => {
  const pct = Math.min(100, soldPercentage);
  const color = pct >= 90 ? "var(--destructive)" : pct >= 70 ? "#f59e0b" : "var(--foreground)";
  return (
    <div className={`h-1 rounded-full overflow-hidden bg-border ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
};

// ── Section header ────────────────────────────────────────────────────────

export const SectionHeading = ({ children, action, className = "" }) => (
  <div className={`flex items-baseline justify-between gap-3 ${className}`}>
    <h2
      className="text-xl font-bold text-foreground"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {children}
    </h2>
    {action}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────

export const EDivider = () => (
  <div className="border-t border-border w-full" />
);

// ── Empty/loading states ──────────────────────────────────────────────────

export const EventSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-64 rounded-xl bg-muted" />
    <div className="h-8 rounded bg-muted w-2/3" />
    <div className="h-4 rounded bg-muted w-full" />
    <div className="h-4 rounded bg-muted w-5/6" />
  </div>
);

// ── Tag pill ──────────────────────────────────────────────────────────────

export const TagPill = ({ children }) => (
  <span
    className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border"
    style={{
      borderColor: "var(--border)",
      color: "var(--muted-foreground)",
      background: "var(--secondary)",
      fontFamily: "var(--font-sans)",
    }}
  >
    {children}
  </span>
);

// ── Info row ──────────────────────────────────────────────────────────────

export const InfoRow = ({ icon: Icon, children, className = "" }) => (
  <div
    className={`flex items-center gap-2.5 text-sm text-foreground ${className}`}
    style={{ fontFamily: "var(--font-sans)" }}
  >
    {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
    {children}
  </div>
);

// ── Price badge ───────────────────────────────────────────────────────────

export const PriceBadge = ({ isFree, minPrice, maxPrice, currency = "BDT" }) => {
  const label = isFree
    ? "Free"
    : minPrice === maxPrice
    ? `৳${minPrice?.toLocaleString()}`
    : `From ৳${minPrice?.toLocaleString()}`;

  return (
    <span
      className="text-base font-extrabold text-foreground"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {label}
    </span>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────

export const StatusBadge = ({ status }) => {
  const map = {
    published:  { label: "On Sale",         bg: "bg-green-500/10 text-green-700 border-green-500/20" },
    pending:    { label: "Pending Review",  bg: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    rejected:   { label: "Needs Changes",   bg: "bg-red-500/10 text-red-700 border-red-500/20" },
    cancelled:  { label: "Cancelled",       bg: "bg-red-500/10 text-red-700 border-red-500/20" },
    postponed:  { label: "Postponed",       bg: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    completed:  { label: "Past Event",      bg: "bg-muted text-muted-foreground border-border" },
    draft:      { label: "Draft",           bg: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg}`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {s.label}
    </span>
  );
};

// ── Avatar circle ─────────────────────────────────────────────────────────

export const AvatarCircle = ({ initial, size = 10, className = "" }) => (
  <span
    className={`flex items-center justify-center rounded-full font-bold shrink-0 ${className}`}
    style={{
      width:  `${size * 4}px`,
      height: `${size * 4}px`,
      background: "var(--foreground)",
      color: "var(--background)",
      fontFamily: "var(--font-heading)",
      fontSize: `${size * 1.3}px`,
    }}
  >
    {initial}
  </span>
);
