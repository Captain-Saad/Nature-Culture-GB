import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import AdminSectionOverview from "@/components/admin/AdminSectionOverview";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Rooms", robots: { index: false, follow: false } };
}

interface HotelWithRoomTypes {
  roomTypes: unknown[];
}

/**
 * There's no dedicated /admin/rooms backend endpoint -- room *types* are
 * a JSON field nested on each Hotel record (see backend/prisma/schema.prisma),
 * not a standalone resource, per the "don't model individual room
 * instances" decision from the hotel-room-detail feature. This page
 * still gives a real, accurate count by summing roomTypes across hotels.
 */
export default async function AdminRoomsPage() {
  const { user, token } = await requireAdminSession();
  const t = await getTranslations("admin");

  const hotels = await adminFetch<HotelWithRoomTypes[]>("/admin/hotels", token);
  const roomCount = hotels?.reduce((sum, h) => sum + h.roomTypes.length, 0) ?? null;

  return (
    <AdminShell
      title={t("sections.rooms")}
      subtitle="Room types are managed as part of each hotel's record."
      userEmail={user.email}
    >
      <AdminSectionOverview
        countLabel={
          hotels && roomCount !== null
            ? t("roomCount", { count: roomCount, hotels: hotels.length })
            : undefined
        }
      />
    </AdminShell>
  );
}
