import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import SiteSettingsForm from "@/components/admin/settings/SiteSettingsForm";
import type { AdminSiteSettings } from "@/lib/admin/types";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Site Settings", robots: { index: false, follow: false } };
}

export default async function AdminSiteSettingsPage() {
  const { user, token } = await requireAdminSession();
  const t = await getTranslations("admin");

  // The backend creates the singleton on first read, so this can't 404.
  const settings = await adminFetch<AdminSiteSettings>("/admin/site-settings", token);

  return (
    <AdminShell title={t("sections.siteSettings")} userEmail={user.email}>
      {settings ? (
        <SiteSettingsForm initial={settings} />
      ) : (
        <div className="rounded-card bg-white p-8 text-center text-sm text-forest-500 shadow-card">
          Couldn&apos;t load site settings. Check that the API is running, then reload.
        </div>
      )}
    </AdminShell>
  );
}
