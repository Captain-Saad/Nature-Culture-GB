import { useTranslations } from "next-intl";
import { instagramUrl, telHref, type BusinessContact } from "@/lib/siteContent";

interface ContactDetailsProps {
  contact: BusinessContact;
  /** Free text from Site Settings → "Contact Display Text" (hours, address…). */
  note?: string | null;
  className?: string;
}

/** The business contact card on the About and Contact pages. */
export default function ContactDetails({ contact, note, className = "" }: ContactDetailsProps) {
  const t = useTranslations("contact.info");

  return (
    <dl className={`space-y-4 text-sm ${className}`}>
      <div>
        <dt className="text-cream-300">{t("email")}</dt>
        <dd>
          <a href={`mailto:${contact.email}`} className="break-all hover:text-orange-300">
            {contact.email}
          </a>
        </dd>
      </div>
      {contact.phones.length > 0 && (
        <div>
          <dt className="text-cream-300">{t("phone")}</dt>
          {contact.phones.map((phone) => (
            <dd key={phone}>
              <a href={telHref(phone)} className="hover:text-orange-300">
                {phone}
              </a>
            </dd>
          ))}
        </div>
      )}
      <div>
        <dt className="text-cream-300">{t("whatsapp")}</dt>
        <dd>
          <a
            href={`https://wa.me/${contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-300"
          >
            +{contact.whatsappNumber}
          </a>
        </dd>
      </div>
      <div>
        <dt className="text-cream-300">{t("instagram")}</dt>
        <dd>
          <a
            href={instagramUrl(contact.instagramHandle)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-300"
          >
            @{contact.instagramHandle}
          </a>
        </dd>
      </div>
      {note && <p className="whitespace-pre-line border-t border-navy-700 pt-4 text-cream-200">{note}</p>}
    </dl>
  );
}
