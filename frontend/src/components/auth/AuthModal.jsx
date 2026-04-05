// frontend/src/components/auth/AuthModal.jsx
//
// The ONE and ONLY auth entry point. Everything is a query param on the current URL.
//
// ?auth=login           → LoginForm
// ?auth=register        → RegisterForm
// ?auth=forgot          → ForgotPasswordForm
// ?auth=reset           → ResetPasswordForm        (?token= also read)
// ?auth=otp             → OTPVerification           (guarded: requires 2FA Redux state)
// ?auth=verify-notice   → VerifyNotice              (shown right after register)
// ?auth=verify-email    → VerifyEmailPanel          (?token= processed inline)
// ?auth=oauth-success   → OAuthSuccessPanel         (?token= processed inline)

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MailCheck, Loader2, CheckCircle2, MailX, Send, XCircle, ArrowRight,
} from "lucide-react";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";
import OTPVerification from "./OTPVerification";

import authService from "../../api/auth.api";
import { setAuthFromOAuth } from "../../store/slices/authSlice";
import {
  selectRequires2FA,
  selectUser,
  selectAuthStatus,
} from "../../store/slices/authSlice";
import { storageUtils } from "../../utils/storageUtils";
import authConfig from "../../config/auth.config";
import { useTheme } from "../../context/ThemeContext";

import darkLogo from "@/assets/images/ticket-bro-logo-dark-mode.png";
import lightLogo from "@/assets/images/ticket-bro-logo-light-mode.png";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const Spin = () => (
  <>
    <span style={{
      display: "inline-block", width: 22, height: 22, borderRadius: "50%",
      border: "2.5px solid rgba(0,0,0,0.15)", borderTopColor: "#a3e635",
      animation: "amSpin .7s linear infinite",
    }} />
    <style>{`@keyframes amSpin{to{transform:rotate(360deg)}}`}</style>
  </>
);

const extractEmailFromJWT = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload.email === "string" ? payload.email : "";
  } catch { return ""; }
};

