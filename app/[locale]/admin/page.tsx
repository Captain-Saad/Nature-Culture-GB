import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";

// Never statically prerendered: requireAdminSession() reads the request's
// cookies and calls the backend per-visit, which must not be baked into
// a build-time static page (that would bake in whatever `redirect()`
// decision was made with no real cookie present at build time).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Admin Dashboard",
    robots: { index: false, follow: false },
  };
}

const SECTIONS = [
  "destinations",
  "hotels",
  "rooms",
  "mountains",
  "packages",
  "situationReports",
  "siteSettings",
  "leads",
  "reviews",
] as const;

// "situationReports" -> "/admin/situation-reports", everything else is a
// direct camelCase-to-kebab-case match.
const SECTION_HREFS: Record<(typeof SECTIONS)[number], string> = {
  destinations: "/admin/destinations",
  hotels: "/admin/hotels",
  rooms: "/admin/rooms",
  mountains: "/admin/mountains",
  packages: "/admin/packages",
  situationReports: "/admin/situation-reports",
  siteSettings: "/admin/site-settings",
  leads: "/admin/leads",
  reviews: "/admin/reviews",
};

export default async function AdminDashboardPage() {
  const { user } = await requireAdminSession();
  const t = await getTranslations("admin");

  return (
    <AdminShell
      title={t("dashboardTitle")}
      subtitle={t("dashboardSubtitle")}
      userEmail={user.email}
      showBack={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((key) => (
          <Link
            key={key}
            href={SECTION_HREFS[key]}
            className="rounded-card bg-white p-5 shadow-card transition-shadow hover:shadow-card-lg"
          >
            <p className="font-display text-lg font-bold text-forest-900">{t(`sections.${key}`)}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
