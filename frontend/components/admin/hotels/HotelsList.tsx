"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { resolveMediaUrl } from "@/lib/utils/media";
import type { AdminHotel } from "@/lib/admin/types";

export default function HotelsList() {
  const { request } = useAdminApi();
  const [hotels, setHotels] = useState<AdminHotel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminHotel | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError(null);
    const { data, error: err } = await request<AdminHotel[]>("hotels");
    if (err) {
      setError(err);
      return;
    }
    setHotels(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error: err } = await request(`hotels/${pendingDelete.id}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDelete(null);
    if (err) {
      setError(err);
      return;
    }
    setHotels((prev) => prev?.filter((h) => h.id !== pendingDelete.id) ?? null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-forest-600">
          {hotels ? `${hotels.length} hotel${hotels.length === 1 ? "" : "s"}` : ""}
        </p>
        <Link
          href="/admin/hotels/new"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
        >
          + New Hotel
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}{" "}
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </div>
      )}

      {hotels === null && !error && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">Loading…</div>
      )}

      {hotels !== null && hotels.length === 0 && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">No hotels yet.</div>
      )}

      {hotels !== null && hotels.length > 0 && (
        <div className="overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wide text-forest-500">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stars</th>
                <th className="px-4 py-3">PKR / night</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-cream-100">
                      {h.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URLs
                        <img src={resolveMediaUrl(h.images[0])} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-forest-900">{h.name}</td>
                  <td className="px-4 py-3 text-forest-600">{h.region}</td>
                  <td className="px-4 py-3 text-forest-600">{h.category}</td>
                  <td className="px-4 py-3 text-forest-600">{"★".repeat(h.starRating)}</td>
                  <td className="px-4 py-3 text-forest-600">
                    {h.estimatedPricePerNightPKR.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-forest-600">{h.roomTypes?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/hotels/${h.id}/edit`}
                        className="rounded-full border-2 border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(h)}
                        className="rounded-full border-2 border-red-600 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete hotel?"
        body={`This permanently deletes "${pendingDelete?.name}" and its room types. This can't be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
