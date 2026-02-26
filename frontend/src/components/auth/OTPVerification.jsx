// frontend/src/components/auth/OTPVerification.jsx
import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import useAuth from '@/context/AuthContext';

// ── Spinner (consistent with other auth forms) ────────────────────────────────
const Spinner = () => (
  <>
    <span
      className="w-4 h-4 rounded-full border-2 border-foreground/20 border-t-foreground inline-block"
      style={{ animation: 'otpSpin 0.65s linear infinite' }}
    />
    <style>{`@keyframes otpSpin { to { transform: rotate(360deg); } }`}</style>
  </>
);

// ── OTP Verification ──────────────────────────────────────────────────────────
const OTPVerification = () => {
  const { verify2FA, twoFactorEmail, isLoading, error } = useAuth();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const refs          = useRef([]);

  // Auto-focus first cell on mount
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const submit = (code) => verify2FA(twoFactorEmail, code);

  const change = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d !== '')) submit(next.join(''));
  };

  const keydown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const paste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next   = Array(6).fill('');
    digits.forEach((c, i) => { next[i] = c; });
    setOtp(next);
    if (digits.length === 6) submit(digits.join(''));
    else refs.current[digits.length]?.focus();
  };

  return (
    <div className="w-full text-center">

      {/* Icon */}
      <div
        className="w-13 h-13 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto mb-5"
        style={{ width: 52, height: 52, borderRadius: 'calc(var(--radius) * 3)' }}
      >
        <ShieldCheck size={22} className="text-foreground" />
      </div>

      {/* Heading */}
      <h2
        className="font-heading font-extrabold tracking-tight text-foreground leading-tight mb-1.5"
        style={{ fontSize: 'clamp(1.4rem, 2vw, 1.65rem)' }}
      >
        Two-factor auth
      </h2>

      {/* Email */}
      <p className="text-[0.82rem] text-muted-foreground mb-1">
        Code sent to
      </p>
      <p className="text-[0.88rem] font-semibold font-heading text-foreground mb-7">
        {twoFactorEmail}
      </p>

      {/* OTP inputs */}
      <div
        className="flex items-center justify-center gap-2.5 mb-5"
        onPaste={paste}
      >
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => change(i, e.target.value)}
            onKeyDown={e => keydown(i, e)}
            className={[
              // base
              'w-11 h-13 text-center text-[1.1rem] font-semibold font-heading',
              'rounded-lg border bg-card text-foreground',
              'outline-none transition-colors duration-150',
              'caret-[#a3e635]',
              // state
              digit
                ? 'border-[#a3e635]/60 bg-[#a3e635]/[0.04]'
                : 'border-input hover:border-ring/60 focus:border-ring',
            ].join(' ')}
            style={{ height: 52 }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[0.75rem] text-destructive mb-3 leading-none">
          {error}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center mb-4">
          <Spinner />
        </div>
      )}

      {/* Expiry hint */}
      <p className="text-[0.7rem] text-muted-foreground">
        Code expires in <span className="font-medium text-foreground">10 minutes</span>
      </p>

    </div>
  );
};

export default OTPVerification;