// ─────────────────────────────────────────────────────────────────────────────
// Panel: VerifyNotice  (?auth=verify-notice)
// Shown immediately after register — "check your inbox"
// ─────────────────────────────────────────────────────────────────────────────
const VerifyNotice = ({ onResend, loading, sent }) => (
  <div className="w-full text-center py-2">
    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto mb-5">
      <MailCheck size={20} className="text-foreground" />
    </div>
    <h2 className="font-heading font-extrabold tracking-tight text-foreground text-xl mb-2">
      Almost there!
    </h2>
    <p className="text-[0.82rem] text-muted-foreground mb-1">
      We've sent a verification link to your email.
    </p>
    <p className="text-[0.82rem] text-muted-foreground mb-6">
      Click the link to activate your account.
    </p>
    <p className="text-[0.78rem] text-muted-foreground">
      Didn't get it?{" "}
      <button
        onClick={onResend}
        disabled={loading || sent}
        className="font-semibold text-foreground bg-transparent border-none p-0 cursor-pointer hover:text-[#a3e635] transition-colors duration-150 disabled:opacity-50"
      >
        {sent ? "Sent!" : loading ? "Sending…" : "Resend email"}
      </button>
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Panel: VerifyEmailPanel  (?auth=verify-email&token=<JWT>)
// Processes the token from the backend email link entirely inside the modal.
// ─────────────────────────────────────────────────────────────────────────────
const VSTATUS = { LOADING: "loading", SUCCESS: "success", ERROR: "error" };

const ResendWidget = ({ initialEmail = "" }) => {
  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef(null);

  useEffect(() => { if (initialEmail) setEmail(initialEmail); }, [initialEmail]);
  useEffect(() => () => clearInterval(timer.current), []);

  const startCooldown = (s = 60) => {
    setCooldown(s);
    timer.current = setInterval(() => setCooldown(c => {
      if (c <= 1) { clearInterval(timer.current); return 0; }
      return c - 1;
    }), 1000);
  };

  const send = async () => {
    const t = email.trim().toLowerCase();
    if (!t) { setErrMsg("Please enter your email."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) { setErrMsg("Invalid email."); return; }
    setResending(true); setErrMsg(""); setSentMsg("");
    try {
      await authService.resendVerification(t);
      setSentMsg("New link sent — check your inbox.");
      startCooldown(60);
    } catch (err) {
      const st = err?.status; const msg = err?.message || "";
      if (st === 429) {
        setErrMsg(msg || "Too many attempts. Wait before retrying.");
        const h = msg.match(/(\d+)\s*hour/i), m = msg.match(/(\d+)\s*min/i);
        startCooldown(Math.min(h ? +h[1] * 3600 : m ? +m[1] * 60 : 3600, 3600));
      } else if (st >= 400 && st < 500 && msg) {
        setErrMsg(msg);
      } else {
        setSentMsg("If that address has an account, a new link is on its way.");
        startCooldown(60);
      }
    } finally { setResending(false); }
  };

  const ok = !resending && cooldown === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      {!initialEmail && (
        <input type="email" value={email}
          onChange={e => { setEmail(e.target.value); setErrMsg(""); }}
          onKeyDown={e => e.key === "Enter" && ok && send()}
          placeholder="your@email.com" autoComplete="email"
          style={{
            width: "100%", height: 42, borderRadius: 10,
            border: errMsg ? "1.5px solid #ef4444" : "1.5px solid var(--border,#e5e7eb)",
            background: "var(--card,#fff)", padding: "0 14px",
            fontSize: 13.5, color: "var(--foreground)", outline: "none",
            fontFamily: "inherit", boxSizing: "border-box",
          }} />
      )}
      {errMsg && <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{errMsg}</p>}
      {sentMsg && <p style={{ margin: 0, fontSize: 12, color: "#16a34a", fontWeight: 500 }}>✓ {sentMsg}</p>}
      <button onClick={send} disabled={!ok} style={{
        width: "100%", height: 42, borderRadius: 10,
        border: "1.5px solid var(--border,#e5e7eb)",
        background: ok ? "transparent" : "var(--muted)",
        fontSize: 13.5, fontWeight: 600,
        color: ok ? "var(--foreground)" : "var(--muted-foreground)",
        cursor: ok ? "pointer" : "not-allowed",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, fontFamily: "inherit",
      }}>
        {resending ? <><Loader2 size={13} style={{ animation: "amSpin 1s linear infinite" }} />Sending…</>
          : cooldown > 0 ? `Resend in ${cooldown > 60 ? `${Math.ceil(cooldown / 60)}m` : `${cooldown}s`}`
          : <><Send size={13} />Resend verification email</>}
      </button>
    </div>
  );
};

const VerifyEmailPanel = ({ token }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(token ? VSTATUS.LOADING : VSTATUS.ERROR);
  const [message, setMessage] = useState(token ? "" : "No verification token found in the link.");
  const tokenEmail = token ? extractEmailFromJWT(token) : "";

  const goLogin = () => {
    const next = new URLSearchParams(searchParams);
    next.set("auth", "login");
    next.delete("token");
    setSearchParams(next);
  };

  const goBrowse = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("auth");
    next.delete("token");
    setSearchParams(next);
    // navigate to browse after closing modal
    window.location.replace("/browse");
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    authService.verifyEmail(token)
      .then(res => {
        if (!cancelled) {
          setStatus(VSTATUS.SUCCESS);
          setMessage(res.message || "Your email has been verified.");
        }
      })
      .catch(err => {
        if (!cancelled) {
          setStatus(VSTATUS.ERROR);
          setMessage(err?.message || "Verification failed. The link may have expired.");
        }
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  if (status === VSTATUS.LOADING) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Spin />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: "var(--foreground)" }}>
          Verifying your email…
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          Just a moment — don't close this.
        </p>
      </div>
    );
  }

  if (status === VSTATUS.SUCCESS) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
        }}>
          <CheckCircle2 size={26} style={{ color: "#22c55e" }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--foreground)" }}>
          Email verified!
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 22, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={goBrowse} style={{
            width: "100%", height: 44, borderRadius: 10, background: "#a3e635",
            color: "#000", border: "none", fontSize: 14, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 7, fontFamily: "inherit",
          }}>
            Browse Events <ArrowRight size={14} />
          </button>
          <button onClick={goLogin} style={{
            width: "100%", height: 44, borderRadius: 10,
            border: "1.5px solid var(--border,#e5e7eb)", background: "transparent",
            fontSize: 13.5, fontWeight: 500, color: "var(--foreground)",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // ERROR
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
      }}>
        <MailX size={24} style={{ color: "#ef4444" }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--foreground)" }}>
        Verification failed
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 18, lineHeight: 1.6 }}>
        {message}
      </p>
      <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginBottom: 8 }}>
        Request a new link:
      </p>
      <ResendWidget initialEmail={tokenEmail} />
      <button onClick={goLogin} style={{
        width: "100%", height: 42, borderRadius: 10, marginTop: 8,
        border: "1.5px solid var(--border,#e5e7eb)", background: "transparent",
        fontSize: 13.5, fontWeight: 500, color: "var(--foreground)",
        cursor: "pointer", fontFamily: "inherit",
      }}>
        Back to sign in
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Panel: OAuthSuccessPanel  (?auth=oauth-success)
// Processes OAuth token from backend redirect entirely inside the modal.
// ─────────────────────────────────────────────────────────────────────────────
const OAuthSuccessPanel = ({ token }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState("");

  const closeToHome = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("auth");
    next.delete("token");
    setSearchParams(next);
  };

  const goLogin = () => {
    const next = new URLSearchParams(searchParams);
    next.set("auth", "login");
    next.delete("token");
    setSearchParams(next);
  };

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const accessToken = token || (await authService.refreshToken())?.accessToken;
        if (!accessToken) throw new Error("OAuth sign-in could not be completed. Please try again.");
        storageUtils.setAccessToken(accessToken);
        const user = await authService.getMe();
        if (cancelled) return;
        dispatch(setAuthFromOAuth({ user, accessToken }));
        closeToHome();
      } catch (err) {
        if (!cancelled) {
          storageUtils.clearAll();
          setError(err.message || "Failed to complete sign in. Please try again.");
        }
      }
    };
    hydrate();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  if (!error) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Spin />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: "var(--foreground)" }}>
          Signing you in…
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          Just a second while we set up your session.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
      }}>
        <XCircle size={24} style={{ color: "#ef4444" }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--foreground)" }}>
        Sign in failed
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 22, lineHeight: 1.6 }}>
        {error}
      </p>
      <button onClick={goLogin} style={{
        width: "100%", height: 44, borderRadius: 10, background: "#a3e635",
        color: "#000", border: "none", fontSize: 14, fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit",
      }}>
        Back to sign in
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AuthModal — root component, always mounted in App.jsx
// ─────────────────────────────────────────────────────────────────────────────
const AuthModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const authType = searchParams.get("auth");
  const token = searchParams.get("token");
  const requires2FA = useSelector(selectRequires2FA);
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);
  const { isDark } = useTheme();

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Auto-close for non-info panels when session restored
  useEffect(() => {
    const infoTypes = ["verify-notice", "verify-email", "oauth-success"];
    if (authStatus === "authenticated" && authType && !infoTypes.includes(authType)) {
      closeModal();
    }
  }, [authStatus, authType]); // eslint-disable-line

  const closeModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("auth");
    next.delete("token");
    setSearchParams(next);
  };

  // Body scroll lock
  useEffect(() => {
    if (authType) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [authType]);

  // OTP guard
  useEffect(() => {
    if (authType === "otp" && !requires2FA) {
      navigate(authConfig.routes.login, { replace: true });
    }
  }, [authType, requires2FA, navigate]);

  // Resend verify email (for verify-notice panel)
  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendLoading(true);
    try {
      await authService.resendVerification(user.email);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 5000);
    } finally {
      setResendLoading(false);
    }
  };

  if (!authType) return null;
  if (authStatus === "loading") return null;

  // Guest-only panels — hide if already authenticated
  const guestOnly = ["login", "register", "forgot", "reset", "otp"];
  if (authStatus === "authenticated" && guestOnly.includes(authType)) return null;

  // Closeable: verify-email and oauth-success are processing panels — no X button
  const noClose = ["verify-email", "oauth-success"].includes(authType);

  const renderContent = () => {
    switch (authType) {
      case "login":        return <LoginForm />;
      case "register":     return <RegisterForm />;
      case "forgot":       return <ForgotPasswordForm />;
      case "reset":        return <ResetPasswordForm />;
      case "otp":          return <OTPVerification />;
      case "verify-notice":
        return (
          <VerifyNotice
            onResend={handleResendVerification}
            loading={resendLoading}
            sent={resendSent}
          />
        );
      case "verify-email": return <VerifyEmailPanel token={token} />;
      case "oauth-success": return <OAuthSuccessPanel token={token} />;
      default:             return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="auth-overlay"
        className={[
          "fixed inset-0 z-50",
          "flex items-end sm:items-start justify-center",
          "sm:pt-16 md:pt-24",
          "bg-black/50 backdrop-blur-sm",
          "px-0 sm:px-4",
        ].join(" ")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (!noClose && e.target === e.currentTarget) closeModal();
        }}
      >
        <motion.div
          key="auth-modal"
          initial={{ y: "-100vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100vh", opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={[
            "relative bg-card shadow-xl",
            "w-full sm:max-w-[460px]",
            "rounded-t-2xl sm:rounded-xl",
            "max-h-[92dvh] sm:max-h-[90vh]",
            "overflow-y-auto overflow-x-hidden overscroll-contain",
          ].join(" ")}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden>
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Close button — hidden for processing panels */}
          {!noClose && (
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <X size={15} />
            </button>
          )}

          {/* Header */}
          <div className="px-4 sm:px-6 pt-2 sm:pt-4 pb-3 text-center border-b border-border flex flex-col items-center space-y-1">
            <img
              src={isDark ? darkLogo : lightLogo}
              alt="Ticket Bro"
              className="h-7 sm:h-8"
            />
            <h1 className="text-lg sm:text-xl font-bold font-brand tracking-tight">
              Ticket Bro
            </h1>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-4 pb-[env(safe-area-inset-bottom,1rem)] sm:pb-6 w-full">
            {content}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
