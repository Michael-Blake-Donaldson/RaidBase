"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={[
        "rb-surface-soft flex flex-col items-center justify-center rounded-[28px] px-6 py-16 text-center",
        className,
      ].join(" ")}
    >
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h3 className="rb-text-strong text-lg font-semibold">{title}</h3>
      <p className="rb-text-muted mt-2 max-w-sm text-sm leading-7">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
