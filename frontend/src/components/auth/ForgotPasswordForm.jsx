import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../services/authService";
import { forgotSchema } from "../../utils/validators";
import { InputGroup, Spinner, PageTitle } from "@/components/shared/ui";
import authConfig from "../../config/auth.config";

const ForgotPasswordForm = () => {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <div className="animate-fade-up text-center">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "calc(var(--radius)*3)",
            background: "var(--muted)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <MailCheck size={22} style={{ color: "var(--foreground)" }} />
        </div>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--foreground)",
            marginBottom: 8,
          }}
        >
          Check your inbox
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted-foreground)",
            marginBottom: 4,
          }}
        >
          Reset link sent to
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: 24,
            fontFamily: "var(--font-heading)",
          }}
        >
          {sentEmail}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            marginBottom: 20,
          }}
        >
          Didn't receive it?{" "}
          <button
            onClick={() => setSent(false)}
            style={{
              color: "var(--foreground)",
              fontWeight: 600,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            Try again
          </button>
        </p>
        <Link
          to={authConfig.routes.login}
          className="btn-outline flex items-center justify-center gap-2 !w-auto mx-auto px-6"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    );

  return (
    <div className="animate-fade-up">
      <PageTitle
        title="Reset password"
        sub="Enter your email and we'll send you a reset link."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <Spinner />
          ) : (
            <>
              Send reset link <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link
          to={authConfig.routes.login}
          style={{
            fontSize: 13,
            color: "var(--muted-foreground)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          className="hover:underline"
        >
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
