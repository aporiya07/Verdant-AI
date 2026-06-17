"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function GlassCard({ children, className, hover = false, glow = false, onClick, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn("glass p-5", onClick && "cursor-pointer", className)}
      style={glow ? { boxShadow: "0 0 30px rgba(52,211,153,0.08)" } : undefined}
    >
      {children}
    </motion.div>
  );
}
