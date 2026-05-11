"use client";

import { type ReactNode, useRef, useState } from "react";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  }

  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }

  const positionClass = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
    left: "right-full top-1/2 mr-2 -translate-y-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
  }[side];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible ? (
        <span
          role="tooltip"
          className={[
            "rb-overlay pointer-events-none absolute z-50 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs",
            positionClass,
          ].join(" ")}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
