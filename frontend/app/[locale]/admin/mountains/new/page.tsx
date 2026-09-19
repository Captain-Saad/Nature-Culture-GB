import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import MountainForm from "@/components/admin/mountains/MountainForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · New Mountain", robots: { index: false, follow: false } };
}

export default async function AdminNewMountainPage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell title="New Mountain" userEmail={user.email}>
      <MountainForm mode="create" />
    </AdminShell>
  );
}
