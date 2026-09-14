import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import AdminSectionOverview from "@/components/admin/AdminSectionOverview";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Mountains", robots: { index: false, follow: false } };
}

export default async function AdminMountainsPage() {
  const { user, token } = await requireAdminSession();
  const t = await getTranslations("admin");

  const mountains = await adminFetch<unknown[]>("/admin/mountains", token);

  return (
    <AdminShell title={t("sections.mountains")} userEmail={user.email}>
      <AdminSectionOverview
        countLabel={mountains ? t("itemCount", { count: mountains.length }) : undefined}
      />
    </AdminShell>
  );
}
