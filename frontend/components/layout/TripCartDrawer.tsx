"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTripCart } from "@/lib/tripCart/TripCartContext";
import CartGroupedList from "@/components/tripCart/CartGroupedList";

interface TripCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function TripCartDrawer({ open, onClose }: TripCartDrawerProps) {
  const t = useTranslations("cart");
  const { items } = useTripCart();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-navy-900/60" role="dialog" aria-modal="true" aria-label={t("title")} onClick={onClose}>
      <div
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-sm flex-col bg-cream-50 shadow-card-lg rtl:right-auto rtl:left-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cream-200 p-5">
          <h2 className="font-display text-lg font-bold text-forest-900">
            {t("title")} {items.length > 0 && `(${items.length})`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700 hover:bg-forest-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-lg font-bold text-forest-900">{t("emptyTitle")}</p>
              <p className="mt-2 max-w-xs text-sm text-forest-600">{t("emptyBody")}</p>
              <Link
                href="/destinations"
                onClick={onClose}
                className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
              >
                {t("browseDestinations")}
              </Link>
            </div>
          ) : (
            <>
              <CartGroupedList size="sm" />
              <Link
                href="/my-trip"
                onClick={onClose}
                className="mt-6 block rounded-full bg-orange-500 px-5 py-2.5 text-center text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
              >
                {t("reviewTrip")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
