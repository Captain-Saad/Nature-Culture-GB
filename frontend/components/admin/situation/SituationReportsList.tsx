"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { resolveMediaUrl } from "@/lib/utils/media";
import type { AdminSituationReport } from "@/lib/admin/types";

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-forest-100 text-forest-800",
  Closed: "bg-red-100 text-red-700",
  Restricted: "bg-orange-200 text-orange-800",
};

export default function SituationReportsList() {
  const { request } = useAdminApi();
  const [reports, setReports] = useState<AdminSituationReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminSituationReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError(null);
    const { data, error: err } = await request<AdminSituationReport[]>("situation-reports");
    if (err) {
      setError(err);
      return;
    }
    setReports(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error: err } = await request(`situation-reports/${pendingDelete.id}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDelete(null);
    if (err) {
      setError(err);
      return;
    }
    setReports((prev) => prev?.filter((r) => r.id !== pendingDelete.id) ?? null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-forest-600">
          {reports ? `${reports.length} report${reports.length === 1 ? "" : "s"}` : ""}
        </p>
        <Link
          href="/admin/situation-reports/new"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
        >
          + New Report
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

      {reports === null && !error && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">Loading…</div>
      )}

      {reports !== null && reports.length === 0 && (
        <div className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
          No travel updates yet.
        </div>
      )}

      {reports !== null && reports.length > 0 && (
        <div className="overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs font-semibold uppercase tracking-wide text-forest-500">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-cream-100">
                      {r.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URLs
                        <img src={resolveMediaUrl(r.imageUrl)} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-forest-900">{r.title}</td>
                  <td className="px-4 py-3 text-forest-600">{r.region}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        STATUS_STYLES[r.status] ?? "bg-cream-200 text-forest-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-forest-600">
                    {new Date(r.reportedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-forest-600">{r.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/situation-reports/${r.id}/edit`}
                        className="rounded-full border-2 border-forest-700 px-3 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(r)}
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
        title="Delete travel update?"
        body={`This permanently deletes "${pendingDelete?.title}". This can't be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
