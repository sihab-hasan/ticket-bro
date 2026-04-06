// frontend/src/pages/auth/ResetPasswordPage.jsx
// Route: /auth/reset-password?token=<JWT>

import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import {
  Field,
  SubmitBtn,
  AuthHeading,
  ErrorBanner,
  StatusCard,
  PasswordChecklist,
} from "./_authShared";
import { ROUTES } from "@/app/AppRoutes";
import authService from "@/api/auth.api";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[0-9]/, "One number required")
      .regex(/[@$!%*?&]/, "One special character required"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const pw = watch("password", "");

  // ── No token ────────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <AuthLayout>
        <StatusCard
          icon={<XCircle size={28} style={{ color: "#ef4444" }} />}
          iconBg="rgba(239,68,68,0.1)"
          iconBorder="rgba(239,68,68,0.2)"
          title="Invalid link"
          message="This reset link is invalid or has expired. Please request a new one."
        >
          <Link
            to={ROUTES.AUTH.FORGOT_PASSWORD}
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
            Request new link <ArrowRight size={15} />
          </Link>
        </StatusCard>
      </AuthLayout>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <AuthLayout>
        <StatusCard
          icon={<CheckCircle2 size={30} style={{ color: "#22c55e" }} />}
          iconBg="rgba(34,197,94,0.1)"
          iconBorder="rgba(34,197,94,0.2)"
          title="Password updated!"
          message="Your password has been reset successfully. You can now sign in with your new password."
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
            Go to sign in <ArrowRight size={15} />
          </button>
        </StatusCard>
      </AuthLayout>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  const onSubmit = async ({ password, confirmPassword }) => {
    setLoading(true);
    setApiErr("");
    try {
      await authService.resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setApiErr(
        err.response?.data?.message ||
          "Reset failed — the link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading
        title="Set new password"
        subtitle="Choose a strong, unique password for your account."
      />

      <ErrorBanner message={apiErr} />

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
          label="New password"
          error={errors.password?.message}
          left={<Lock size={15} />}
          right={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                color: "inherit",
              }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        >
          <input
            className="af-input"
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>

        <PasswordChecklist password={pw} />

        <Field
          label="Confirm password"
          error={errors.confirmPassword?.message}
          left={<Lock size={15} />}
          right={
            <button
              type="button"
              onClick={() => setShowCp((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                color: "inherit",
              }}
            >
              {showCp ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        >
          <input
            className="af-input"
            {...register("confirmPassword")}
            type={showCp ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>

        <SubmitBtn loading={loading}>
          Reset password <ArrowRight size={15} />
        </SubmitBtn>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
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

export default ResetPasswordPage;
