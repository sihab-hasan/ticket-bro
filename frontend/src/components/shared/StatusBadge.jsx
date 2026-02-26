import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

const StatusBadge = ({ status = "", className = "" }) => {
  // Normalize status string to handle data from CONFIG.STATUS (e.g., "LAST_CHANCE")
  const normalizedStatus = (status || "").toUpperCase().trim().replace(/\s+/g, '_');

  const configs = {
    ONGOING: {
      label: "Live Now",
      // Using your --color-brand-primary variable
      styles: "bg-brand-primary/10 text-brand-primary border-brand-primary/30 backdrop-blur-md",
      icon: (
        <span className="relative flex h-1.5 w-1.5 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-primary"></span>
        </span>
      ),
      glow: "shadow-[0_0_12px_-2px_rgba(163,230,53,0.3)]"
    },
    LAST_CHANCE: {
      label: "Last Chance",
      // Using your --color-destructive variable
      styles: "bg-destructive text-white border-white/20 font-bold",
      icon: (
        <motion.div
          animate={{ x: [0, -1, 1, -1, 1, 0], opacity: [1, 0.7, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          className="mr-1"
        >
          <AlertTriangle size={10} strokeWidth={3} />
        </motion.div>
      ),
      motionProps: {
        animate: { 
          boxShadow: [
            "0 0 0px 0px rgba(220, 38, 38, 0)",
            "0 0 12px 2px rgba(220, 38, 38, 0.4)",
            "0 0 0px 0px rgba(220, 38, 38, 0)"
          ]
        },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
    },
    UPCOMING: {
      label: "Upcoming",
      styles: "bg-secondary text-secondary-foreground border-border/50 backdrop-blur-sm",
      icon: <Clock size={10} className="mr-1 opacity-80" />
    },
    SOLD_OUT: {
      label: "Sold Out",
      styles: "bg-zinc-950/60 text-zinc-500 border-zinc-800 backdrop-blur-sm",
      icon: <Lock size={10} className="mr-1" />
    },
    COMPLETED: {
      label: "Archived",
      styles: "bg-muted text-muted-foreground border-border/20",
      icon: <CheckCircle size={10} className="mr-1" />
    }
  };

  const config = configs[normalizedStatus] || { 
    label: status, 
    styles: "bg-zinc-800 text-zinc-300 border-zinc-700", 
    icon: null 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -8, filter: "blur(4px)" }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        filter: "blur(0px)",
        ...(config.motionProps?.animate || {})
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        ...(config.motionProps?.transition || {})
      }}
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center justify-center 
        px-2.5 py-0.5 rounded-xs border-xs
        text-[9px] font-black uppercase tracking-[0.25em]
        transition-all duration-300 select-none
        ${config.styles} 
        ${config.glow || ""}
        ${className}
      `}
    >
      {config.icon}
      <span className="font-sans leading-none mt-[1.5px] antialiased">
        {config.label}
      </span>
    </motion.div>
  );
};

export default StatusBadge;