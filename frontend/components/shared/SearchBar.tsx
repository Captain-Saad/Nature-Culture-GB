"use client";

import { useTranslations } from "next-intl";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder, className = "" }: SearchBarProps) {
  const t = useTranslations("common");

  return (
    <div className={`relative flex items-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 h-5 w-5 text-forest-400 rtl:left-auto rtl:right-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("searchPlaceholder")}
        aria-label={t("search")}
        className="w-full rounded-full border border-cream-300 bg-white py-3 pl-11 pr-4 text-sm text-forest-900 shadow-card outline-none transition-shadow focus:shadow-card-lg rtl:pl-4 rtl:pr-11"
      />
    </div>
  );
}
