import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginSchema } from "../../utils/validators";
import useAuth from "../../context/AuthContext";

import SocialLogin from "./SocialLogin";
import authConfig from "../../config/auth.config";
import { InputGroup, Divider, Spinner, PageTitle } from "../shared/ui";

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="Sign in"
        sub="Welcome back — enter your details below."
      />

      <SocialLogin />
      <Divider label="or sign in with email" />

      <form onSubmit={handleSubmit(login)} className="space-y-4">
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Password</label>
            <Link
              to={authConfig.routes.forgotPassword}
              style={{
                color: "var(--muted-foreground)",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
              className="hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <InputGroup
            error={errors.password?.message}
            left={<Lock size={15} />}
            right={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{ color: "var(--muted-foreground)" }}
                className="hover:opacity-70 transition-opacity"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          >
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </InputGroup>
        </div>

        <label
          className="flex items-center gap-2.5 cursor-pointer"
          style={{ fontSize: 13, color: "var(--muted-foreground)" }}
        >
          <input
            {...register("rememberMe")}
            type="checkbox"
            className="w-4 h-4 rounded accent-[var(--primary)]"
          />
          Remember me for 7 days
        </label>

        <button type="submit" disabled={isLoading} className="btn-primary mt-1">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              Sign in <ArrowRight size={15} />
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
        Don't have an account?{" "}
        <Link
          to={authConfig.routes.register}
          style={{
            color: "var(--foreground)",
            fontWeight: 600,
            fontFamily: "var(--font-heading)",
          }}
          className="hover:underline"
        >
          Create one free →
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
