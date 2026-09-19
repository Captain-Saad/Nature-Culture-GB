import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import HotelForm from "@/components/admin/hotels/HotelForm";
import type { AdminHotel } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Edit Hotel", robots: { index: false, follow: false } };
}

export default async function AdminEditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();

  const hotel = await adminFetch<AdminHotel>(`/admin/hotels/${id}`, token);
  if (!hotel) notFound();

  return (
    <AdminShell title={`Edit: ${hotel.name}`} userEmail={user.email}>
      <HotelForm mode="edit" initial={hotel} />
    </AdminShell>
  );
}
