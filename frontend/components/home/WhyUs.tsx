import { useTranslations } from "next-intl";
import {
  FaMapMarkedAlt,
  FaHandHoldingUsd,
  FaLandmark,
  FaShieldAlt,
  FaMountain,
  FaHeart,
  FaCompass,
  FaStar,
} from "react-icons/fa";
import ScrollReveal from "@/components/shared/ScrollReveal";
import type { ContentCard } from "@/lib/siteContent";

// Points beyond the icon list reuse icons from the start.
const ICONS = [FaMapMarkedAlt, FaHandHoldingUsd, FaLandmark, FaShieldAlt, FaMountain, FaHeart, FaCompass, FaStar];

interface WhyUsProps {
  /** Admin overrides from Site Settings; null = the translated defaults. */
  title?: string | null;
  subtitle?: string | null;
  points?: ContentCard[] | null;
}

export default function WhyUs({ title, subtitle, points }: WhyUsProps) {
  const t = useTranslations("home.why");
  const cards: ContentCard[] =
    points ?? [1, 2, 3, 4].map((n) => ({ title: t(`point${n}Title`), body: t(`point${n}Body`) }));

  return (
    <section className="bg-cream-100 py-16 sm:py-20">
      <div className="container-content">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">{title || t("title")}</h2>
          <p className="mt-2 text-forest-600">{subtitle || t("subtitle")}</p>
        </div>

        <ScrollReveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={`${card.title}-${i}`} className="rounded-card bg-white p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-forest-900">{card.title}</h3>
                {card.body && <p className="mt-2 text-sm text-forest-600">{card.body}</p>}
              </div>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
