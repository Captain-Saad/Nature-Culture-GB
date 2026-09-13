import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navLinks } from "@/lib/nav-links";

const CONTACT_EMAIL = "natureculturegb@gmail.com";
const INSTAGRAM_HANDLE = "@natureandculturegb";
const INSTAGRAM_URL = "https://instagram.com/natureandculturegb";

export default function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const exploreLinks = navLinks.filter((l) =>
    ["destinations", "hotels", "packages", "weather", "flights"].includes(l.labelKey)
  );

  return (
    <footer className="bg-navy-800 text-cream-100">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-cream-50">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream-100 bg-navy-700"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 18l5-8 4 5 3-4 6 7H3z" />
                <path d="M14 6l-2 3" strokeLinecap="round" />
              </svg>
            </span>
            Nature &amp; Culture GB
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200">
            {t("footer.blurb")}
          </p>
          <p className="mt-3 text-sm font-semibold text-orange-300">{t("meta.tagline")}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-cream-50">
            {t("footer.explore")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-200">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-orange-300">
                  {t(`nav.${link.labelKey}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/mountains" className="hover:text-orange-300">
                {t("mountains.pageTitle")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-cream-50">
            {t("footer.company")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-200">
            <li>
              <Link href="/about" className="hover:text-orange-300">{t("nav.about")}</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-orange-300">{t("nav.contact")}</Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-orange-300">{t("reviews.pageTitle")}</Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-cream-400 hover:text-orange-300">
                {t("admin.loginTitle")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-cream-50">
            {t("footer.followUs")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-200">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-orange-300">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-orange-300">
                {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="container-content flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream-300 sm:flex-row">
          <p>{t("footer.copyright", { year })}</p>
          <p>{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
