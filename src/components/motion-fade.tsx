"use client";

import type { ReactNode } from "react";

type MotionFadeProps = {
  children: ReactNode;
  className?: string;
};

export function MotionFade({ children, className }: MotionFadeProps) {
  return <div className={className}>{children}</div>;
}