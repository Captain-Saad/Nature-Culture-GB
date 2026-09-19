import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import PackageForm from "@/components/admin/packages/PackageForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · New Package", robots: { index: false, follow: false } };
}

export default async function AdminNewPackagePage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell title="New Package" userEmail={user.email}>
      <PackageForm mode="create" />
    </AdminShell>
  );
}
