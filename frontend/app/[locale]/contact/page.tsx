import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/contact/ContactForm";
import ContactDetails from "@/components/contact/ContactDetails";
import { getSiteSettings } from "@/lib/site-settings";
import { getBusinessContact } from "@/lib/siteContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact",
    description: "Get in touch with Nature & Culture GB.",
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const settings = await getSiteSettings();

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <aside className="self-start rounded-card bg-navy-800 p-6 text-cream-50">
          <ContactDetails contact={getBusinessContact(settings)} note={settings?.contactDisplayText} />
        </aside>
      </div>
    </div>
  );
}
