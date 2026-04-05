// frontend/src/pages/auth/RegisterPage.jsx — System B (/auth/register)
// Full-page version of registration.
// Uses AuthLayout (which redirects already-logged-in users to "/").

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight } from "lucide-react";

import AuthLayout from "@/components/layout/AuthLayout";
import {
  Field,
  SubmitBtn,
  Divider,
  SocialLogins,
  AuthHeading,
  ErrorBanner,
  AuthFooter,
  PasswordChecklist,
} from "./_authShared";
import {
  registerUser,
  selectIsLoading,
  selectAuthError,
  clearError,
} from "@/store/slices/authSlice";
import { registerSchema } from "@/utils/validators";
import { ROUTES } from "@/app/AppRoutes";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const pw = watch("password", "");

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(registerUser(data));
    if (!result.error) {
      // Navigate to verify-email notice page (System B)
      navigate(`${ROUTES.AUTH.VERIFY_EMAIL}?notice=true`, { replace: true, state: { email: data.email } });
    }
  };

  const API =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  const handleGoogle = () => {
    window.location.href = `${API}/auth/oauth/google`;
  };
  const handleFacebook = () => {
    window.location.href = `${API}/auth/oauth/facebook`;
  };

  return (
    <AuthLayout>
      <AuthHeading
        title="Create account"
        subtitle="Join Ticket Bro and never miss an event."
      />
      <SocialLogins googleFn={handleGoogle} facebookFn={handleFacebook} />

      <div style={{ margin: "16px 0" }}>
        <Divider label="or sign up with email" />
      </div>

      <ErrorBanner message={error} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 8,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field
            label="First name"
            error={errors.firstName?.message}
            left={<User size={15} />}
          >
            <input
              className="af-input"
              {...register("firstName")}
              type="text"
              placeholder="John"
              autoComplete="given-name"
            />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <input
              className="af-input"
              {...register("lastName")}
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
            />
          </Field>
        </div>

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
          />
        </Field>

        <Field
          label="Phone (optional)"
          error={errors.phone?.message}
          left={<Phone size={15} />}
        >
          <input
            className="af-input"
            {...register("phone")}
            type="tel"
            placeholder="+1 234 567 8900"
            autoComplete="tel"
          />
        </Field>

        <Field
          label="Password"
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

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            required
            style={{
              width: 14,
              height: 14,
              accentColor: "#a3e635",
              cursor: "pointer",
              marginTop: 2,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "var(--muted-foreground,#6b7280)",
              lineHeight: 1.55,
            }}
          >
            I agree to the{" "}
            <a
              href={ROUTES.STATIC.TERMS}
              style={{
                color: "var(--foreground,#111)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href={ROUTES.STATIC.PRIVACY}
              style={{
                color: "var(--foreground,#111)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </a>
          </span>
        </label>

        <SubmitBtn loading={isLoading}>
          Create account <ArrowRight size={15} />
        </SubmitBtn>
      </form>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in →"
        to={ROUTES.AUTH.LOGIN}
      />
    </AuthLayout>
  );
};

export default RegisterPage;
