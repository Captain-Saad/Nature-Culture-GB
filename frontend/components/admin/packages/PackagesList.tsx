"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { resolveMediaUrl } from "@/lib/utils/media";
import type { AdminPackage } from "@/lib/admin/types";

export default function PackagesList() {
  const { request } = useAdminApi();
  const [packages, setPackages] = useState<AdminPackage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminPackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError(null);
    const { data, error: err } = await request<AdminPackage[]>("packages");
    if (err) {
      setError(err);
      return;
    }
    setPackages(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error: err } = await request(`packages/${pendingDelete.id}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDelete(null);
    if (err) {
      setError(err);
      return;
    }
    setPackages((prev) => prev?.filter((p) => p.id !== pendingDelete.id) ?? null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-forest-600">
          {packages ? `${packages.length} package${packages.length === 1 ? "" : "s"}` : ""}
        </p>
        <Link
          href="/admin/packages/new"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
        >
          + New Package
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

      {packages === null && !error && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">Loading…</div>
      )}

      {packages !== null && packages.length === 0 && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
          No packages yet.
        </div>
      )}

      {packages !== null && packages.length > 0 && (
        <div className="overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wide text-forest-500">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Price (PKR)</th>
                <th className="px-4 py-3">Itinerary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-cream-100">
                      {p.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URLs
                        <img src={resolveMediaUrl(p.images[0])} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-forest-900">{p.title}</td>
                  <td className="px-4 py-3 text-forest-600">{p.category}</td>
                  <td className="px-4 py-3 text-forest-600">{p.durationDays}</td>
                  <td className="px-4 py-3 text-forest-600">
                    {p.estimatedPriceMinPKR.toLocaleString()} – {p.estimatedPriceMaxPKR.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-forest-600">
                    {p.itinerary?.length ?? 0} day{(p.itinerary?.length ?? 0) === 1 ? "" : "s"}
                    {p.itinerary && p.itinerary.length !== p.durationDays && (
                      <span
                        title="Itinerary day count doesn't match the package duration"
                        className="ml-1 text-orange-600"
                      >
                        ⚠
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/packages/${p.id}/edit`}
                        className="rounded-full border-2 border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p)}
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
        title="Delete package?"
        body={`This permanently deletes "${pendingDelete?.title}" and its itinerary. This can't be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
