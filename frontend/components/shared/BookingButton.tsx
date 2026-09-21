"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "./Modal";
import GlareHover from "./GlareHover";
import { PHONE_NUMBERS, WHATSAPP_NUMBER } from "@/lib/businessContact";

interface BookingButtonProps {
  label?: string;
  className?: string;
  wrapperClassName?: string;
  context?: string;
}

export default function BookingButton({
  label,
  className = "",
  wrapperClassName = "inline-block",
  context,
}: BookingButtonProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlareHover className={`rounded-full ${wrapperClassName}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`w-full rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 ${className}`}
        >
          {label ?? t("common.bookNow")}
        </button>
      </GlareHover>

      <Modal open={open} onClose={() => setOpen(false)} title={t("booking.modalTitle")}>
        <p className="text-sm text-forest-700">{t("booking.modalBody")}</p>
        {context && (
          <p className="mt-2 text-sm font-semibold text-forest-900">{context}</p>
        )}

        <div className="mt-5 space-y-2">
          {PHONE_NUMBERS.map((num) => (
            <p key={num} className="font-display text-lg font-bold text-forest-900">
              {num}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={`tel:${PHONE_NUMBERS[0].replace(/\s/g, "")}`}
            className="flex-1 rounded-full bg-forest-700 px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-forest-800"
          >
            {t("booking.callAction")}
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full border-2 border-forest-700 px-5 py-2.5 text-center text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50"
          >
            {t("booking.whatsappAction")}
          </a>
        </div>
      </Modal>
    </>
  );
}
