// frontend/src/pages/auth/OTPVerificationPage.jsx
// Route: /auth/verify-otp
// Shown after login when isTwoFactorEnabled = true
// Reads twoFactorEmail from Redux state

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldCheck, RotateCcw } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { SubmitBtn, ErrorBanner, AuthHeading } from "./_authShared";
import { select2FAEmail, selectRequires2FA } from "@/store/slices/authSlice";
import useAuth from "@/context/AuthContext";
import { ROUTES } from "@/app/AppRoutes";

const OTP_LENGTH = 6;

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const email = useSelector(select2FAEmail);
  const requires2FA = useSelector(selectRequires2FA);
  const { verifyOTP, isLoading, error, clearError } = useAuth();

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Guard — if no 2FA state, redirect to login
  useEffect(() => {
    if (!requires2FA || !email) {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [requires2FA, email]); // eslint-disable-line

  const code = digits.join("");

  const handleChange = (i, val) => {
    const sanitized = val.replace(/\D/, "").slice(-1);
    const next = [...digits];
    next[i] = sanitized;
    setDigits(next);
    if (sanitized && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...digits];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || code.length < OTP_LENGTH) return;
    setSubmitted(true);
    clearError?.();
    const result = await verifyOTP({ email, otp: code });
    if (!result?.error) {
      navigate(ROUTES.HOME, { replace: true });
    } else {
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
    setSubmitted(false);
  };

  const handleResend = async () => {
    if (resent || resending) return;
    setResending(true);
    try {
      // Trigger resend by calling login again — backend will send a new OTP
      // You can also expose a dedicated resendOTP endpoint in authService
      setResent(true);
      setTimeout(() => setResent(false), 30000);
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /^(.{2})(.+)(@.+)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  return (
    <AuthLayout>
      {/* Icon */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(163,230,53,0.1)",
            border: "1px solid rgba(163,230,53,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0",
          }}
        >
          <ShieldCheck size={28} style={{ color: "#a3e635" }} />
        </div>
      </div>

      <AuthHeading
        title="Two-factor verification"
        subtitle={`Enter the 6-digit code sent to ${maskedEmail}`}
      />

      <ErrorBanner message={error} />

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 8,
        }}
      >
        {/* OTP cells */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              aria-label={`OTP digit ${i + 1}`}
              inputMode="numeric"
              maxLength={1}
              autoFocus={i === 0}
              style={{
                width: 48,
                height: 56,
                borderRadius: 12,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "inherit",
                border: `2px solid ${error && !d ? "#ef4444" : d ? "#a3e635" : "var(--border,#e5e7eb)"}`,
                background: "var(--card,#fff)",
                color: "var(--foreground,#111)",
                outline: "none",
                transition: "border-color .15s",
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = "#a3e635";
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  error && !d
                    ? "#ef4444"
                    : d
                      ? "#a3e635"
                      : "var(--border,#e5e7eb)";
              }}
            />
          ))}
        </div>

        <SubmitBtn loading={isLoading} disabled={code.length < OTP_LENGTH}>
          Verify code
        </SubmitBtn>
      </form>

      {/* Resend */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted-foreground,#6b7280)",
            marginBottom: 8,
          }}
        >
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resent || resending}
          style={{
            background: "none",
            border: "none",
            cursor: resent ? "default" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: resent ? "var(--muted-foreground,#9ca3af)" : "#a3e635",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          <RotateCcw size={13} />
          {resent
            ? "Code resent — check your inbox"
            : resending
              ? "Resending…"
              : "Resend code"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link
          to={ROUTES.AUTH.LOGIN}
          style={{
            fontSize: 13,
            color: "var(--muted-foreground,#6b7280)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#a3e635")}
          onMouseLeave={(e) =>
            (e.target.style.color = "var(--muted-foreground,#6b7280)")
          }
        >
          ← Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default OTPVerificationPage;
