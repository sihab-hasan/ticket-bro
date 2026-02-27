import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/context/AuthContext";
import authConfig from "../../config/auth.config";

const AuthLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) navigate("/profile");
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground font-sans px-6 py-12 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--color-brand-primary, #ff3e00) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* 🔹 STATIC Brand (No motion) */}
        <div className="flex items-center justify-center gap-2 mb-10 select-none">
          <div className="bg-brand-primary p-2 rounded-lg shadow-lg shadow-brand-primary/20">
            <Ticket size={20} className="text-black" />
          </div>
          <span className="font-brand text-2xl font-black tracking-tight uppercase">
            {authConfig.appName ?? "TicketBro"}
          </span>
        </div>

        {/* Card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-[11px] tracking-[0.25em] uppercase opacity-30 font-semibold">
          Powered by TicketBro Core
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;