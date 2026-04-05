// frontend/src/pages/profile/EditProfilePage.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  fetchProfile,
  updateProfile,
  selectProfile,
  selectUserSaving,
  selectUserError,
  selectSuccessMsg,
  clearUserError,
  clearSuccessMsg,
} from "@/store/slices/userSlice";
import { ROUTES } from "@/config/routes.config";

// ── Validation ────────────────────────────────────────────────────────────────
const schema = z.object({
  firstName: z.string().min(2, "Min 2 characters").max(50),
  lastName: z.string().min(2, "Min 2 characters").max(50),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  address: z
    .object({
      street: z.string().optional().or(z.literal("")),
      city: z.string().optional().or(z.literal("")),
      state: z.string().optional().or(z.literal("")),
      country: z.string().optional().or(z.literal("")),
      postalCode: z.string().optional().or(z.literal("")),
    })
    .optional(),
});

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, error, icon: Icon, children, hint, span2 = false }) => (
  <div className={span2 ? "col-span-2" : ""}>
    {label && (
      <label className="block text-xs font-semibold text-foreground mb-1.5 font-heading">
        {label}
      </label>
    )}
    <div
      className={`flex items-center gap-2.5 px-3 rounded-xl border bg-card transition-colors duration-150
      focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20
      ${error ? "border-destructive" : "border-input"}`}
      style={{ minHeight: 46 }}
    >
      {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
      <div className="flex-1 min-w-0 py-2">{children}</div>
    </div>
    {hint && !error && (
      <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
    )}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

// Shared input/textarea classes
const inputCls =
  "w-full bg-transparent outline-none border-none text-sm text-foreground placeholder:text-muted-foreground/60 font-sans resize-none";

// ── Section ───────────────────────────────────────────────────────────────────
const Section = ({ title, subtitle, children }) => (
  <div className="bg-card rounded-2xl p-5 space-y-4">
    <div className="pb-3 border-b border-border">
      <h2 className="text-sm font-bold text-foreground font-heading">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const EditProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectProfile);
  const isSaving = useSelector(selectUserSaving);
  const error = useSelector(selectUserError);
  const successMsg = useSelector(selectSuccessMsg);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
      return;
    }
    reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : "",
      address: {
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        country: profile.address?.country || "",
        postalCode: profile.address?.postalCode || "",
      },
    });
  }, [profile, reset, dispatch]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => {
        dispatch(clearSuccessMsg());
        navigate(ROUTES.PROFILE.ROOT);
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [successMsg, dispatch, navigate]);

  useEffect(
    () => () => {
      dispatch(clearUserError());
      dispatch(clearSuccessMsg());
    },
    [dispatch],
  );

  const bio = watch("bio", "");

  const onSubmit = (data) => {
    const clean = { ...data };
    if (!clean.phone) delete clean.phone;
    if (!clean.bio) delete clean.bio;
    if (!clean.dateOfBirth) delete clean.dateOfBirth;
    dispatch(updateProfile(clean));
  };

  return (
    <div className="content-shell" aria-label="Edit profile"><div className="max-w-2xl mx-auto py-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(ROUTES.PROFILE.ROOT)}
          className="w-9 h-9 rounded-xl bg-card flex items-center justify-center hover:bg-accent transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground font-heading leading-tight">
            Edit profile
          </h1>
          <p className="text-xs text-muted-foreground">
            Update your personal information
          </p>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/8 border border-destructive/25 text-sm text-destructive">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={15} className="shrink-0" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic info */}
        <Section
          title="Basic information"
          subtitle="Your name and public-facing details"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name"
              error={errors.firstName?.message}
              icon={User}
            >
              <input
                className={inputCls}
                {...register("firstName")}
                placeholder="John"
              />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <input
                className={inputCls}
                {...register("lastName")}
                placeholder="Doe"
              />
            </Field>
          </div>

          <Field
            label="Phone number"
            error={errors.phone?.message}
            icon={Phone}
          >
            <input
              className={inputCls}
              {...register("phone")}
              type="tel"
              placeholder="+880 1234 567 890"
            />
          </Field>

          <Field
            label="Date of birth"
            error={errors.dateOfBirth?.message}
            icon={Calendar}
          >
            <input
              className={inputCls}
              {...register("dateOfBirth")}
              type="date"
            />
          </Field>

          <Field
            label="Bio"
            error={errors.bio?.message}
            icon={FileText}
            hint={`${bio?.length ?? 0} / 500 characters`}
            span2
          >
            <textarea
              className={`${inputCls} min-h-[80px] leading-relaxed`}
              {...register("bio")}
              placeholder="Tell people a bit about yourself…"
              rows={3}
            />
          </Field>
        </Section>

        {/* Address */}
        <Section
          title="Address"
          subtitle="Optional — used for personalised event recommendations"
        >
          <Field
            label="Street address"
            error={errors.address?.street?.message}
            icon={MapPin}
          >
            <input
              className={inputCls}
              {...register("address.street")}
              placeholder="123 Main Street"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City" error={errors.address?.city?.message}>
              <input
                className={inputCls}
                {...register("address.city")}
                placeholder="Dhaka"
              />
            </Field>
            <Field
              label="State / Region"
              error={errors.address?.state?.message}
            >
              <input
                className={inputCls}
                {...register("address.state")}
                placeholder="Dhaka Division"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Country" error={errors.address?.country?.message}>
              <input
                className={inputCls}
                {...register("address.country")}
                placeholder="Bangladesh"
              />
            </Field>
            <Field
              label="Postal code"
              error={errors.address?.postalCode?.message}
            >
              <input
                className={inputCls}
                {...register("address.postalCode")}
                placeholder="1216"
              />
            </Field>
          </div>
        </Section>

        {/* Submit row */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROFILE.ROOT)}
            className="flex-1 h-11 rounded-xl border border-border bg-card text-sm font-semibold text-foreground
              hover:border-accent hover:bg-accent transition-all cursor-pointer font-heading"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="flex-[2] h-11 rounded-xl bg-primary text-black text-sm font-bold font-heading
              flex items-center justify-center gap-2
              hover:brightness-110 active:brightness-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />{" "}
                Saving…
              </>
            ) : (
              <>
                <Save size={14} /> Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div></div>
  );
};

export default EditProfilePage;
