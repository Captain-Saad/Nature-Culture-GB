import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import HotelForm from "@/components/admin/hotels/HotelForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · New Hotel", robots: { index: false, follow: false } };
}

export default async function AdminNewHotelPage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell title="New Hotel" userEmail={user.email}>
      <HotelForm mode="create" />
    </AdminShell>
  );
}
