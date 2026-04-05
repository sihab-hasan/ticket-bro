// frontend/src/pages/auth/VerifyEmailPage.jsx
// Route: /auth/verify-email?token=<JWT>   ← email link
//        /auth/verify-email?notice=true   ← after register (no token yet)

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, CheckCircle2, MailX, MailCheck, ArrowRight, Send } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { StatusCard } from "./_authShared";
import { ROUTES } from "@/app/AppRoutes";
import authService from "@/api/auth.api";

const STATUS = {
  NOTICE: "notice",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Decode the email claim from a JWT without verifying signature (client-side only).
// The payload is base64url encoded in the second segment — safe to read, not trusted for auth.
const extractEmailFromJWT = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.email === "string" ? payload.email : "";
  } catch {
    return "";
  }
};

// ── Resend widget — self-contained, used in NOTICE and ERROR states ──────────
const ResendWidget = ({ initialEmail = "" }) => {
  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
  }, [initialEmail]); // eslint-disable-line

  const startCooldown = (seconds = 60) => {
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleResend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setResending(true);
    setErrorMsg("");
    setSentMsg("");

    try {
      await authService.resendVerification(trimmed);
      setSentMsg("Check your inbox — a new verification link is on its way. Check your spam folder too.");
      startCooldown(60);
    } catch (err) {
      const status = err?.status;
      const msg = err?.message || "";

      if (status === 429) {
        // Surface the real rate-limit message from the backend
        setErrorMsg(msg || "Too many attempts. Please wait before trying again.");
        // Parse minutes from backend message if present e.g. "…try again after 1 hour"
        const hourMatch = msg.match(/(\d+)\s*hour/i);
        const minMatch = msg.match(/(\d+)\s*min/i);
        const waitSecs = hourMatch
          ? parseInt(hourMatch[1]) * 3600
          : minMatch
            ? parseInt(minMatch[1]) * 60
            : 3600;
        startCooldown(Math.min(waitSecs, 3600)); // cap display at 1h
      } else if (status >= 400 && status < 500 && msg) {
        // Other client errors (400 validation etc.) — show the real message
        setErrorMsg(msg);
      } else {
        // Network / 5xx / unknown — generic success to avoid user enumeration
        setSentMsg("If that address has an unverified account, we've sent a new link.");
        startCooldown(60);
      }
    } finally {
      setResending(false);
    }
  };

  const canSend = !resending && cooldown === 0;
  const showEmailInput = !initialEmail;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      {showEmailInput && (
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
          onKeyDown={(e) => e.key === "Enter" && canSend && handleResend()}
          placeholder="your@email.com"
          autoComplete="email"
          style={{
            width: "100%",
            height: 46,
            borderRadius: 12,
            border: errorMsg
              ? "1.5px solid #ef4444"
              : "1.5px solid var(--border,#e5e7eb)",
            background: "var(--background,#fff)",
            padding: "0 16px",
            fontSize: 14,
            color: "var(--foreground,#111)",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      )}

      {errorMsg && (
        <p style={{ margin: 0, fontSize: 12.5, color: "#ef4444", lineHeight: 1.45 }}>
          {errorMsg}
        </p>
      )}

      {sentMsg && (
        <p style={{ margin: 0, fontSize: 12.5, color: "#16a34a", fontWeight: 500, lineHeight: 1.45 }}>
          ✓ {sentMsg}
        </p>
      )}

      <button
        onClick={handleResend}
        disabled={!canSend}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          border: "1.5px solid var(--border,#e5e7eb)",
          background: canSend ? "transparent" : "var(--muted,#f3f4f6)",
          fontSize: 14,
          fontWeight: 600,
          color: canSend ? "var(--foreground,#111)" : "var(--muted-foreground,#9ca3af)",
          cursor: canSend ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontFamily: "inherit",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {resending ? (
          <>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            Sending…
          </>
        ) : cooldown > 0 ? (
          `Resend available in ${cooldown > 60 ? `${Math.ceil(cooldown / 60)}m` : `${cooldown}s`}`
        ) : (
          <>
            <Send size={14} />
            Resend verification email
          </>
        )}
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const token = searchParams.get("token");
  const notice = searchParams.get("notice");

  // Email for the resend widget — from navigation state (register flow)
  // or decoded from the verification JWT (error flow after clicking email link)
  const noticeEmail = location.state?.email || "";
  const tokenEmail = token ? extractEmailFromJWT(token) : "";

  const [status, setStatus] = useState(notice ? STATUS.NOTICE : STATUS.LOADING);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || notice) return;
    let cancelled = false;
    authService
      .verifyEmail(token)
      .then((res) => {
        if (!cancelled) {
          setStatus(STATUS.SUCCESS);
          setMessage(res.message || "Your email has been verified successfully.");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus(STATUS.ERROR);
          setMessage(
            err?.message || "Verification failed. The link may have expired.",
          );
        }
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  // Auto-redirect to browse 5s after successful verification
  useEffect(() => {
    if (status !== STATUS.SUCCESS) return;
    const t = setTimeout(() => navigate(ROUTES.BROWSE?.ROOT || "/browse"), 5000);
    return () => clearTimeout(t);
  }, [status, navigate]);

  // ── Notice — shown right after register ────────────────────────────────────
  if (status === STATUS.NOTICE) {
    return (
      <AuthLayout public>
        <StatusCard
          icon={<MailCheck size={30} style={{ color: "#a3e635" }} />}
          iconBg="rgba(163,230,53,0.1)"
          iconBorder="rgba(163,230,53,0.22)"
          title="Check your inbox"
          message={
            noticeEmail
              ? `We've sent a verification link to ${noticeEmail}. Click it to activate your account.`
              : "We've sent a verification link to your email. Click it to activate your account."
          }
        >
          <ResendWidget initialEmail={noticeEmail} />

          <Link
            to={ROUTES.AUTH.LOGIN}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              height: 46,
              borderRadius: 12,
              background: "#a3e635",
              color: "#000",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            Back to sign in
          </Link>

          <p style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 11.5,
            color: "var(--muted-foreground,#9ca3af)",
            lineHeight: 1.55,
          }}>
            The link expires in 24 hours. If your account isn't verified in
            time, it will be removed and you can register again.
          </p>
        </StatusCard>
      </AuthLayout>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === STATUS.LOADING) {
    return (
      <AuthLayout public>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(163,230,53,0.1)",
            border: "1px solid rgba(163,230,53,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <Loader2 size={28} style={{ color: "#a3e635", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: "-0.5px",
            color: "var(--foreground,#111)",
          }}>
            Verifying your email…
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted-foreground,#6b7280)" }}>
            Just a moment, please don't close this tab.
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === STATUS.SUCCESS) {
    return (
      <AuthLayout public>
        <StatusCard
          icon={<CheckCircle2 size={30} style={{ color: "#22c55e" }} />}
          iconBg="rgba(34,197,94,0.1)"
          iconBorder="rgba(34,197,94,0.2)"
          title="Email verified!"
          message={`${message} A welcome email is on its way. Redirecting you to events in a moment…`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => navigate(ROUTES.BROWSE?.ROOT || "/browse")}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                background: "#a3e635",
                color: "#000",
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              Browse Events <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate(ROUTES.AUTH.LOGIN)}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "1.5px solid var(--border,#e5e7eb)",
                background: "transparent",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--foreground,#111)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign in instead
            </button>
          </div>
        </StatusCard>
      </AuthLayout>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  return (
    <AuthLayout public>
      <StatusCard
        icon={<MailX size={28} style={{ color: "#ef4444" }} />}
        iconBg="rgba(239,68,68,0.1)"
        iconBorder="rgba(239,68,68,0.2)"
        title="Verification failed"
        message={message}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, color: "var(--muted-foreground,#6b7280)" }}>
            Request a new verification link:
          </p>
          {/* Pre-fill from JWT payload if available — no extra round-trip needed */}
          <ResendWidget initialEmail={tokenEmail} />
          <Link
            to={ROUTES.AUTH.LOGIN}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 46,
              borderRadius: 12,
              border: "1.5px solid var(--border,#e5e7eb)",
              color: "var(--foreground,#111)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            Back to sign in
          </Link>
        </div>
      </StatusCard>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
