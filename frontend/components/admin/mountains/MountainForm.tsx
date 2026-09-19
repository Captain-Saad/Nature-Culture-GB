"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { slugify } from "@/lib/admin/slugify";
import { DIFFICULTIES } from "@/lib/admin/enums";
import MediaGalleryManager from "@/components/admin/shared/MediaGalleryManager";
import type { AdminMountain, AdminMountainInput } from "@/lib/admin/types";

const emptyMountain: AdminMountainInput = {
  slug: "",
  name: "",
  heightMeters: 0,
  range: "",
  difficulty: DIFFICULTIES[1],
  images: [],
  videos: [],
  description: "",
  firstAscent: "",
  bestSeason: "",
  worldRank: 1,
  nearestTown: "",
  lat: 0,
  lng: 0,
};

interface MountainFormProps {
  mode: "create" | "edit";
  initial?: AdminMountain;
}

export default function MountainForm({ mode, initial }: MountainFormProps) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [values, setValues] = useState<AdminMountainInput>(
    initial
      ? {
          ...initial,
          videos: initial.videos ?? [],
          firstAscent: initial.firstAscent ?? "",
          bestSeason: initial.bestSeason ?? "",
        }
      : emptyMountain
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AdminMountainInput>(key: K, value: AdminMountainInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    set("name", name);
    if (!slugTouched) set("slug", slugify(name));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    if (values.heightMeters <= 0) {
      setError("Height must be greater than zero.");
      return;
    }

    setSaving(true);
    const path = mode === "create" ? "mountains" : `mountains/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    // firstAscent and bestSeason are optional on the backend. Sent as "" when
    // empty rather than omitted, so clearing one actually clears it on a
    // PATCH (JSON.stringify would otherwise drop an undefined key).
    const payload = {
      ...values,
      firstAscent: values.firstAscent?.trim() ?? "",
      bestSeason: values.bestSeason?.trim() ?? "",
    };

    const { error: err } = await request(path, { method, body: JSON.stringify(payload) });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    router.push("/admin/mountains");
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
            <label className="text-sm font-semibold text-forest-800">Height (metres)</label>
            <input
              type="number"
              min={1}
              required
              value={values.heightMeters}
              onChange={(e) => set("heightMeters", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Range</label>
            <input
              type="text"
              required
              placeholder="e.g. Karakoram"
              value={values.range}
              onChange={(e) => set("range", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
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
          <div>
            <label className="text-sm font-semibold text-forest-800">World Rank</label>
            <input
              type="number"
              min={1}
              required
              value={values.worldRank}
              onChange={(e) => set("worldRank", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
            <p className="mt-1 text-xs text-forest-500">Global height ranking, e.g. 2 for K2.</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-forest-800">Description</label>
          <textarea
            required
            rows={5}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Climbing Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">First Ascent</label>
            <input
              type="text"
              placeholder="e.g. 1954 — Lacedelli & Compagnoni"
              value={values.firstAscent ?? ""}
              onChange={(e) => set("firstAscent", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Best Season</label>
            <input
              type="text"
              placeholder="e.g. June – August"
              value={values.bestSeason ?? ""}
              onChange={(e) => set("bestSeason", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Nearest Town</label>
            <input
              type="text"
              required
              placeholder="e.g. Skardu"
              value={values.nearestTown}
              onChange={(e) => set("nearestTown", e.target.value)}
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
        <h2 className="font-display text-lg font-bold text-forest-900">Photos &amp; Videos</h2>
        <div className="mt-4">
          <MediaGalleryManager
            label=""
            value={{ images: values.images, videos: values.videos }}
            onChange={(next) =>
              setValues((prev) => ({ ...prev, images: next.images, videos: next.videos }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/mountains")}
          className="rounded-full border-2 border-forest-700 px-5 py-2.5 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Mountain" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
