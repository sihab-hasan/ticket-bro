// frontend/src/pages/auth/ForgotPasswordPage.jsx
// Route: /auth/forgot-password

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import {
  Field,
  SubmitBtn,
  AuthHeading,
  ErrorBanner,
  StatusCard,
} from "./_authShared";
import { ROUTES } from "@/app/AppRoutes";
import authService from "@/api/auth.api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setApiError("");
    try {
      await authService.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <StatusCard
          icon={<CheckCircle2 size={30} style={{ color: "#22c55e" }} />}
          iconBg="rgba(34,197,94,0.1)"
          iconBorder="rgba(34,197,94,0.2)"
          title="Check your inbox"
          message={`We've sent a password reset link to ${sentEmail}. It expires in 1 hour.`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setSent(false)}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "1.5px solid var(--border,#e5e7eb)",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--foreground,#111)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try a different email
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
              Back to sign in <ArrowRight size={15} />
            </Link>
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 12,
              color: "var(--muted-foreground,#9ca3af)",
            }}
          >
            Didn't receive it? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#a3e635",
                fontSize: 12,
                fontWeight: 600,
                padding: 0,
              }}
            >
              resend
            </button>
          </p>
        </StatusCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 8 }}>
        <Link
          to={ROUTES.AUTH.LOGIN}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12.5,
            color: "var(--muted-foreground,#9ca3af)",
            textDecoration: "none",
            marginBottom: 24,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#a3e635")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--muted-foreground,#9ca3af)")
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to sign in
        </Link>
      </div>

      <AuthHeading
        title="Forgot password?"
        subtitle="No worries. Enter your email and we'll send you a reset link."
      />

      <ErrorBanner message={apiError} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 8,
        }}
      >
        <Field
          label="Email address"
          error={errors.email?.message}
          left={<Mail size={15} />}
        >
          <input
            className="af-input"
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
          />
        </Field>

        <SubmitBtn loading={loading}>
          Send reset link <ArrowRight size={15} />
        </SubmitBtn>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
