import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, id, className = "", ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="rb-text-body block text-sm font-medium">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        rows={4}
        className={[
          "rb-field w-full resize-y rounded-xl px-3 py-2 text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          error ? "border-rose-400 focus:ring-rose-400" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="rb-text-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
