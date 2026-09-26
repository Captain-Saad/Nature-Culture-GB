import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import PricingForm from "@/components/admin/settings/PricingForm";
import type { AdminSiteSettings } from "@/lib/admin/types";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Trip Pricing", robots: { index: false, follow: false } };
}

export default async function AdminPricingPage() {
  const { user, token } = await requireAdminSession();
  const t = await getTranslations("admin");

  // The backend creates the singleton on first read, so this can't 404.
  const settings = await adminFetch<AdminSiteSettings>("/admin/site-settings", token);

  return (
    <AdminShell title={t("sections.pricing")} userEmail={user.email}>
      {settings ? (
        <PricingForm initial={settings.tripPricing} />
      ) : (
        <div className="rounded-card bg-white p-8 text-center text-sm text-forest-500 shadow-card">
          Couldn&apos;t load trip pricing. Check that the API is running, then reload.
        </div>
      )}
    </AdminShell>
  );
}
