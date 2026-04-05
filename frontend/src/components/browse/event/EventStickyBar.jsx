/**
 * Sticky bottom booking bar — appears on scroll
 */
import React, { useEffect, useMemo, useState } from "react";
import { Ticket } from "lucide-react";
import { fmtDateShort, fmtTime } from "./shared/EventShared.jsx";

const EventStickyBar = ({ event, onBook }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const purchaseEnabled = useMemo(() => {
    if (!event) return false;
    if (event.status !== "published") return false;
    if (event.isPast || event.status === "completed") return false;
    if (event.status === "cancelled" || event.status === "postponed") return false;
    return event.canPurchase !== false;
  }, [event]);

  const priceLabel = event?.isFree
    ? "Free"
    : `From ৳${Number(event?.minPrice || 0).toLocaleString()}`;

  if (!purchaseEnabled) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border shadow-2xl transition-transform duration-300"
      style={{
        background: "var(--background)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <div className="content-shell">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="hidden min-w-0 sm:block">
            <p
              className="truncate text-sm font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {event.title}
            </p>
            <p
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {fmtDateShort(event.startDate)} · {fmtTime(event.startDate)} · {" "}
              {event.location?.name || event.location?.city || "Venue TBA"}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p
                className="text-[10px] uppercase tracking-wide text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Price
              </p>
              <p
                className="text-lg font-extrabold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {priceLabel}
              </p>
            </div>
            <button
              onClick={onBook}
              className="flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "var(--foreground)",
                color: "var(--background)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <Ticket size={14} /> Get Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventStickyBar;
