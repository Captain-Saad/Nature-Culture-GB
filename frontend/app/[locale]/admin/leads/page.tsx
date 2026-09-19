import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import LeadsManager from "@/components/admin/leads/LeadsManager";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Trip Leads", robots: { index: false, follow: false } };
}

export default async function AdminLeadsPage() {
  const { user } = await requireAdminSession();
  const t = await getTranslations("admin");

  return (
    <AdminShell title={t("sections.leads")} userEmail={user.email}>
      <LeadsManager />
    </AdminShell>
  );
}
