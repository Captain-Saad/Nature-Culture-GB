"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-forest-200 bg-white/70 p-0.5 text-sm font-semibold ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          aria-pressed={locale === loc}
          className={`rounded-full px-3 py-1 transition-colors ${
            locale === loc
              ? "bg-forest-700 text-cream-50"
              : "text-forest-700 hover:bg-forest-50"
          }`}
        >
          {loc === "en" ? "EN" : "اردو"}
        </button>
      ))}
    </div>
  );
}
