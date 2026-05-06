"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionFadeProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function MotionFade({ children, delay = 0, className }: MotionFadeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}