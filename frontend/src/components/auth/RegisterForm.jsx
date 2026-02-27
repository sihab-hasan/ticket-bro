import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { registerSchema, getPasswordStrength } from '@/utils/validators';
import useAuth from '@/context/AuthContext';
import SocialLogin from './SocialLogin';
import authConfig from '@/config/auth.config';

// ── Input Field ─────────────────────────────────────────────
const Field = ({ label, error, left, right, children }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <div className="flex items-center justify-between">
        {typeof label === 'string'
          ? <label className="text-[0.75rem] font-medium text-foreground">{label}</label>
          : label
        }
      </div>
    )}
    <div className={[
      'flex items-center gap-2 px-3 h-10 rounded-lg border bg-card transition-colors duration-150',
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
    {error && <p className="text-[0.7rem] text-destructive leading-none">{error}</p>}
  </div>
);

// ── Divider ─────────────────────────────────────────────
const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ── Spinner ─────────────────────────────────────────────
const Spinner = () => (
  <>
    <span
      className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black inline-block"
      style={{ animation: 'btnSpin 0.65s linear infinite' }}
    />
    <style>{`@keyframes btnSpin { to { transform: rotate(360deg); } }`}</style>
  </>
);

// ── Password requirement dot ─────────────────────────────
const Req = ({ met, label }) => (
  <div className="flex items-center gap-1.5">
    <div
      className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors duration-200"
      style={{ background: met ? 'oklch(0.5 0.15 142)' : 'var(--border)' }}
    >
      {met && <Check size={8} color="white" strokeWidth={3} />}
    </div>
    <span className={[
      'text-[0.65rem] transition-colors duration-200',
      met ? 'text-foreground' : 'text-muted-foreground',
    ].join(' ')}>
      {label}
    </span>
  </div>
);

// ── Register Form ─────────────────────────────────────────
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

  const pw = watch('password', '');
  const strength = getPasswordStrength(pw);

  const reqs = [
    { label: '8+ characters', met: pw.length >= 8 },
    { label: 'Uppercase',     met: /[A-Z]/.test(pw) },
    { label: 'Number',        met: /[0-9]/.test(pw) },
    { label: 'Special char',  met: /[@$!%*?&]/.test(pw) },
  ];

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-5">
        <h2
          className="font-heading font-extrabold tracking-tight text-foreground leading-tight mb-1"
          style={{ fontSize: 'clamp(1.3rem, 2vw, 1.5rem)' }}
        >
          Create account
        </h2>
        <p className="text-[0.78rem] text-muted-foreground">
          Sign up for free — no credit card required.
        </p>
      </div>

      {/* Social Login */}
      <SocialLogin />

      {/* Divider */}
      <Divider label="or register with email" />

      {/* Form */}
      <form onSubmit={handleSubmit(registerUser)} className="flex flex-col gap-3">

        {/* First / Last name */}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="First name" error={errors.firstName?.message} left={<User size={14} />}>
            <input {...register('firstName')} placeholder="John" />
          </Field>
          <Field label="Last name" error={errors.lastName?.message} left={<User size={14} />}>
            <input {...register('lastName')} placeholder="Doe" />
          </Field>
        </div>

        {/* Email */}
        <Field label="Email address" error={errors.email?.message} left={<Mail size={14} />}>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        {/* Phone (optional) */}
        <Field
          label={
            <label className="text-[0.75rem] font-medium text-foreground flex items-center gap-1">
              Phone <span className="text-[0.65rem] font-normal text-muted-foreground">(optional)</span>
            </label>
          }
          left={<Phone size={14} />}
        >
          <input {...register('phone')} type="tel" placeholder="+1 234 567 8900" />
        </Field>

        {/* Password + strength */}
        <div className="flex flex-col gap-0">
          <Field
            label="Password"
            error={errors.password?.message}
            left={<Lock size={14} />}
            right={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                className="hover:text-foreground transition-colors duration-150"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          >
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>

          {pw && (
            <div className="mt-2 flex flex-col gap-1.5">
              {/* Strength bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${strength.pct}%`, background: strength.color }}
                  />
                </div>
                <span
                  className="text-[0.65rem] font-semibold font-heading min-w-[48px] text-right transition-colors duration-200"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
              {/* Requirement dots */}
              <div className="grid grid-cols-2 gap-1">
                {reqs.map(r => <Req key={r.label} {...r} />)}
              </div>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <Field
          label="Confirm password"
          error={errors.confirmPassword?.message}
          left={<Lock size={14} />}
          right={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCp(v => !v)}
              className="hover:text-foreground transition-colors duration-150"
            >
              {showCp ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        >
          <input
            {...register('confirmPassword')}
            type={showCp ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            mt-1 w-full h-10 flex items-center justify-center gap-2
            rounded-lg bg-[#a3e635] text-black text-[0.85rem] font-semibold font-heading
            hover:brightness-110 active:brightness-95
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150 cursor-pointer
          "
        >
          {isLoading ? <Spinner /> : <><span>Create account</span><ArrowRight size={14} /></>}
        </button>

      </form>

      {/* Sign in link */}
      <p className="text-[0.75rem] text-muted-foreground text-center mt-5">
        Already have an account?{' '}
        <Link
          to={authConfig.routes.login}
          className="font-semibold font-heading text-foreground no-underline hover:text-[#a3e635] transition-colors duration-150"
        >
          Sign in →
        </Link>
      </p>

    </div>
  );
};

export default RegisterForm;