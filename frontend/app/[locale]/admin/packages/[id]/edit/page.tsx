import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import PackageForm from "@/components/admin/packages/PackageForm";
import type { AdminPackage } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Edit Package", robots: { index: false, follow: false } };
}

export default async function AdminEditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();

  const pkg = await adminFetch<AdminPackage>(`/admin/packages/${id}`, token);
  if (!pkg) notFound();

  return (
    <AdminShell title={`Edit: ${pkg.title}`} userEmail={user.email}>
      <PackageForm mode="edit" initial={pkg} />
    </AdminShell>
  );
}
