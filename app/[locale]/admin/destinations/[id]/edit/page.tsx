import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import DestinationForm from "@/components/admin/destinations/DestinationForm";
import type { AdminDestination } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Edit Destination", robots: { index: false, follow: false } };
}

export default async function AdminEditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();

  const destination = await adminFetch<AdminDestination>(`/admin/destinations/${id}`, token);
  if (!destination) notFound();

  return (
    <AdminShell title={`Edit: ${destination.name}`} userEmail={user.email}>
      <DestinationForm mode="edit" initial={destination} />
    </AdminShell>
  );
}
