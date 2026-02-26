import React, { useRef, useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { Spinner } from "../shared/ui";
import useAuth from "../../context/AuthContext";

const OTPVerification = () => {
  const { verify2FA, twoFactorEmail, isLoading, error } = useAuth();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const change = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) submit(next.join(""));
  };

  const keydown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const paste = (e) => {
    e.preventDefault();
    const d = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    const next = Array(6).fill("");
    d.forEach((c, i) => {
      next[i] = c;
    });
    setOtp(next);
    if (d.length === 6) submit(d.join(""));
    else refs.current[d.length]?.focus();
  };

  const submit = (code) => verify2FA(twoFactorEmail, code);

  return (
    <div className="animate-fade-up text-center">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "calc(var(--radius)*3)",
          background: "var(--muted)",
          border: "1.5px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <ShieldCheck size={22} style={{ color: "var(--foreground)" }} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 22,
          fontWeight: 800,
          color: "var(--foreground)",
          marginBottom: 6,
        }}
      >
        Two-factor auth
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--muted-foreground)",
          marginBottom: 4,
        }}
      >
        Code sent to
      </p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--foreground)",
          marginBottom: 28,
          fontFamily: "var(--font-heading)",
        }}
      >
        {twoFactorEmail}
      </p>

      <div className="flex justify-center gap-2 mb-4" onPaste={paste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => change(i, e.target.value)}
            onKeyDown={(e) => keydown(i, e)}
            className={`otp-cell ${digit ? "filled" : ""}`}
          />
        ))}
      </div>

      {error && (
        <p
          style={{
            color: "var(--destructive)",
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      )}
      {isLoading && (
        <div className="flex justify-center mb-3">
          <Spinner size={18} />
        </div>
      )}
      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
        Code expires in 10 minutes
      </p>
    </div>
  );
};

export default OTPVerification;
