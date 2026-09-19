"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { REGIONS, SITUATION_STATUSES } from "@/lib/admin/enums";
import SingleMediaPicker from "@/components/admin/shared/SingleMediaPicker";
import type { AdminSituationReport, AdminSituationReportInput } from "@/lib/admin/types";

/**
 * <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in *local* time,
 * while the API stores UTC ISO strings. Converting through the local-time
 * getters (rather than slicing the ISO string) keeps the displayed time the
 * one the admin actually meant.
 */
function toLocalInput(iso: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface SituationReportFormProps {
  mode: "create" | "edit";
  initial?: AdminSituationReport;
  /** Logged-in admin, recorded as the report's author on create. */
  adminEmail: string;
}

export default function SituationReportForm({ mode, initial, adminEmail }: SituationReportFormProps) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [values, setValues] = useState<AdminSituationReportInput>(
    initial
      ? { ...initial, imageUrl: initial.imageUrl ?? "", reportedAt: toLocalInput(initial.reportedAt) }
      : {
          title: "",
          region: REGIONS[0],
          status: SITUATION_STATUSES[0],
          details: "",
          source: "",
          imageUrl: "",
          reportedAt: toLocalInput(""),
          createdBy: adminEmail,
        }
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AdminSituationReportInput>(key: K, value: AdminSituationReportInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.details.trim() || !values.source.trim()) {
      setError("Title, details and source are all required.");
      return;
    }

    setSaving(true);
    const path = mode === "create" ? "situation-reports" : `situation-reports/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const payload = {
      ...values,
      // datetime-local has no zone; new Date() reads it as local, and
      // toISOString converts to the UTC the API expects.
      reportedAt: new Date(values.reportedAt).toISOString(),
      imageUrl: values.imageUrl ?? "",
    };

    const { error: err } = await request(path, { method, body: JSON.stringify(payload) });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    router.push("/admin/situation-reports");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}
        </p>
      )}

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Update Details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-forest-800">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Babusar Pass closed by snowfall"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-forest-800">Region</label>
              <select
                value={values.region}
                onChange={(e) => set("region", e.target.value)}
                className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-forest-800">Status</label>
              <select
                value={values.status}
                onChange={(e) => set("status", e.target.value)}
                className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
              >
                {SITUATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-forest-800">Details</label>
            <textarea
              required
              rows={5}
              value={values.details}
              onChange={(e) => set("details", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Attribution</h2>
        <p className="mt-1 text-xs text-forest-500">
          Visitors see the source and the reported time on every update — both are required.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">Source</label>
            <input
              type="text"
              required
              placeholder="e.g. NHA Gilgit / local police"
              value={values.source}
              onChange={(e) => set("source", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Reported At</label>
            <input
              type="datetime-local"
              required
              value={values.reportedAt}
              onChange={(e) => set("reportedAt", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Recorded By</label>
            <input
              type="text"
              required
              value={values.createdBy}
              onChange={(e) => set("createdBy", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Attached Image</h2>
        <div className="mt-4">
          <SingleMediaPicker
            label=""
            kind="image"
            value={values.imageUrl ?? ""}
            onChange={(url) => set("imageUrl", url)}
            helpText="Optional — a road photo or official notice. JPG, PNG or WebP up to 5MB."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/situation-reports")}
          className="rounded-full border-2 border-forest-700 px-5 py-2.5 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Publish Update" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
