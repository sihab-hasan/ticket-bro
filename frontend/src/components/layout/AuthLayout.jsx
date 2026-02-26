import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '@/context/AuthContext';
import authConfig from '../../config/auth.config';

// ── Branding Panel (Animated Sliding Side) ─────────────────────────────────────
const BrandingPanel = () => {
  return (
    <aside className="hidden md:flex md:w-[48%] flex-col justify-center items-center relative overflow-hidden bg-[#050505] px-12 border-x border-border/60">
      {/* Dynamic Animated Glow */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, var(--color-brand-primary, #ff3e00) 0%, transparent 70%)', 
            filter: 'blur(100px)' 
          }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <h1 className="font-brand font-[900] text-[5.5rem] lg:text-[7.5rem] tracking-tighter leading-[0.82] text-white">
          TICKET<br /><span className="text-brand-primary">BRO</span>
        </h1>
        
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-8 bg-brand-primary/40" />
          <p className="font-heading text-[0.6rem] font-black tracking-[0.5em] uppercase text-brand-primary">
            EST. 2024
          </p>
          <div className="h-px w-8 bg-brand-primary/40" />
        </div>
      </motion.div>
    </aside>
  );
};

// ── Auth Layout (Enhanced Design) ────────────────────────────────────────
const AuthLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterPage = location.pathname.includes('/register');

  useEffect(() => {
    if (isAuthenticated) navigate('/profile');
  }, [isAuthenticated, navigate]);

  return (
    <div className={`
      min-h-screen flex flex-col 
      ${isRegisterPage ? 'md:flex-row-reverse' : 'md:flex-row'} 
      bg-background text-foreground font-sans 
      transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
    `}>

      <BrandingPanel />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Decorative Grid/Noise Overlay (Optional design touch) */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Mobile Logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:hidden flex items-center gap-2 mb-12"
        >
          <div className="bg-brand-primary p-1.5 rounded shadow-lg shadow-brand-primary/20">
            <Ticket size={18} className="text-black" />
          </div>
          <span className="font-brand text-xl font-black tracking-tighter uppercase">
            {authConfig.appName ?? 'TicketBro'}
          </span>
        </motion.div>

        {/* Form Container with Layout Animation */}
        <motion.div 
          layout
          initial={{ opacity: 0, x: isRegisterPage ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[400px] relative z-10"
        >
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 p-1 rounded-3xl shadow-2xl">
            <div className="p-4 sm:p-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Subtle Bottom Credit */}
        <div className="absolute bottom-6 opacity-20 text-[10px] uppercase tracking-[0.3em] font-bold">
          Powered by TicketBro Core
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;