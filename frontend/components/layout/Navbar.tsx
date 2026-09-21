"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navLinks } from "@/lib/nav-links";
import LanguageSwitcher from "./LanguageSwitcher";
import GlareHover from "@/components/shared/GlareHover";
import TripCartDrawer from "./TripCartDrawer";
import { useTripCart } from "@/lib/tripCart/TripCartContext";

function CartButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  const t = useTranslations("cart");
  const { count } = useTripCart();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("title")}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-forest-200 text-forest-800 hover:bg-forest-50 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 4h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 6M7 13l-1.5 6h11M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white rtl:-left-1 rtl:right-auto">
          {count}
        </span>
      )}
    </button>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-forest-100 bg-cream-50/90 backdrop-blur">
      <nav className="container-content flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-forest-700 bg-cream-100 text-forest-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 18l5-8 4 5 3-4 6 7H3z" />
              <path d="M14 6l-2 3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden sm:inline">Nature &amp; Culture GB</span>
        </Link>

        <ul className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-semibold text-forest-800 transition-colors hover:text-orange-600"
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <CartButton onClick={() => setCartOpen(true)} />
          <GlareHover className="rounded-full">
            <Link
              href="/plan-my-trip"
              className="block rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
            >
              {t("planMyTrip")}
            </Link>
          </GlareHover>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartButton onClick={() => setCartOpen(true)} />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-200"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-forest-800" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-forest-100 bg-cream-50 px-5 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1.5 text-base font-semibold text-forest-800"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitcher />
            <Link
              href="/plan-my-trip"
              onClick={() => setOpen(false)}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card"
            >
              {t("planMyTrip")}
            </Link>
          </div>
        </div>
      )}

      <TripCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
