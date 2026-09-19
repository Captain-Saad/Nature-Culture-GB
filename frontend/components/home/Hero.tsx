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
import { resolveMediaUrl, canUseNextImage } from "@/lib/utils/media";

interface HeroProps {
  /** From site settings; null means "use the built-in default". */
  headline?: string | null;
  subtext?: string | null;
  backgroundImage?: string | null;
  backgroundVideo?: string | null;
}

export default function Hero({ headline, subtext, backgroundImage, backgroundVideo }: HeroProps) {
  const t = useTranslations("home.hero");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Starts false so the server and the first client render agree (no
  // hydration mismatch) and so phones never begin downloading the video.
  // The effect below upgrades to video only where it's appropriate.
  const [playVideo, setPlayVideo] = useState(false);

  const posterUrl = backgroundImage
    ? resolveMediaUrl(backgroundImage)
    : placeholderImage("hero-mountains", 1920, 1080);
  const videoUrl = backgroundVideo ? resolveMediaUrl(backgroundVideo) : null;

  useEffect(() => {
    if (!videoUrl) {
      setPlayVideo(false);
      return;
    }

    // A background video is decoration: skip it on small screens (data cost,
    // and it's mostly hidden behind the text anyway) and whenever the visitor
    // has asked for reduced motion. Both show the poster image instead.
    const small = window.matchMedia("(max-width: 767px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setPlayVideo(!small.matches && !reduced.matches);
    update();

    small.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      small.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, [videoUrl]);

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
      {playVideo && videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          // Decorative background: a screen reader has nothing to gain here,
          // and the hero's real content is the heading below.
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      ) : canUseNextImage(posterUrl) ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL outside next.config's remotePatterns
        <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      )}

      {/* Keeps the headline readable over any image or video an admin sets. */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/50 to-navy-900" />

      <div className="container-content relative flex min-h-[85vh] flex-col items-center justify-center py-24 text-center text-cream-50">
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          {headline ? (
            <span data-hero-line className="block overflow-hidden">
              {headline}
            </span>
          ) : (
            <>
              <span data-hero-line className="block overflow-hidden">
                {t("title")}
              </span>
              <span data-hero-line className="block overflow-hidden text-orange-300">
                {t("titleLine2")}
              </span>
            </>
          )}
        </h1>

        <p data-hero-fade className="mt-6 max-w-xl text-balance text-lg text-cream-100/90">
          {subtext || t("subtitle")}
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
