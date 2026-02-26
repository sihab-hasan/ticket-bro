import React from 'react';
import { AlertCircle } from 'lucide-react';

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = React.forwardRef(({ error, className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`input-base ${error ? 'error' : ''} ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

// ── InputWrapper (icon support) ───────────────────────────────────────────────
export const InputGroup = ({ label, error, left, right, children }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <div className="relative">
      {left && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--muted-foreground)' }}>
          {left}
        </div>
      )}
      {React.cloneElement(children, {
        className: `input-base ${error ? 'error' : ''} ${left ? 'pl-9' : ''} ${right ? 'pr-10' : ''}`,
      })}
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {right}
        </div>
      )}
    </div>
    {error && (
      <p className="error-msg">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ label = 'or' }) => (
  <div className="divider my-5 text-xs">{label}</div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 16 }) => (
  <span className="spinner" style={{ width: size, height: size }} />
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default' }) => {
  const colors = {
    default:  {},
    success: { background: 'oklch(0.22 0.04 142)', color: 'oklch(0.79 0.15 150)', borderColor: 'oklch(0.79 0.15 150 / 20%)' },
    danger:  { background: 'oklch(0.22 0.04 27)',  color: 'var(--destructive)',    borderColor: 'oklch(0.57 0.24 27 / 20%)' },
  };
  return (
    <span className="badge" style={colors[variant]}>
      {children}
    </span>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '' }) => (
  <div className={`card p-6 ${className}`}>{children}</div>
);

// ── PageTitle ─────────────────────────────────────────────────────────────────
export const PageTitle = ({ title, sub }) => (
  <div className="mb-7">
    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}
      className="text-2xl font-extrabold tracking-tight leading-tight mb-1">
      {title}
    </h2>
    {sub && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
  </div>
);

