import React, { useState } from "react";
import { ShieldCheck, QrCode, Lock, X, ArrowRight, Shield } from "lucide-react";
import Container from "@/components/layout/Container";

const TrustRibbon = () => {
  const [activeTab, setActiveTab] = useState(null);

  const trustDetails = {
    qr: {
      title: "Anti-Fraud Ticket Verification",
      description:
        "Every ticket has a unique hash. Enter yours to verify authenticity and prevent scalping.",
      placeholder: "TKT-2026-XXXX",
      button: "Verify Now",
      color: "border-green-500/30",
      accent: "bg-green-500",
      lightAccent: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
    },
    verify: {
      title: "Verified Organizer Network",
      description:
        "We solve the 'unreliable registration' problem by vetting every host before they can list events.",
      button: "Host Standards",
      color: "border-blue-500/30",
      accent: "bg-blue-500",
      lightAccent: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    secure: {
      title: "Encrypted Payments",
      description:
        "Using SSL encryption to ensure your personal data and payments are 100% secure.",
      button: "Security Docs",
      color: "border-purple-500/30",
      accent: "bg-purple-500",
      lightAccent: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
    },
  };

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
                        placeholder={trustDetails[activeTab].placeholder}
                        className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 w-full lg:w-72 transition-all shadow-inner"
                      />
                    )}
                    <button
                      className={`w-full sm:w-auto px-8 py-4 ${trustDetails[activeTab].accent} text-white font-bold rounded-2xl hover:brightness-110 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 whitespace-nowrap`}
                    >
                      {trustDetails[activeTab].button}
                      <ArrowRight size={18} />
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
