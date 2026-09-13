import { useTranslations } from "next-intl";
import { FaMountain, FaHandsHelping, FaLeaf } from "react-icons/fa";

const CONTACT_EMAIL = "natureculturegb@gmail.com";
const INSTAGRAM_HANDLE = "@natureandculturegb";

export default function AboutContent() {
  const t = useTranslations();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold text-forest-900">Our Story</h2>
          <p className="mt-3 leading-relaxed text-forest-700">
            Nature &amp; Culture GB was founded by people who grew up among the peaks and valleys of
            Gilgit-Baltistan. We started by helping friends and family plan trips that actually matched
            the reality on the ground — honest costs, realistic timings, and routes we&apos;ve walked
            ourselves. That same approach now shapes every itinerary we build.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-forest-900">Our Mission</h2>
          <p className="mt-3 leading-relaxed text-forest-700">
            To make planning a trip through Gilgit-Baltistan as trustworthy and transparent as the
            mountains themselves are dramatic — connecting travelers with the region&apos;s landscapes,
            people and living traditions, without the guesswork.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { Icon: FaMountain, title: "Local Roots", body: "Born and raised across GB's valleys." },
            { Icon: FaHandsHelping, title: "Honest Guidance", body: "Every estimate labeled clearly." },
            { Icon: FaLeaf, title: "Responsible Travel", body: "Respect for land and local communities." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="rounded-card bg-cream-100 p-5">
              <Icon className="h-6 w-6 text-forest-700" aria-hidden />
              <h3 className="mt-3 font-display font-bold text-forest-900">{title}</h3>
              <p className="mt-1 text-sm text-forest-600">{body}</p>
            </div>
          ))}
        </section>
      </div>

      <aside className="rounded-card bg-navy-800 p-6 text-cream-50">
        <h3 className="font-display text-lg font-bold">{t("contact.pageTitle")}</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-cream-300">{t("contact.info.email")}</dt>
            <dd>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-orange-300">
                {CONTACT_EMAIL}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-cream-300">{t("contact.info.instagram")}</dt>
            <dd>{INSTAGRAM_HANDLE}</dd>
          </div>
          <div>
            <dt className="text-cream-300">{t("contact.info.phone")}</dt>
            <dd className="text-cream-200">{t("contact.info.phoneNote")}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
