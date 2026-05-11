"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "right" | "left";
};

export function Drawer({ open, onClose, title, children, side = "right" }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={[
          "rb-surface absolute top-0 flex h-full w-full max-w-md flex-col",
          side === "right" ? "right-0" : "left-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-inherit px-6 py-4">
          <h2 id="drawer-title" className="rb-text-strong text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rb-button-secondary rounded-full p-1.5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
