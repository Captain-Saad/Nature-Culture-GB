import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import AdminSectionOverview from "@/components/admin/AdminSectionOverview";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Trip Leads", robots: { index: false, follow: false } };
}

export default async function AdminLeadsPage() {
  const { user, token } = await requireAdminSession();
  const t = await getTranslations("admin");

  const leads = await adminFetch<unknown[]>("/admin/leads", token);

  return (
    <AdminShell title={t("sections.leads")} userEmail={user.email}>
      <AdminSectionOverview
        countLabel={leads ? t("itemCount", { count: leads.length }) : undefined}
      />
    </AdminShell>
  );
}
