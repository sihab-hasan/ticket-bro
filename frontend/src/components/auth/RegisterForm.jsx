import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";
import { registerSchema, getPasswordStrength } from "../../utils/validators";
import useAuth from "../../context/AuthContext";
import { InputGroup, Divider, Spinner, PageTitle } from "../shared/ui";
import SocialLogin from "./SocialLogin";
import authConfig from "../../config/auth.config";

const Req = ({ met, label }) => (
  <div className="flex items-center gap-1.5">
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: met ? "oklch(0.5 0.15 142)" : "var(--border)",
        transition: "background 0.2s",
      }}
    >
      {met && <Check size={8} color="white" strokeWidth={3} />}
    </div>
    <span
      style={{
        fontSize: 11,
        color: met ? "var(--foreground)" : "var(--muted-foreground)",
        transition: "color 0.2s",
      }}
    >
      {label}
    </span>
  </div>
);

const RegisterForm = () => {
  const { register: registerUser, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });
  const pw = watch("password", "");
  const strength = getPasswordStrength(pw);

  const reqs = [
    { label: "8+ characters", met: pw.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(pw) },
    { label: "Number", met: /[0-9]/.test(pw) },
    { label: "Special char", met: /[@$!%*?&]/.test(pw) },
  ];

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="Create account"
        sub="Sign up for free — no credit card required."
      />

      <SocialLogin />
      <Divider label="or register with email" />

      <form onSubmit={handleSubmit(registerUser)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputGroup
            label="First name"
            error={errors.firstName?.message}
            left={<User size={15} />}
          >
            <input {...register("firstName")} placeholder="John" />
          </InputGroup>
          <InputGroup
            label="Last name"
            error={errors.lastName?.message}
            left={<User size={15} />}
          >
            <input {...register("lastName")} placeholder="Doe" />
          </InputGroup>
        </div>

        <InputGroup
          label="Email address"
          error={errors.email?.message}
          left={<Mail size={15} />}
        >
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </InputGroup>

        <InputGroup
          label={
            <>
              Phone{" "}
              <span
                style={{
                  color: "var(--muted-foreground)",
                  fontWeight: 400,
                  fontSize: 11,
                }}
              >
                (optional)
              </span>
            </>
          }
          left={<Phone size={15} />}
        >
          <input
            {...register("phone")}
            type="tel"
            placeholder="+1 234 567 8900"
          />
        </InputGroup>

        <div>
          <InputGroup
            label="Password"
            error={errors.password?.message}
            left={<Lock size={15} />}
            right={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{ color: "var(--muted-foreground)" }}
                className="hover:opacity-70"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          >
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </InputGroup>

          {pw && (
            <div className="mt-2.5 space-y-2 animate-fade-in">
              {/* Strength bar */}
              <div className="flex items-center gap-2">
                <div className="strength-track flex-1">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${strength.pct}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: strength.color,
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    minWidth: 60,
                  }}
                >
                  {strength.label}
                </span>
              </div>
              {/* Requirements grid */}
              <div className="grid grid-cols-2 gap-1">
                {reqs.map((r) => (
                  <Req key={r.label} {...r} />
                ))}
              </div>
            </div>
          )}
        </div>

        <InputGroup
          label="Confirm password"
          error={errors.confirmPassword?.message}
          left={<Lock size={15} />}
          right={
            <button
              type="button"
              onClick={() => setShowCp((v) => !v)}
              style={{ color: "var(--muted-foreground)" }}
              className="hover:opacity-70"
            >
              {showCp ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        >
          <input
            {...register("confirmPassword")}
            type={showCp ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </InputGroup>

        <button type="submit" disabled={isLoading} className="btn-primary mt-1">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              Create account <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <p
        style={{
          fontSize: 13,
          color: "var(--muted-foreground)",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        Already have an account?{" "}
        <Link
          to={authConfig.routes.login}
          style={{
            color: "var(--foreground)",
            fontWeight: 600,
            fontFamily: "var(--font-heading)",
          }}
          className="hover:underline"
        >
          Sign in →
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
