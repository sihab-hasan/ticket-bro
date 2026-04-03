// frontend/src/pages/auth/VerifyEmailPage.jsx
// Route: /auth/verify-email?token=<JWT>   ← email link
//        /auth/verify-email?notice=true   ← after register (no token yet)

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, MailX, MailCheck } from "lucide-react";
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

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const notice = searchParams.get("notice");

  const [status, setStatus] = useState(notice ? STATUS.NOTICE : STATUS.LOADING);
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token || notice) return;
    let cancelled = false;
    authService
      .verifyEmail(token)
      .then((res) => {
        if (!cancelled) {
          setStatus(STATUS.SUCCESS);
          setMessage(
            res.message || "Your email has been verified successfully.",
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus(STATUS.ERROR);
          setMessage(
            err.response?.data?.message ||
              "Verification failed. The link may have expired.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line

  // ── Notice — shown right after register ────────────────────────────────────
  if (status === STATUS.NOTICE) {
    return (
      <AuthLayout public>
        <StatusCard
          icon={<MailCheck size={30} style={{ color: "#a3e635" }} />}
          iconBg="rgba(163,230,53,0.1)"
          iconBorder="rgba(163,230,53,0.22)"
          title="Check your inbox"
          message="We've sent a verification link to your email address. Click the link to activate your account before signing in."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Resend */}
            <button
              onClick={async () => {
                if (resent) return;
                setResending(true);
                try {
                  // We don't know email here — user must go back to login and try
                  // to login which triggers auto-resend, or use the form below.
                  // Show a prompt to go to login and attempt sign-in to trigger resend.
                  setResent(true);
                } finally {
                  setResending(false);
                }
              }}
              disabled={resent || resending}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "1.5px solid var(--border,#e5e7eb)",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--foreground,#111)",
                cursor: resent ? "default" : "pointer",
                opacity: resent ? 0.6 : 1,
                fontFamily: "inherit",
              }}
            >
              {resent
                ? "✓ Check your spam folder too"
                : resending
                  ? "Resending…"
                  : "Didn't receive it? Try signing in to resend"}
            </button>

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
              }}
            >
              Back to sign in
            </Link>
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: 18,
              fontSize: 11.5,
              color: "var(--muted-foreground,#9ca3af)",
              lineHeight: 1.55,
            }}
          >
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
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "rgba(163,230,53,0.1)",
              border: "1px solid rgba(163,230,53,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Loader2
              size={28}
              style={{ color: "#a3e635", animation: "spin 1s linear infinite" }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: "-0.5px",
              color: "var(--foreground,#111)",
            }}
          >
            Verifying your email…
          </h1>
          <p
            style={{ fontSize: 13.5, color: "var(--muted-foreground,#6b7280)" }}
          >
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
          message={`${message} You can now sign in to your account.`}
        >
          <button
            onClick={() => navigate(ROUTES.AUTH.LOGIN)}
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
            Continue to sign in
          </button>
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
          <Link
            to={ROUTES.AUTH.LOGIN}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 46,
              borderRadius: 12,
              background: "#a3e635",
              color: "#000",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Sign in to get a new link
          </Link>
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
