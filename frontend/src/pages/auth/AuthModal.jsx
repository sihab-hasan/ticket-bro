import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import OTPVerification from "../../components/auth/OTPVerification";

import authService from "../../services/authService";
import { selectRequires2FA } from "../../store/slices/authSlice";
import authConfig from "../../config/auth.config";

import { useTheme } from "../../context/ThemeContext";

import darkLogo from "@/assets/images/ticket-bro-logo-dark-mode.png";
import lightLogo from "@/assets/images/ticket-bro-logo-light-mode.png";

const AuthModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const authType = searchParams.get("auth");
  const requires2FA = useSelector(selectRequires2FA);
  const { isDark } = useTheme();

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const closeModal = () => {
    searchParams.delete("auth");
    searchParams.delete("token");
    setSearchParams(searchParams);
  };

  // --- SCROLL LOCK ---
  useEffect(() => {
    if (authType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [authType]);

  // --- EMAIL VERIFICATION ---
  useEffect(() => {
    if (authType === "verify") {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      const verify = async () => {
        setStatus("loading");
        try {
          const res = await authService.verifyEmail(token);
          setStatus("success");
          setMessage(res.data?.message || "Email verified successfully.");
        } catch (err) {
          setStatus("error");
          setMessage(err.response?.data?.message || "Verification failed.");
        }
      };

      verify();
    }
  }, [authType, searchParams]);

  // --- REDIRECT IF 2FA NOT REQUIRED ---
  useEffect(() => {
    if (authType === "otp" && !requires2FA) {
      navigate(authConfig.routes.login, { replace: true });
    }
  }, [authType, requires2FA, navigate]);

  if (!authType) return null;

  const renderContent = () => {
    switch (authType) {
      case "login":
        return <LoginForm />;
      case "register":
        return <RegisterForm />;
      case "forgot":
        return <ForgotPasswordForm />;
      case "reset":
        return <ResetPasswordForm />;
      case "otp":
        return <OTPVerification />;
      case "verify":
        return renderVerifyState();
      default:
        return null;
    }
  };

  const renderVerifyState = () => {
    if (status === "loading") {
      return (
        <div className="text-center space-y-1 py-3">
          <Loader2
            className="animate-spin mx-auto text-muted-foreground"
            size={24}
          />
          <p className="text-xs text-muted-foreground">
            Verifying your email...
          </p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center space-y-1 py-3">
          <CheckCircle2 size={28} className="mx-auto text-green-500" />
          <h2 className="text-base font-semibold">Email verified!</h2>
          <p className="text-xs text-muted-foreground">{message}</p>
          <button
            onClick={() => navigate(authConfig.routes.login)}
            className="mt-2 w-full rounded-md bg-primary text-primary-foreground py-1.5 text-sm font-medium transition hover:opacity-90"
          >
            Continue
          </button>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center space-y-1 py-3">
          <XCircle size={28} className="mx-auto text-destructive" />
          <h2 className="text-base font-semibold">Verification Failed</h2>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {authType && (
        <motion.div
          key="auth-overlay"
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            key="auth-modal"
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100vh", opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-[460px] mx-2 rounded-xl bg-card shadow-md max-h-[90vh] overflow-auto"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="px-4 pt-4 pb-2 text-center border-b border-border flex flex-col items-center space-y-1">
              <img
                src={isDark ? darkLogo : lightLogo}
                alt="TicketBro Logo"
                className="h-8"
              />
              <h1 className="text-xl font-bold font-brand tracking-tight">
                Ticket Bro
              </h1>
            </div>

            {/* Body */}
            <div className="px-8 py-4">{renderContent()}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;