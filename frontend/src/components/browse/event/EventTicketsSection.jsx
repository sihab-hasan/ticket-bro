import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, Shield, Ticket, Zap } from "lucide-react";
import { ROUTES } from "@/app/AppRoutes";
import { CapacityBar } from "./shared/EventShared.jsx";

const formatTicketPrice = (ticket) => {
  if (!ticket) {
    return "Unavailable";
  }

  if (ticket.price === 0) {
    return "Free";
  }

  if (ticket.currency === "BDT") {
    return `Taka ${ticket.price.toLocaleString()}`;
  }

  return `${ticket.currency || "BDT"} ${ticket.price.toLocaleString()}`;
};

const EventTicketsSection = forwardRef(({ event }, ref) => {
  const navigate = useNavigate();
  const tickets = useMemo(() => event.tickets || [], [event.tickets]);
  const availableTickets = useMemo(
    () =>
      tickets.filter((ticket) => ticket.available !== false && ticket.isSoldOut !== true),
    [tickets],
  );
  const [selected, setSelected] = useState(
    availableTickets[0]?.id || tickets[0]?.id || null,
  );
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setSelected(availableTickets[0]?.id || tickets[0]?.id || null);
    setQty(1);
  }, [availableTickets, tickets]);

  const ticket = tickets.find((item) => item.id === selected) || null;
  const maxQty = Math.max(
    1,
    Math.min(
      Number(ticket?.maxPerOrder || 10),
      Number(ticket?.availableCount || 10),
      10,
    ),
  );
  const total = ticket ? ticket.price * qty : 0;
  const spotsLeft = event.spotsLeft;
  const soldPct = event.soldPercentage || 0;
  const canPurchase = event.canPurchase !== false && availableTickets.length > 0;

  useEffect(() => {
    setQty((current) => Math.min(current, maxQty));
  }, [maxQty]);

  const handleCheckout = () => {
    if (!event.slug || !ticket) {
      return;
    }
    navigate(ROUTES.TICKETS.SELECT(event.slug));
  };

  return (
    <div ref={ref} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Get Tickets
        </h3>
        {spotsLeft != null && spotsLeft < 50 && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold text-destructive"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Zap size={11} /> Only {spotsLeft} left
          </span>
        )}
      </div>

      <div>
        <CapacityBar soldPercentage={soldPct} />
        <p
          className="text-[10px] text-muted-foreground mt-1"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {soldPct}% sold
          {spotsLeft != null &&
            ` · ${spotsLeft.toLocaleString()} spots remaining`}
        </p>
      </div>

      {!tickets.length ? (
        <div
          className="rounded-xl border border-border p-4 text-sm text-muted-foreground"
          style={{ background: "var(--secondary)" }}
        >
          Ticket inventory has not been published for this event yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((ticketOption) => {
            const isSelected = selected === ticketOption.id;
            const isSoldOut = ticketOption.available === false || ticketOption.isSoldOut;
            const availableCount = Number(ticketOption.availableCount || 0);

            return (
              <button
                key={ticketOption.id}
                onClick={() => !isSoldOut && setSelected(ticketOption.id)}
                disabled={isSoldOut}
                className="flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: isSelected ? "var(--foreground)" : "var(--border)",
                  background: isSelected ? "var(--secondary)" : "var(--card)",
                  boxShadow: isSelected
                    ? "inset 0 0 0 1px var(--foreground)"
                    : "none",
                }}
              >
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: isSelected
                      ? "var(--foreground)"
                      : "var(--border)",
                  }}
                >
                  {isSelected && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: "var(--foreground)" }}
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-sm font-bold text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {ticketOption.label}
                      {isSoldOut && (
                        <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                          (Sold out)
                        </span>
                      )}
                    </span>
                    <span
                      className="shrink-0 text-sm font-extrabold text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {formatTicketPrice(ticketOption)}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span
                      className="text-[11px] text-muted-foreground"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {availableCount.toLocaleString()} available
                    </span>
                    {(ticketOption.perks || []).slice(0, 2).map((perk) => (
                      <span
                        key={perk}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        <Check size={9} className="text-foreground" />
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {ticket && (
        <div
          className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
          style={{ background: "var(--secondary)" }}
        >
          <div>
            <p
              className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Quantity
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-base font-bold text-foreground transition-colors hover:bg-background"
              >
                -
              </button>
              <span
                className="w-5 text-center text-sm font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((current) => Math.min(maxQty, current + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-base font-bold text-foreground transition-colors hover:bg-background"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <p
              className="text-[10px] uppercase tracking-wide text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Total
            </p>
            <p
              className="text-2xl font-extrabold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatTicketPrice({
                price: total,
                currency: ticket.currency,
              })}
            </p>
          </div>
        </div>
      )}

      <button
        disabled={!canPurchase || !ticket}
        onClick={handleCheckout}
        className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "var(--foreground)",
          color: "var(--background)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <Ticket size={15} />
        {!canPurchase ? "Not Available" : `Continue to Checkout`}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {[
          { icon: Shield, text: "Secure checkout" },
          { icon: Zap, text: "Instant confirm" },
          { icon: Clock, text: "Live inventory" },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="flex items-center gap-1 text-[10px] text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Icon size={10} />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
});

EventTicketsSection.displayName = "EventTicketsSection";
export default EventTicketsSection;
