import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../services/authService";
import { resetSchema } from "../../utils/validators";
import { InputGroup, Spinner, PageTitle } from "../shared/ui";
import authConfig from "../../config/auth.config";

const ResetPasswordForm = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  if (!token)
    return (
      <div className="animate-fade-up text-center">
        <p
          style={{
            color: "var(--destructive)",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          Invalid or missing token.
        </p>
        <Link
          to={authConfig.routes.forgotPassword}
          className="btn-primary !w-auto px-6"
        >
          Request new link
        </Link>
      </div>
    );

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        password,
        confirmPassword: password,
      });
      setDone(true);
      setTimeout(() => navigate(authConfig.routes.login), 2000);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Reset failed — link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="animate-fade-up text-center">
        <CheckCircle2
          size={44}
          style={{ color: "oklch(0.5 0.15 142)", margin: "0 auto 16px" }}
        />
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--foreground)",
            marginBottom: 8,
          }}
        >
          Password reset!
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          Redirecting to sign in…
        </p>
      </div>
    );

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="New password"
        sub="Choose a strong, unique password for your account."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputGroup
          label="New password"
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
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <Spinner />
          ) : (
            <>
              Set new password <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
