import React, { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleAlert,
  CreditCard,
  Shield,
  Ticket,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { organizersService, paymentsService, ticketsService } from "@/api";
import { getApiErrorMessage } from "@/api/client";
import { ROUTES } from "@/app/AppRoutes";
import { toast } from "@/components/shared/common";
import Container from "@/components/layout/Container";
import useAuth from "@/context/AuthContext";
import { formatPrice } from "@/utils/formatters";

const TRUST_DETAILS = {
  ticket: {
    icon: Ticket,
    section: "Ticket",
    label: "Verify Ticket",
    title: "Verify your ticket before entry",
    description:
      "Check the code from your booking to confirm the ticket is attached to your account and still valid for admission.",
    inputLabel: "Ticket code",
    placeholder: "TK-XXXXXXXXXXXX",
    emptyMessage: "Enter a ticket code to verify.",
    requiresAuth: true,
    hint: "Use the code from your Ticket Bro booking or PDF pass.",
    accent: "bg-emerald-500",
    color: "border-emerald-500/30",
    lightAccent: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    focus: "focus:ring-emerald-500/40",
    checks: [
      {
        label: "Ownership",
        copy: "Confirms the ticket belongs to the signed-in account.",
      },
      {
        label: "Status",
        copy: "Shows whether the pass is active, used, cancelled, or transferred.",
      },
      {
        label: "Event match",
        copy: "Connects the code back to the booked event and ticket type.",
      },
    ],
  },
  organiser: {
    icon: Building2,
    section: "Organiser",
    label: "Verify Organiser",
    title: "Verify the organiser behind an event",
    description:
      "Search a public organiser slug to see whether the profile is verified, pending review, or still unverified on Ticket Bro.",
    inputLabel: "Organiser slug",
    placeholder: "arena-live",
    emptyMessage: "Enter an organiser slug to verify.",
    requiresAuth: false,
    hint: "Use the public organiser slug shown in Ticket Bro links.",
    accent: "bg-sky-500",
    color: "border-sky-500/30",
    lightAccent: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    focus: "focus:ring-sky-500/40",
    checks: [
      {
        label: "Verification badge",
        copy: "Shows whether the organiser has completed Ticket Bro review.",
      },
      {
        label: "Public profile",
        copy: "Loads the organiser identity and slug from the live profile.",
      },
      {
        label: "Activity",
        copy: "Highlights whether the organiser is active on the platform.",
      },
    ],
  },
  payment: {
    icon: CreditCard,
    section: "Payment",
    label: "Verify Payment",
    title: "Verify a payment against your booking",
    description:
      "Check a payment intent from your receipt to confirm whether the payment is still pending, failed, or successfully completed.",
    inputLabel: "Payment intent",
    placeholder: "pi_...",
    emptyMessage: "Enter a payment intent to verify.",
    requiresAuth: true,
    hint: "Use the payment intent from your checkout receipt or booking details.",
    accent: "bg-amber-500",
    color: "border-amber-500/30",
    lightAccent: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    focus: "focus:ring-amber-500/40",
    checks: [
      {
        label: "Booking link",
        copy: "Confirms the payment is tied to the correct Ticket Bro booking.",
      },
      {
        label: "Gateway status",
        copy: "Reads the latest payment status returned by the platform.",
      },
      {
        label: "Receipt details",
        copy: "Shows the booking ref, amount, and method when available.",
      },
    ],
  },
};

const STATUS_STYLES = {
  active: {
    border: "border-emerald-500/20",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  verified: {
    border: "border-emerald-500/20",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  succeeded: {
    border: "border-emerald-500/20",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  pending: {
    border: "border-amber-500/20",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  used: {
    border: "border-sky-500/20",
    pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  transferred: {
    border: "border-sky-500/20",
    pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  cancelled: {
    border: "border-slate-300/70 dark:border-white/10",
    pill: "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    dot: "bg-slate-500",
  },
  unverified: {
    border: "border-slate-300/70 dark:border-white/10",
    pill: "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    dot: "bg-slate-500",
  },
  expired: {
    border: "border-red-500/20",
    pill: "bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
  rejected: {
    border: "border-red-500/20",
    pill: "bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
  failed: {
    border: "border-red-500/20",
    pill: "bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
  error: {
    border: "border-red-500/20",
    pill: "bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
  default: {
    border: "border-slate-300/70 dark:border-white/10",
    pill: "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    dot: "bg-slate-500",
  },
};

const formatStatusLabel = (value = "") =>
  value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatShortDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.default;

const buildFailureSummary = (title, message) => ({
  status: "error",
  eyebrow: "Verification issue",
  title,
  description: message,
  meta: [],
});

const buildTicketSummary = (ticket) => {
  const status = ticket?.status || "unknown";
  const descriptionByStatus = {
    active: "This ticket is active on your account and ready for entry.",
    used: "This ticket has already been scanned and marked as used.",
    transferred:
      "This ticket was transferred and is no longer the original active pass.",
    cancelled: "This ticket has been cancelled and will not admit entry.",
    expired: "This ticket is no longer valid for entry.",
  };

  return {
    status,
    eyebrow: "Ticket status",
    title: ticket?.event?.title || "Ticket located",
    description:
      descriptionByStatus[status] ||
      "The ticket was found, but its latest status needs a manual review.",
    meta: [
      ticket?.ticketCode,
      ticket?.ticketType?.name || ticket?.ticketTypeName,
      formatShortDate(ticket?.event?.startDate),
    ].filter(Boolean),
  };
};

const buildOrganiserSummary = (profile) => {
  const status = profile?.verificationStatus || "unverified";
  const descriptionByStatus = {
    verified:
      "This organiser profile is reviewed and verified on Ticket Bro.",
    pending:
      "This organiser has submitted verification and is still under review.",
    rejected:
      "This organiser is not currently verified on Ticket Bro.",
    unverified:
      "This organiser profile exists, but verification has not been completed yet.",
  };
  const eventCount = Number(profile?.eventCount || 0);

  return {
    status,
    eyebrow: "Organiser status",
    title: profile?.displayName || "Organiser located",
    description:
      descriptionByStatus[status] ||
      "The organiser profile was found, but the current verification state is unclear.",
    meta: [
      profile?.slug ? `@${profile.slug}` : null,
      `${eventCount} event${eventCount === 1 ? "" : "s"}`,
      profile?.verifiedAt ? `Verified ${formatShortDate(profile.verifiedAt)}` : null,
    ].filter(Boolean),
  };
};

const buildPaymentSummary = (verification) => {
  const payment = verification?.payment || null;
  const status = verification?.status || payment?.status || "pending";
  const descriptionByStatus = {
    succeeded:
      "This payment has been verified successfully and linked to the booking.",
    pending:
      "This payment exists, but it has not finished processing yet.",
    failed: "This payment could not be completed successfully.",
  };

  return {
    status,
    eyebrow: "Payment status",
    title:
      status === "succeeded" ? "Payment verified" : "Payment check complete",
    description:
      descriptionByStatus[status] ||
      "The payment intent was found, but the returned status needs manual review.",
    meta: [
      verification?.bookingRef ? `Booking ${verification.bookingRef}` : null,
      payment?.amount != null ? formatPrice(payment.amount, payment.currency) : null,
      payment?.paymentMethod ? `Method ${formatStatusLabel(payment.paymentMethod)}` : null,
    ].filter(Boolean),
  };
};

const VerificationResult = ({ result }) => {
  const tone = getStatusStyle(result.status);

  return (
    <div
      className={`rounded-[1.5rem] border ${tone.border} bg-white/85 dark:bg-black/20 p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-gray-500">
            {result.eyebrow}
          </p>
          <h5 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {result.title}
          </h5>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold ${tone.pill}`}
        >
          <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
          {formatStatusLabel(result.status)}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-gray-300 mt-2 leading-relaxed">
        {result.description}
      </p>

      {result.meta?.length ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {result.meta.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-gray-300 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const TrustRibbon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, canAccessPanel } = useAuth();
  const [activeTab, setActiveTab] = useState(null);
  const [values, setValues] = useState({
    ticket: "",
    organiser: "",
    payment: "",
  });
  const [results, setResults] = useState({
    ticket: null,
    organiser: null,
    payment: null,
  });
  const [loadingTab, setLoadingTab] = useState(null);

  const activeDetails = activeTab ? TRUST_DETAILS[activeTab] : null;

  const updateValue = (key, value) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const goToLogin = () => {
    navigate(ROUTES.AUTH.LOGIN, {
      state: { from: { pathname: location.pathname } },
    });
  };

  const runVerification = async (key) => {
    const value = values[key].trim();
    const details = TRUST_DETAILS[key];

    if (!value) {
      toast.error(details.emptyMessage);
      return;
    }

    if (details.requiresAuth && !isAuthenticated) {
      goToLogin();
      return;
    }

    setLoadingTab(key);

    try {
      let nextResult = null;

      if (key === "ticket") {
        const ticket = await ticketsService.getByCode(value);
        nextResult = buildTicketSummary(ticket);
      }

      if (key === "organiser") {
        const organiser = await organizersService.getBySlug(value);

        if (!organiser) {
          throw new Error("Organiser not found.");
        }

        nextResult = buildOrganiserSummary(organiser);
      }

      if (key === "payment") {
        const verification = await paymentsService.verifyPayment({
          paymentIntentId: value,
        });
        nextResult = buildPaymentSummary(verification);
      }

      setResults((current) => ({
        ...current,
        [key]: nextResult,
      }));
    } catch (error) {
      const message = getApiErrorMessage(error, "Verification failed.");

      setResults((current) => ({
        ...current,
        [key]: buildFailureSummary(details.label, message),
      }));
      toast.error(message);
    } finally {
      setLoadingTab(null);
    }
  };

  const handleSupportAction = (key) => {
    if (key === "ticket") {
      if (!isAuthenticated) {
        goToLogin();
        return;
      }

      navigate(ROUTES.BOOKINGS.ROOT);
      return;
    }

    if (key === "organiser") {
      if (!isAuthenticated) {
        navigate(ROUTES.AUTH.REGISTER);
        return;
      }

      navigate(
        canAccessPanel("organizer")
          ? ROUTES.ORGANIZER.SETTINGS
          : ROUTES.STATIC.CONTACT,
      );
      return;
    }

    if (!isAuthenticated) {
      goToLogin();
      return;
    }

    navigate(ROUTES.PAYMENTS.HISTORY);
  };

  const getSubmitLabel = (key) => {
    if ((key === "ticket" || key === "payment") && !isAuthenticated) {
      return "Sign In to Verify";
    }

    return TRUST_DETAILS[key].label;
  };

  const getSupportLabel = (key) => {
    if (key === "ticket") {
      return isAuthenticated ? "Open My Bookings" : "Sign In for Ticket Access";
    }

    if (key === "organiser") {
      return canAccessPanel("organizer")
        ? "Manage Organiser Verification"
        : isAuthenticated
          ? "Contact Support for Organiser Access"
          : "Become an Organiser";
    }

    return isAuthenticated ? "Open Payment History" : "Sign In for Payment Access";
  };

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border-y border-slate-200 dark:border-white/5 transition-all duration-500 ease-in-out">
      <Container>
        <div className="flex flex-row items-center justify-between py-6 md:py-8 gap-4 md:gap-10">
          {Object.entries(TRUST_DETAILS).map(([key, details]) => {
            const Icon = details.icon;
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(isActive ? null : key)}
                aria-expanded={isActive}
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
                    {details.section}
                  </span>
                  <span
                    className={`text-sm md:text-base font-bold transition-colors ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    {details.label}
                  </span>
                </div>

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

      <div
        className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
          activeTab
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 container mx-auto px-4">
          {activeTab && activeDetails && (
            <div className="pb-10 pt-4 animate-in fade-in zoom-in-95 duration-500">
              <div
                className={`max-w-5xl mx-auto p-6 md:p-10 rounded-[2rem] border transition-all duration-300 shadow-2xl backdrop-blur-xl relative ${activeDetails.color} bg-slate-50/80 dark:bg-white/[0.03]`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white dark:bg-white/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all shadow-sm"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col xl:flex-row xl:items-start gap-6 md:gap-10">
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${activeDetails.lightAccent} ${activeDetails.text} mb-4`}
                    >
                      <Shield size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Verification Active
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      {activeDetails.title}
                    </h4>
                    <p className="text-base text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                      {activeDetails.description}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3 mt-5">
                      {activeDetails.checks.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1.25rem] border border-slate-200/80 dark:border-white/8 bg-white/70 dark:bg-black/10 p-4"
                        >
                          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                            <BadgeCheck size={15} />
                            {item.label}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-500 dark:text-gray-400 mt-2">
                            {item.copy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full xl:w-[360px] space-y-3">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        runVerification(activeTab);
                      }}
                      className="rounded-[1.5rem] border border-slate-200 dark:border-white/8 bg-white/75 dark:bg-black/20 p-4 space-y-3"
                    >
                      <label className="block text-xs font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400">
                        {activeDetails.inputLabel}
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={values[activeTab]}
                        onChange={(event) =>
                          updateValue(activeTab, event.target.value)
                        }
                        placeholder={activeDetails.placeholder}
                        className={`w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${activeDetails.focus} transition-all shadow-inner`}
                      />
                      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                        {activeDetails.hint}
                      </p>
                      {activeDetails.requiresAuth && !isAuthenticated ? (
                        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                          <CircleAlert size={14} />
                          Sign in first to verify items tied to your account.
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={loadingTab === activeTab}
                        className={`w-full px-8 py-4 ${activeDetails.accent} text-white font-bold rounded-2xl hover:brightness-110 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 whitespace-nowrap disabled:opacity-70 disabled:cursor-wait`}
                      >
                        {loadingTab === activeTab
                          ? "Checking..."
                          : getSubmitLabel(activeTab)}
                        <ArrowRight size={18} />
                      </button>
                    </form>

                    {results[activeTab] ? (
                      <VerificationResult result={results[activeTab]} />
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleSupportAction(activeTab)}
                      className="w-full rounded-[1.25rem] border border-slate-200 dark:border-white/8 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      {getSupportLabel(activeTab)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustRibbon;
