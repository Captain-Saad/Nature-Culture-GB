"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /**
   * "md" (default) is the original compact centered dialog, unchanged.
   * "lg" is for content-heavy modals (image gallery, long detail lists):
   * a full-screen sheet below the sm breakpoint, a wide centered dialog
   * above it — rather than a large box awkwardly centered on a phone
   * screen.
   */
  size?: "md" | "lg";
}

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const isLarge = size === "lg";

  return createPortal(
    <div
      className={
        isLarge
          ? "fixed inset-0 z-[100] bg-navy-900/60 sm:flex sm:items-center sm:justify-center sm:p-4"
          : "fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 p-4"
      }
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={
          isLarge
            ? "h-full w-full overflow-y-auto bg-cream-50 p-6 shadow-card-lg sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-2xl sm:rounded-card"
            : "w-full max-w-md rounded-card bg-cream-50 p-6 shadow-card-lg"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          {title && (
            <h2 className="font-display text-xl font-bold text-forest-900">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
