import { useTranslations } from "next-intl";
import { FaMountain, FaHandsHelping, FaLeaf, FaCompass, FaHeart, FaStar } from "react-icons/fa";
import ContactDetails from "@/components/contact/ContactDetails";
import type { BusinessContact, ContentCard } from "@/lib/siteContent";

// Cards beyond the icon list reuse icons from the start.
const VALUE_ICONS = [FaMountain, FaHandsHelping, FaLeaf, FaCompass, FaHeart, FaStar];

interface AboutContentProps {
  /** Admin overrides from Site Settings; null = the translated defaults. */
  story: string | null;
  mission: string | null;
  values: ContentCard[] | null;
  contact: BusinessContact;
  contactNote: string | null;
}

export default function AboutContent({ story, mission, values, contact, contactNote }: AboutContentProps) {
  const t = useTranslations();

  const cards: ContentCard[] = values ?? [1, 2, 3].map((n) => ({
    title: t(`about.value${n}Title`),
    body: t(`about.value${n}Body`),
  }));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold text-forest-900">{t("about.storyTitle")}</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-forest-700">{story || t("about.story")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-forest-900">{t("about.missionTitle")}</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-forest-700">
            {mission || t("about.mission")}
          </p>
        </section>

        {cards.length > 0 && (
          <section className="grid gap-6 sm:grid-cols-3">
            {cards.map(({ title, body }, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <div key={`${title}-${i}`} className="rounded-card bg-cream-100 p-5">
                  <Icon className="h-6 w-6 text-forest-700" aria-hidden />
                  <h3 className="mt-3 font-display font-bold text-forest-900">{title}</h3>
                  {body && <p className="mt-1 text-sm text-forest-600">{body}</p>}
                </div>
              );
            })}
          </section>
        )}
      </div>

      <aside className="self-start rounded-card bg-navy-800 p-6 text-cream-50">
        <h3 className="font-display text-lg font-bold">{t("contact.pageTitle")}</h3>
        <ContactDetails contact={contact} note={contactNote} className="mt-4" />
      </aside>
    </div>
  );
}
