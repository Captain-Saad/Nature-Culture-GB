import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import GlareHover from "@/components/shared/GlareHover";

export default function FinalCta() {
  const t = useTranslations("home.finalCta");

  return (
    <section className="bg-forest-gradient py-20 text-center text-cream-50">
      <div className="container-content">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-cream-100/90">{t("subtitle")}</p>
        <div className="mt-8 flex justify-center">
          <GlareHover className="rounded-full">
            <Link
              href="/plan-my-trip"
              className="block rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
            >
              {t("cta")}
            </Link>
          </GlareHover>
        </div>
      </div>
    </section>
  );
}
