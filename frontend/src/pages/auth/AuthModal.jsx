// ── LoginPage ──────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import OTPVerification from '../../components/auth/OTPVerification';
import authService from '../../services/authService';
import { useSelector } from 'react-redux';
import { selectRequires2FA } from '../../store/slices/authSlice';
import authConfig from '../../config/auth.config';

export const LoginPage = () => (
  <AuthLayout heading={"Welcome\nback."} sub="Sign in to continue — your data is safe and secure.">
    <LoginForm />
  </AuthLayout>
);

export const RegisterPage = () => (
  <AuthLayout heading={"Create your\naccount."} sub="Join thousands of users. Free forever, no credit card needed.">
    <RegisterForm />
  </AuthLayout>
);

export const ForgotPasswordPage = () => (
  <AuthLayout heading={"Forgot your\npassword?"} sub="No worries — we'll send a reset link straight to your inbox.">
    <ForgotPasswordForm />
  </AuthLayout>
);

export const ResetPasswordPage = () => (
  <AuthLayout heading={"Set a new\npassword."} sub="Choose something strong. We'll log you in right after.">
    <ResetPasswordForm />
  </AuthLayout>
);

export const OTPVerificationPage = () => {
  const requires2FA = useSelector(selectRequires2FA);
  if (!requires2FA) return <Navigate to={authConfig.routes.login} replace />;
  return (
    <AuthLayout heading={"Verify\nyour identity."} sub="Enter the 6-digit code we just sent to your email.">
      <OTPVerification />
    </AuthLayout>
  );
};

export const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No token provided.'); return; }
    authService.verifyEmail(token)
      .then((r) => { setStatus('success'); setMessage(r.data.message); })
      .catch((e) => { setStatus('error'); setMessage(e.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <AuthLayout heading={"Verifying\nyour email."} sub="Hang tight — we're confirming your address.">
      <div className="animate-fade-up text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={36} style={{ color: 'var(--foreground)', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={40} style={{ color: 'oklch(0.5 0.15 142)', margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--foreground)', marginBottom: 8 }}>Email verified!</h2>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 24 }}>{message}</p>
            <Link to={authConfig.routes.login} className="btn-primary !w-auto px-8">Continue to sign in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={40} style={{ color: 'var(--destructive)', margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--foreground)', marginBottom: 8 }}>Verification failed</h2>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 24 }}>{message}</p>
            <Link to="/auth/resend-verification" className="btn-outline !w-auto px-8">Resend email</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};