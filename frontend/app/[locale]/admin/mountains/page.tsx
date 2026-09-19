import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import MountainsList from "@/components/admin/mountains/MountainsList";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Mountains", robots: { index: false, follow: false } };
}

export default async function AdminMountainsPage() {
  const { user } = await requireAdminSession();
  const t = await getTranslations("admin");

  return (
    <AdminShell title={t("sections.mountains")} userEmail={user.email}>
      <MountainsList />
    </AdminShell>
  );
}
