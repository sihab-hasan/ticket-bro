import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  QrCode,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { ticketsService } from "@/api";
import { getApiErrorMessage } from "@/api/client";
import { ROUTES } from "@/app/AppRoutes";
import useBrowse from "@/hooks/useBrowse";
import OrganizerCard from "@/components/shared/cards/OrganizerCard";

const TrustRibbon = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [ticketCode, setTicketCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const { getEvents } = useBrowse();

  const trustDetails = {
    qr: {
      title: "Anti-Fraud Ticket Verification",
      description:
        "Every ticket can be checked against the live booking record before someone buys or scans it.",
      placeholder: "TK-XXXXXXXXXXXX",
      color: "border-green-500/30",
      accent: "bg-green-500",
      lightAccent: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
    },
    verify: {
      title: "Verified Organizer Network",
      description:
        "Trusted organizers are shown with a visible badge so attendees can spot verified hosts before booking.",
      color: "border-blue-500/30",
      accent: "bg-blue-500",
      lightAccent: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    secure: {
      title: "Protected Payments",
      description:
        "Checkout totals, payment verification, and booking confirmation stay in sync so buyers see the same protected amount end to end.",
      color: "border-amber-500/30",
      accent: "bg-amber-500",
      lightAccent: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
    },
  };

  const trustedOrganizers = useMemo(() => {
    const seen = new Map();

    for (const event of getEvents()) {
      const organizer = event?.organizerProfile || event?.organizer;
      const key = organizer?.slug || organizer?.id || organizer?._id;

      if (!key || !organizer?.isVerified) {
        continue;
      }

      const current = seen.get(key) || {
        ...organizer,
        eventCount: 0,
      };

      current.eventCount += 1;
      seen.set(key, current);
    }

    return [...seen.values()]
      .sort((a, b) => (b.eventCount || 0) - (a.eventCount || 0))
      .slice(0, 6);
  }, [getEvents]);

  const handleVerifyTicket = async () => {
    const code = ticketCode.trim().toUpperCase();
    if (!code) {
      setVerification({
        success: false,
        message: "Enter a ticket code to verify it.",
      });
      return;
    }

    setVerifying(true);

    try {
      const ticket = await ticketsService.verifyPublic(code);
      setVerification({ success: true, ticket });
    } catch (error) {
      setVerification({
        success: false,
        message: getApiErrorMessage(error, "We could not verify that ticket."),
      });
    } finally {
      setVerifying(false);
    }
  };

  const verifiedTicket = verification?.ticket;
  const ticketLocation = verifiedTicket?.event?.location || {};

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border-y border-slate-200 dark:border-white/5 transition-all duration-500 ease-in-out">
      {/* The Main Ribbon */}
      <Container>
        <div className="flex flex-row items-center justify-between py-6 md:py-8 gap-4 md:gap-10">
          {Object.entries(trustDetails).map(([key, details]) => {
            const Icon =
              key === "qr" ? QrCode : key === "verify" ? ShieldCheck : Lock;
            const label =
              key === "qr"
                ? "Verify Ticket"
                : key === "verify"
                  ? "Vetted Hosts"
                  : "Secure Pay";
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                onClick={() => setActiveTab(isActive ? null : key)}
                className="flex flex-1 md:flex-none items-center justify-center gap-3 group outline-none relative"
              >
                <div
                  className={`p-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `${details.accent} text-white scale-110 shadow-lg`
                      : `bg-slate-100 dark:bg-white/5 ${details.text} group-hover:scale-105`
                  }`}
                >
                  <Icon size={20} className="md:w-[22px] md:h-[22px]" />
                </div>

                <div className="flex flex-col items-start hidden sm:flex">
                  <span
                    className={`text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-colors ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-gray-500"
                    }`}
                  >
                    {key === "qr"
                      ? "Security"
                      : key === "verify"
                        ? "Trust"
                        : "Payment"}
                  </span>
                  <span
                    className={`text-sm md:text-base font-bold transition-colors ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Active Indicator Underline */}
                {isActive && (
                  <div
                    className={`absolute -bottom-[25px] md:-bottom-[33px] left-0 right-0 h-1 ${details.accent} rounded-t-full shadow-[0_-4px_10px_rgba(0,0,0,0.1)]`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Container>

      {/* Interactive Reveal Section */}
      <div
        className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
          activeTab
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 container mx-auto px-4">
          {activeTab && (
            <div className="pb-10 pt-4 animate-in fade-in zoom-in-95 duration-500">
              <div
                className={`max-w-5xl mx-auto p-6 md:p-10 rounded-[2rem] border transition-all duration-300 shadow-2xl backdrop-blur-xl relative
                  ${trustDetails[activeTab].color} 
                  bg-slate-50/50 dark:bg-white/[0.03]`}
              >
                <button
                  onClick={() => setActiveTab(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white dark:bg-white/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all shadow-sm"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center gap-6 md:gap-12">
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${trustDetails[activeTab].lightAccent} ${trustDetails[activeTab].text} mb-4`}
                    >
                      <Shield size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Protocol Active
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {trustDetails[activeTab].title}
                    </h4>
                    <p className="text-base text-slate-500 dark:text-gray-400 leading-relaxed max-w-xl">
                      {trustDetails[activeTab].description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {activeTab === "qr" && (
                      <input
                        type="text"
                        autoFocus
                        value={ticketCode}
                        onChange={(event) => setTicketCode(event.target.value.toUpperCase())}
                        placeholder={trustDetails[activeTab].placeholder}
                        className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full lg:w-72 transition-all shadow-inner"
                        onKeyDown={(event) => event.key === "Enter" && handleVerifyTicket()}
                      />
                    )}
                    <button
                      onClick={
                        activeTab === "qr"
                          ? handleVerifyTicket
                          : () =>
                              navigate(
                                activeTab === "verify"
                                  ? ROUTES.BROWSE.ROOT
                                  : ROUTES.CART.CHECKOUT,
                              )
                      }
                      className={`w-full sm:w-auto px-8 py-4 ${trustDetails[activeTab].accent} text-white font-bold rounded-2xl hover:brightness-110 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 whitespace-nowrap`}
                    >
                      {activeTab === "qr" ? (verifying ? "Verifying..." : "Verify Ticket") : activeTab === "verify" ? "Trusted Hosts" : "Protected Checkout"}
                    </button>
                  </div>
                </div>

                {activeTab === "qr" && verification && (
                  <div className={`mt-6 rounded-3xl border p-5 ${verification.success ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    {verification.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-300">
                          <CheckCircle2 size={18} />
                          {verifiedTicket?.isValid ? "Valid ticket found" : "Ticket found with a non-active status"}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-700 dark:text-slate-200">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Event</p>
                            <p className="font-semibold">{verifiedTicket?.event?.title}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Attendee</p>
                            <p className="font-semibold">{verifiedTicket?.attendeeName}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Ticket</p>
                            <p className="font-semibold">{verifiedTicket?.ticketCode}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Status</p>
                            <p className="font-semibold capitalize">{verifiedTicket?.status}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Organizer</p>
                            <p className="font-semibold inline-flex items-center gap-1.5">
                              {verifiedTicket?.organizer?.name}
                              {verifiedTicket?.organizer?.isTrusted && <BadgeCheck size={14} className="text-green-600" />}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Location</p>
                            <p className="font-semibold">
                              {[ticketLocation.name, ticketLocation.city, ticketLocation.country].filter(Boolean).join(", ") || "Online event"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-red-600 dark:text-red-300">{verification.message}</p>
                    )}
                  </div>
                )}

                {activeTab === "verify" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Verified organizers are surfaced with a trusted badge across public event cards and event pages.
                      </p>
                      <Link
                        to={ROUTES.BROWSE.ROOT}
                        className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300"
                      >
                        <Building2 size={16} />
                        Browse Events
                      </Link>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {trustedOrganizers.length > 0 ? (
                        trustedOrganizers.map((organizer) => (
                          <OrganizerCard
                            key={organizer.slug || organizer.id || organizer._id}
                            organizer={organizer}
                            variant="compact"
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                          Verified organizers will appear here as soon as published trusted hosts are available.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "secure" && (
                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {[
                      {
                        title: "Exact totals",
                        copy: "Checkout and payment now use the real backend total instead of a made-up service charge.",
                        icon: CreditCard,
                      },
                      {
                        title: "Verified payment state",
                        copy: "Tickets are only generated after the booking payment is confirmed and marked paid.",
                        icon: ShieldCheck,
                      },
                      {
                        title: "Encrypted handoff",
                        copy: "Payment intent creation, verification, and booking confirmation are chained together securely.",
                        icon: Lock,
                      },
                    ].map(({ title, copy, icon: Icon }) => (
                      <div key={title} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <div className="mb-3 inline-flex rounded-2xl bg-amber-500/15 p-2 text-amber-700 dark:text-amber-300">
                          <Icon size={18} />
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h5>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{copy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustRibbon;
