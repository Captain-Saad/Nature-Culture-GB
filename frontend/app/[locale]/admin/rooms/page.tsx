import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/lib/utils/media";
import type { AdminHotel } from "@/lib/admin/types";

// See app/[locale]/admin/page.tsx for why this must not be statically prerendered.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Rooms", robots: { index: false, follow: false } };
}

/**
 * Room *types* are a JSON field nested on each Hotel (see
 * backend/prisma/schema.prisma), not a standalone resource -- so this page is
 * a cross-hotel overview, and editing happens in the hotel's own form. Every
 * row links straight there rather than duplicating the editor.
 */
export default async function AdminRoomsPage() {
  const { user, token } = await requireAdminSession();
  const t = await getTranslations("admin");

  const hotels = await adminFetch<AdminHotel[]>("/admin/hotels", token);
  const withRooms = hotels?.filter((h) => (h.roomTypes?.length ?? 0) > 0) ?? [];
  const roomCount = hotels?.reduce((sum, h) => sum + (h.roomTypes?.length ?? 0), 0) ?? 0;

  return (
    <AdminShell
      title={t("sections.rooms")}
      subtitle="Room types are managed as part of each hotel's record."
      userEmail={user.email}
    >
      {!hotels ? (
        <div className="rounded-card bg-white p-8 text-center text-sm text-forest-500 shadow-card">
          Couldn&apos;t load hotels. Check that the API is running, then reload.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-forest-600">
            {roomCount} room type{roomCount === 1 ? "" : "s"} across {hotels.length} hotel
            {hotels.length === 1 ? "" : "s"}
          </p>

          {withRooms.length === 0 ? (
            <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
              No room types yet. Open a hotel to add its first one.
            </div>
          ) : (
            <div className="space-y-4">
              {withRooms.map((hotel) => (
                <div key={hotel.id} className="rounded-card bg-white p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-display text-base font-bold text-forest-900">{hotel.name}</h2>
                      <p className="text-xs text-forest-500">
                        {hotel.region} · {hotel.roomTypes.length} room type
                        {hotel.roomTypes.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link
                      href={`/admin/hotels/${hotel.id}/edit`}
                      className="rounded-full border-2 border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                    >
                      Edit rooms
                    </Link>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wide text-forest-500">
                          <th className="py-2 pr-4">Photo</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Beds</th>
                          <th className="py-2 pr-4">Sleeps</th>
                          <th className="py-2 pr-4">Size</th>
                          <th className="py-2 pr-4">PKR / night</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotel.roomTypes.map((room, i) => (
                          <tr key={`${hotel.id}-${i}`} className="border-b border-cream-100 last:border-0">
                            <td className="py-2 pr-4">
                              <div className="relative h-10 w-14 overflow-hidden rounded-md bg-cream-100">
                                {room.images?.[0] && (
                                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URLs
                                  <img
                                    src={resolveMediaUrl(room.images[0])}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="py-2 pr-4 font-semibold text-forest-900">{room.type}</td>
                            <td className="py-2 pr-4 text-forest-600">{room.bedConfig}</td>
                            <td className="py-2 pr-4 text-forest-600">{room.capacity}</td>
                            <td className="py-2 pr-4 text-forest-600">
                              {room.sizeSqFt ? `${room.sizeSqFt} sq ft` : "—"}
                            </td>
                            <td className="py-2 pr-4 text-forest-600">
                              {room.estimatedPricePKR.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
