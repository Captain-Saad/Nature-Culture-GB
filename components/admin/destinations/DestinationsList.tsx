"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import type { AdminDestination } from "@/lib/admin/types";

export default function DestinationsList() {
  const { request } = useAdminApi();
  const [destinations, setDestinations] = useState<AdminDestination[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminDestination | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError(null);
    const { data, error: err } = await request<AdminDestination[]>("destinations");
    if (err) {
      setError(err);
      return;
    }
    setDestinations(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error: err } = await request(`destinations/${pendingDelete.id}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDelete(null);
    if (err) {
      setError(err);
      return;
    }
    setDestinations((prev) => prev?.filter((d) => d.id !== pendingDelete.id) ?? null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-forest-600">
          {destinations ? `${destinations.length} destination${destinations.length === 1 ? "" : "s"}` : ""}
        </p>
        <Link
          href="/admin/destinations/new"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
        >
          + New Destination
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

      {destinations === null && !error && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">Loading…</div>
      )}

      {destinations !== null && destinations.length === 0 && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
          No destinations yet.
        </div>
      )}

      {destinations !== null && destinations.length > 0 && (
        <div className="overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wide text-forest-500">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-cream-100">
                      {d.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URLs
                        <img src={d.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-forest-900">{d.name}</td>
                  <td className="px-4 py-3 text-forest-600">{d.region}</td>
                  <td className="px-4 py-3 text-forest-600">{d.difficulty}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/destinations/${d.id}/edit`}
                        className="rounded-full border-2 border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(d)}
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
        title="Delete destination?"
        body={`This permanently deletes "${pendingDelete?.name}". This can't be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
