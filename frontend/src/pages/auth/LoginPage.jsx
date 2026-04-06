// frontend/src/pages/auth/LoginPage.jsx — System B (/auth/login)
// Full-page version of login for direct navigation & deeplinks.
// Uses AuthLayout (which redirects already-logged-in users to "/").

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

import AuthLayout from "@/components/layout/AuthLayout";
import {
  Field,
  SubmitBtn,
  Divider,
  SocialLogins,
  AuthHeading,
  ErrorBanner,
  UnverifiedBanner,
  AuthFooter,
} from "./_authShared";
import {
  loginUser,
  selectIsLoading,
  selectAuthError,
  clearError,
} from "@/store/slices/authSlice";
import { loginSchema } from "@/utils/validators";
import { ROUTES } from "@/app/AppRoutes";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  // Return to the page the user was trying to reach, or home
  const from = location.state?.from?.pathname || ROUTES.HOME;

  const [showPw, setShowPw] = useState(false);
  const [unverified, setUnverified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setUnverified(false);
    dispatch(clearError());

    const result = await dispatch(loginUser(data));

    if (!result.error) {
      if (result.payload?.requiresTwoFactor) {
        navigate(ROUTES.AUTH.VERIFY_OTP, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      const msg = (result.payload || "").toLowerCase();
      if (msg.includes("verify") || msg.includes("verification"))
        setUnverified(true);
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
        title="Welcome back"
        subtitle="Sign in to your Ticket Bro account."
      />
      <SocialLogins googleFn={handleGoogle} facebookFn={handleFacebook} />

      <div style={{ margin: "16px 0" }}>
        <Divider label="or continue with email" />
      </div>

      {unverified ? <UnverifiedBanner /> : <ErrorBanner message={error} />}

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
          />
        </Field>

        <Field
          label={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Password</span>
              <Link
                to={ROUTES.AUTH.FORGOT_PASSWORD}
                style={{
                  fontSize: 11.5,
                  color: "var(--muted-foreground,#9ca3af)",
                  textDecoration: "none",
                  fontWeight: 400,
                }}
                onMouseEnter={(e) => (e.target.style.color = "#a3e635")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "var(--muted-foreground,#9ca3af)")
                }
              >
                Forgot password?
              </Link>
            </div>
          }
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
            autoComplete="current-password"
          />
        </Field>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            width: "fit-content",
            userSelect: "none",
          }}
        >
          <input
            {...register("rememberMe")}
            type="checkbox"
            style={{
              width: 14,
              height: 14,
              accentColor: "#a3e635",
              cursor: "pointer",
            }}
          />
          <span
            style={{ fontSize: 12.5, color: "var(--muted-foreground,#6b7280)" }}
          >
            Remember me
          </span>
        </label>

        <SubmitBtn loading={isLoading}>
          Sign in <ArrowRight size={15} />
        </SubmitBtn>
      </form>

      <AuthFooter
        text="Don't have an account?"
        linkText="Create one →"
        to={ROUTES.AUTH.REGISTER}
      />
    </AuthLayout>
  );
};

export default LoginPage;
