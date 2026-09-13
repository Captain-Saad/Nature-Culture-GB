"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import SearchBar from "@/components/shared/SearchBar";
import GlareHover from "@/components/shared/GlareHover";
import { Link } from "@/i18n/navigation";
import { placeholderImage } from "@/lib/utils/image";

export default function Hero() {
  const t = useTranslations("home.hero");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-line]",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/destinations?q=${encodeURIComponent(query)}` : "/destinations");
  }

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-navy-900">
      <Image
        src={placeholderImage("hero-mountains", 1920, 1080)}
        alt="Mountain range in Gilgit-Baltistan"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/50 to-navy-900" />

      <div className="container-content relative flex min-h-[85vh] flex-col items-center justify-center py-24 text-center text-cream-50">
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          <span data-hero-line className="block overflow-hidden">
            {t("title")}
          </span>
          <span data-hero-line className="block overflow-hidden text-orange-300">
            {t("titleLine2")}
          </span>
        </h1>

        <p data-hero-fade className="mt-6 max-w-xl text-balance text-lg text-cream-100/90">
          {t("subtitle")}
        </p>

        <form data-hero-fade onSubmit={handleSearch} className="mt-8 w-full max-w-lg">
          <SearchBar value={query} onChange={setQuery} />
        </form>

        <div data-hero-fade className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <GlareHover className="rounded-full">
            <Link
              href="/#explore"
              className="block rounded-full border-2 border-cream-100 px-6 py-3 text-sm font-bold text-cream-50 transition-colors hover:bg-cream-50/10"
            >
              {t("ctaExplore")}
            </Link>
          </GlareHover>
          <GlareHover className="rounded-full">
            <Link
              href="/plan-my-trip"
              className="block rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
            >
              {t("ctaPlan")}
            </Link>
          </GlareHover>
        </div>
      </div>
    </section>
  );
}
