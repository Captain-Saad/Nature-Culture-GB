import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import DestinationForm from "@/components/admin/destinations/DestinationForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · New Destination", robots: { index: false, follow: false } };
}

export default async function AdminNewDestinationPage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell title="New Destination" userEmail={user.email}>
      <DestinationForm mode="create" />
    </AdminShell>
  );
}
