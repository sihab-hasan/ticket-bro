// frontend/src/pages/profile/ChangePasswordPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import { logoutUser } from "@/store/slices/authSlice";
import { ROUTES } from "@/config/routes.config";
import authService from "@/api/auth.api";

// ── Validation ────────────────────────────────────────────────────────────────
const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[0-9]/, "One number required")
      .regex(/[@$!%*?&]/, "One special character required"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "Must be different from current password",
    path: ["newPassword"],
  });

// ── Password field ────────────────────────────────────────────────────────────
const PwField = ({ label, name, error, register: reg, show, onToggle }) => (
  <div>
    <label className="block text-xs font-semibold text-foreground mb-1.5 font-heading">
      {label}
    </label>
    <div
      className={`flex items-center gap-2.5 px-3 h-[46px] rounded-xl border bg-card
      focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20
      ${error ? "border-destructive" : "border-input"}`}
    >
      <Lock size={14} className="text-muted-foreground shrink-0" />
      <input
        {...reg(name)}
        type={show ? "text" : "password"}
        placeholder="••••••••"
        autoComplete={
          name === "currentPassword" ? "current-password" : "new-password"
        }
        className="flex-1 bg-transparent outline-none border-none text-sm text-foreground placeholder:text-muted-foreground/60 font-sans"
      />
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

// ── Strength requirement ──────────────────────────────────────────────────────
const Req = ({ met, label }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
      ${met ? "bg-primary" : "bg-border"}`}
    >
      {met && <Check size={9} className="text-black" strokeWidth={3} />}
    </div>
    <span
      className={`text-xs ${met ? "text-foreground font-medium" : "text-muted-foreground"}`}
    >
      {label}
    </span>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [shows, setShows] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [done, setDone] = useState(false);

  const toggle = (k) => setShows((s) => ({ ...s, [k]: !s[k] }));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const newPw = watch("newPassword", "");

  const reqs = [
    { label: "8+ characters", met: newPw.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPw) },
    { label: "Number", met: /[0-9]/.test(newPw) },
    { label: "Special character", met: /[@$!%*?&]/.test(newPw) },
  ];

  const onSubmit = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    setLoading(true);
    setApiErr("");
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setDone(true);
      setTimeout(
        () => dispatch(logoutUser()).then(() => navigate('/?auth=login')),
        3000,
      );
    } catch (err) {
      setApiErr(
        err.response?.data?.message ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="content-shell"><div className="max-w-md mx-auto py-6 font-sans">
        <div className="bg-card rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-heading tracking-tight text-foreground mb-2">
              Password changed!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your password has been updated. All other sessions have been
              signed out for your security. Redirecting you to sign in…
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
            Redirecting…
          </div>
        </div>
      </div></div>
    );
  }

  return (
    <div className="content-shell" aria-label="Change password"><div className="max-w-md mx-auto py-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.PROFILE.ROOT)}
          className="w-9 h-9 rounded-xl bg-card flex items-center justify-center
            hover:bg-accent cursor-pointer"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground font-heading">
            Change password
          </h1>
          <p className="text-xs text-muted-foreground">
            Choose a strong new password
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 space-y-4">
        {/* Security notice */}
        <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-primary/6 border border-primary/20">
          <ShieldCheck size={15} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Changing your password will sign you out of all other active
            sessions for security.
          </p>
        </div>

        {/* API error */}
        {apiErr && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-destructive/8 border border-destructive/25 text-sm text-destructive">
            <AlertCircle size={14} className="shrink-0" /> {apiErr}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PwField
            label="Current password"
            name="currentPassword"
            error={errors.currentPassword?.message}
            register={register}
            show={shows.current}
            onToggle={() => toggle("current")}
          />
          <PwField
            label="New password"
            name="newPassword"
            error={errors.newPassword?.message}
            register={register}
            show={shows.new}
            onToggle={() => toggle("new")}
          />

          {/* Strength checklist */}
          {newPw && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-3.5 py-3 rounded-xl bg-muted/60 border border-border">
              {reqs.map((r) => (
                <Req key={r.label} {...r} />
              ))}
            </div>
          )}

          <PwField
            label="Confirm new password"
            name="confirmPassword"
            error={errors.confirmPassword?.message}
            register={register}
            show={shows.confirm}
            onToggle={() => toggle("confirm")}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate(ROUTES.PROFILE.ROOT)}
              className="flex-1 h-11 rounded-xl border border-border bg-transparent text-sm font-semibold
                text-foreground hover:border-accent hover:bg-accent transition-all cursor-pointer font-heading"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] h-11 rounded-xl bg-primary text-black text-sm font-bold font-heading
                flex items-center justify-center gap-2
                hover:brightness-110 active:brightness-95
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />{" "}
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div></div>
  );
};

export default ChangePasswordPage;
