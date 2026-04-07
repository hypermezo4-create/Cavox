"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
}

export function PremiumButton({ children, onClick, className, icon, loading, type = "button" }: PremiumButtonProps) {
  const [particles, setParticles] = useState<number[]>([]);

  const handleClick = () => {
    const now = Date.now();
    setParticles((prev) => [...prev, now]);
    setTimeout(() => setParticles((prev) => prev.filter((item) => item !== now)), 1000);
    onClick?.();
  };

  return (
    <div className="relative inline-flex">
      <AnimatePresence>
        {particles.map((id) => (
          <motion.div
            key={id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 2, y: -50 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ x: 0, y: 0 }}
                animate={{ x: (index - 2.5) * 40, y: (Math.random() - 0.5) * 60 }}
                className="h-1 w-1 rounded-full bg-amber-400"
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        type={type}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 px-8 py-4 text-sm font-black uppercase tracking-tight text-white shadow-xl shadow-amber-600/20 transition-all duration-300 hover:brightness-110 hover:shadow-amber-500/40 active:brightness-90",
          className,
        )}
      >
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <>{children}{icon}</>}
        </span>
      </motion.button>
    </div>
  );
}
