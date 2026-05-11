"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onCancel(event: Event) {
      event.preventDefault();
      onClose();
    }

    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      className="m-auto max-h-[90vh] w-full max-w-lg overflow-hidden rounded-[28px] p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className={["rb-surface flex flex-col", className].join(" ")}>
        <div className="flex items-center justify-between border-b border-inherit px-6 py-4">
          <h2 className="rb-text-strong text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rb-button-secondary rounded-full p-1.5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </dialog>
  );
}
