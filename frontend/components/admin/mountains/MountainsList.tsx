"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { resolveMediaUrl } from "@/lib/utils/media";
import type { AdminMountain } from "@/lib/admin/types";

export default function MountainsList() {
  const { request } = useAdminApi();
  const [mountains, setMountains] = useState<AdminMountain[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminMountain | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError(null);
    const { data, error: err } = await request<AdminMountain[]>("mountains");
    if (err) {
      setError(err);
      return;
    }
    setMountains(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error: err } = await request(`mountains/${pendingDelete.id}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDelete(null);
    if (err) {
      setError(err);
      return;
    }
    setMountains((prev) => prev?.filter((m) => m.id !== pendingDelete.id) ?? null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-forest-600">
          {mountains ? `${mountains.length} mountain${mountains.length === 1 ? "" : "s"}` : ""}
        </p>
        <Link
          href="/admin/mountains/new"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
        >
          + New Mountain
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

      {mountains === null && !error && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">Loading…</div>
      )}

      {mountains !== null && mountains.length === 0 && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
          No mountains yet.
        </div>
      )}

      {mountains !== null && mountains.length > 0 && (
        <div className="overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wide text-forest-500">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Height</th>
                <th className="px-4 py-3">Range</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">World Rank</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mountains.map((m) => (
                <tr key={m.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-cream-100">
                      {m.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URLs
                        <img src={resolveMediaUrl(m.images[0])} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-forest-900">{m.name}</td>
                  <td className="px-4 py-3 text-forest-600">{m.heightMeters.toLocaleString()} m</td>
                  <td className="px-4 py-3 text-forest-600">{m.range}</td>
                  <td className="px-4 py-3 text-forest-600">{m.difficulty}</td>
                  <td className="px-4 py-3 text-forest-600">#{m.worldRank}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/mountains/${m.id}/edit`}
                        className="rounded-full border-2 border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(m)}
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
        title="Delete mountain?"
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
