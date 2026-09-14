import { useTranslations } from "next-intl";
import { FaMapMarkedAlt, FaHandHoldingUsd, FaLandmark, FaShieldAlt } from "react-icons/fa";
import ScrollReveal from "@/components/shared/ScrollReveal";

const POINTS = [
  { key: "point1", Icon: FaMapMarkedAlt },
  { key: "point2", Icon: FaHandHoldingUsd },
  { key: "point3", Icon: FaLandmark },
  { key: "point4", Icon: FaShieldAlt },
];

export default function WhyUs() {
  const t = useTranslations("home.why");

  return (
    <section className="bg-cream-100 py-16 sm:py-20">
      <div className="container-content">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-bold text-forest-900 sm:text-3xl">{t("title")}</h2>
          <p className="mt-2 text-forest-600">{t("subtitle")}</p>
        </div>

        <ScrollReveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ key, Icon }) => (
            <div key={key} className="rounded-card bg-white p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-forest-900">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2 text-sm text-forest-600">{t(`${key}Body`)}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
