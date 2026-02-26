// frontend/src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginSchema } from '@/utils/validators';
import useAuth from '@/context/AuthContext';
import authConfig from '@/config/auth.config';
import SocialLogin from './SocialLogin';

// ── Input Field ───────────────────────────────────────────────────────────────
const Field = ({ label, error, left, right, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <div className="flex items-center justify-between">
        {typeof label === 'string'
          ? <label className="text-[0.78rem] font-medium text-foreground">{label}</label>
          : label
        }
      </div>
    )}
    <div className={[
      'flex items-center gap-2.5 px-3 h-11 rounded-lg border bg-card transition-colors duration-150',
      error
        ? 'border-destructive'
        : 'border-input focus-within:border-ring hover:border-ring/60',
    ].join(' ')}>
      {left && <span className="flex-shrink-0 text-muted-foreground">{left}</span>}
      <div className="flex-1 min-w-0 [&_input]:w-full [&_input]:bg-transparent [&_input]:outline-none [&_input]:border-none [&_input]:text-[0.875rem] [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground/50 [&_input]:leading-none">
        {children}
      </div>
      {right && <span className="flex-shrink-0 text-muted-foreground">{right}</span>}
    </div>
    {error && <p className="text-[0.72rem] text-destructive leading-none">{error}</p>}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <>
    <span
      className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black inline-block"
      style={{ animation: 'btnSpin 0.65s linear infinite' }}
    />
    <style>{`@keyframes btnSpin { to { transform: rotate(360deg); } }`}</style>
  </>
);

// ── Login Form ────────────────────────────────────────────────────────────────
const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-7">
        <h2
          className="font-heading font-extrabold tracking-tight text-foreground leading-tight mb-1.5"
          style={{ fontSize: 'clamp(1.4rem, 2vw, 1.65rem)' }}
        >
          Sign in
        </h2>
        <p className="text-[0.82rem] text-muted-foreground">
          Welcome back — enter your details below.
        </p>
      </div>

      {/* Social */}
      <SocialLogin />

      {/* Divider */}
      <Divider label="or sign in with email" />

      {/* Form */}
      <form onSubmit={handleSubmit(login)} className="flex flex-col gap-4">

        {/* Email */}
        <Field
          label="Email address"
          error={errors.email?.message}
          left={<Mail size={15} />}
        >
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        {/* Password */}
        <Field
          label={
            <div className="flex items-center justify-between w-full">
              <label className="text-[0.78rem] font-medium text-foreground">
                Password
              </label>
              <Link
                to={authConfig.routes.forgotPassword}
                tabIndex={-1}
                className="text-[0.72rem] text-muted-foreground hover:text-[#a3e635] transition-colors duration-150 no-underline"
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
              tabIndex={-1}
              onClick={() => setShowPw(v => !v)}
              className="hover:text-foreground transition-colors duration-150"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        >
          <input
            {...register('password')}
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>

        {/* Remember me — custom checkbox using CSS vars */}
        <label className="flex items-center gap-2.5 cursor-pointer w-fit group">
          <div className="relative flex-shrink-0">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="peer sr-only"
            />
            {/* Track */}
            <div
              className="w-4 h-4 rounded border border-input bg-card flex items-center justify-center
                peer-checked:bg-[#a3e635] peer-checked:border-[#a3e635]
                transition-colors duration-150"
            />
            {/* Checkmark — shown via peer */}
            <svg
              className="absolute inset-0 m-auto w-2.5 h-2.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none"
              viewBox="0 0 10 8" fill="none"
            >
              <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[0.78rem] text-muted-foreground group-hover:text-foreground transition-colors duration-150 select-none">
            Remember me for 7 days
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            mt-1 w-full h-11 flex items-center justify-center gap-2
            rounded-lg bg-[#a3e635] text-black text-[0.875rem] font-semibold font-heading
            hover:brightness-110 active:brightness-95
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150 cursor-pointer
          "
        >
          {isLoading ? <Spinner /> : <><span>Sign in</span><ArrowRight size={15} /></>}
        </button>

      </form>

      {/* Register link */}
      <p className="text-[0.8rem] text-muted-foreground text-center mt-6">
        Don't have an account?{' '}
        <Link
          to={authConfig.routes.register}
          className="font-semibold font-heading text-foreground no-underline hover:text-[#a3e635] transition-colors duration-150"
        >
          Create one free →
        </Link>
      </p>

    </div>
  );
};

export default LoginForm;