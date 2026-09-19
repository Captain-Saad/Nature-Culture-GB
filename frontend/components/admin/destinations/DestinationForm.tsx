"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { slugify } from "@/lib/admin/slugify";
import { REGIONS, DIFFICULTIES } from "@/lib/admin/enums";
import TagListInput from "@/components/admin/shared/TagListInput";
import MediaGalleryManager from "@/components/admin/shared/MediaGalleryManager";
import type { AdminDestination, AdminDestinationInput } from "@/lib/admin/types";

const emptyDestination: AdminDestinationInput = {
  slug: "",
  name: "",
  region: REGIONS[0],
  images: [],
  videos: [],
  shortDescription: "",
  longDescription: "",
  bestTimeToVisit: "",
  estimatedDurationDays: 1,
  estimatedDurationLabel: "",
  activities: [],
  difficulty: DIFFICULTIES[0],
  approxCostMinPKR: 0,
  approxCostMaxPKR: 0,
  nearbyHotelIds: [],
  nearbyAttractionIds: [],
  lat: 0,
  lng: 0,
};

interface DestinationFormProps {
  mode: "create" | "edit";
  initial?: AdminDestination;
}

export default function DestinationForm({ mode, initial }: DestinationFormProps) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [values, setValues] = useState<AdminDestinationInput>(initial ?? emptyDestination);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AdminDestinationInput>(key: K, value: AdminDestinationInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    set("name", name);
    if (!slugTouched) {
      set("slug", slugify(name));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }

    setSaving(true);
    const path = mode === "create" ? "destinations" : `destinations/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const { error: err } = await request(path, { method, body: JSON.stringify(values) });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    router.push("/admin/destinations");
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
        <h2 className="font-display text-lg font-bold text-forest-900">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">Name</label>
            <input
              type="text"
              required
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Slug</label>
            <input
              type="text"
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
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
            <label className="text-sm font-semibold text-forest-800">Difficulty</label>
            <select
              value={values.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Description</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-forest-800">Short Description</label>
            <textarea
              required
              rows={2}
              value={values.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Long Description</label>
            <textarea
              required
              rows={5}
              value={values.longDescription}
              onChange={(e) => set("longDescription", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Visit Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">Best Time to Visit</label>
            <input
              type="text"
              required
              placeholder="e.g. April – October"
              value={values.bestTimeToVisit}
              onChange={(e) => set("bestTimeToVisit", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Duration Label</label>
            <input
              type="text"
              required
              placeholder="e.g. 2–3 days"
              value={values.estimatedDurationLabel}
              onChange={(e) => set("estimatedDurationLabel", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Duration (days, numeric)</label>
            <input
              type="number"
              min={0}
              value={values.estimatedDurationDays}
              onChange={(e) => set("estimatedDurationDays", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <TagListInput
            label="Activities"
            values={values.activities}
            onChange={(v) => set("activities", v)}
            placeholder="e.g. Trekking"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Cost Estimate (PKR)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">Minimum</label>
            <input
              type="number"
              min={0}
              value={values.approxCostMinPKR}
              onChange={(e) => set("approxCostMinPKR", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Maximum</label>
            <input
              type="number"
              min={0}
              value={values.approxCostMaxPKR}
              onChange={(e) => set("approxCostMaxPKR", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Location</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">Latitude</label>
            <input
              type="number"
              step="any"
              value={values.lat}
              onChange={(e) => set("lat", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Longitude</label>
            <input
              type="number"
              step="any"
              value={values.lng}
              onChange={(e) => set("lng", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Nearby (IDs)</h2>
        <p className="mt-1 text-xs text-forest-500">
          Raw destination/hotel IDs for now -- a proper name-based picker can follow later.
        </p>
        <div className="mt-4 space-y-4">
          <TagListInput
            label="Nearby Hotel IDs"
            values={values.nearbyHotelIds}
            onChange={(v) => set("nearbyHotelIds", v)}
            placeholder="e.g. hotel-01"
          />
          <TagListInput
            label="Nearby Attraction (Destination) IDs"
            values={values.nearbyAttractionIds}
            onChange={(v) => set("nearbyAttractionIds", v)}
            placeholder="e.g. dest-02"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Photos &amp; Videos</h2>
        <div className="mt-4">
          <MediaGalleryManager
            label=""
            value={{ images: values.images, videos: values.videos }}
            onChange={(next) => setValues((prev) => ({ ...prev, images: next.images, videos: next.videos }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/destinations")}
          className="rounded-full border-2 border-forest-700 px-5 py-2.5 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Destination" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
