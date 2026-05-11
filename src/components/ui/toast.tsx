"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "warn" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (opts: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig: Record<ToastVariant, { icon: ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />,
    className: "rb-badge-success",
  },
  error: {
    icon: <XCircle className="h-4 w-4 shrink-0 text-rose-500" />,
    className: "rb-badge-danger",
  },
  warn: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />,
    className: "rb-badge-warn",
  },
  info: {
    icon: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
    className: "rb-badge-info",
  },
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(t.id), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [t.id, onDismiss]);

  const config = variantConfig[t.variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        "rb-overlay flex w-80 items-start gap-3 rounded-2xl p-4 shadow-lg",
        config.className,
      ].join(" ")}
    >
      {config.icon}
      <div className="flex-1 text-sm">
        <p className="font-semibold">{t.title}</p>
        {t.description ? <p className="mt-0.5 opacity-80">{t.description}</p> : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(t.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
