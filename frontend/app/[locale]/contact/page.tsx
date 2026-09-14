import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/contact/ContactForm";

const CONTACT_EMAIL = "natureculturegb@gmail.com";
const INSTAGRAM_HANDLE = "@natureandculturegb";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact",
    description: "Get in touch with Nature & Culture GB.",
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <aside className="rounded-card bg-navy-800 p-6 text-cream-50">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-cream-300">{t("info.email")}</dt>
              <dd>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-orange-300">
                  {CONTACT_EMAIL}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-cream-300">{t("info.instagram")}</dt>
              <dd>{INSTAGRAM_HANDLE}</dd>
            </div>
            <div>
              <dt className="text-cream-300">{t("info.phone")}</dt>
              <dd className="text-cream-200">{t("info.phoneNote")}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
