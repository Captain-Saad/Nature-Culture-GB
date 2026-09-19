import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import MountainForm from "@/components/admin/mountains/MountainForm";
import type { AdminMountain } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Edit Mountain", robots: { index: false, follow: false } };
}

export default async function AdminEditMountainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();

  const mountain = await adminFetch<AdminMountain>(`/admin/mountains/${id}`, token);
  if (!mountain) notFound();

  return (
    <AdminShell title={`Edit: ${mountain.name}`} userEmail={user.email}>
      <MountainForm mode="edit" initial={mountain} />
    </AdminShell>
  );
}
