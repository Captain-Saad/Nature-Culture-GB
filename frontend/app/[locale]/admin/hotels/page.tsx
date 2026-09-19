import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import HotelsList from "@/components/admin/hotels/HotelsList";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Hotels", robots: { index: false, follow: false } };
}

export default async function AdminHotelsPage() {
  const { user } = await requireAdminSession();
  const t = await getTranslations("admin");

  return (
    <AdminShell title={t("sections.hotels")} userEmail={user.email}>
      <HotelsList />
    </AdminShell>
  );
}
