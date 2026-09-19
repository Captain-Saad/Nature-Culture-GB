"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { slugify } from "@/lib/admin/slugify";
import { PACKAGE_CATEGORIES, REGIONS } from "@/lib/admin/enums";
import TagListInput from "@/components/admin/shared/TagListInput";
import MediaGalleryManager from "@/components/admin/shared/MediaGalleryManager";
import ItineraryEditor from "@/components/admin/packages/ItineraryEditor";
import type { AdminPackage, AdminPackageInput } from "@/lib/admin/types";

function toDateInput(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}

const emptyPackage: AdminPackageInput = {
  slug: "",
  title: "",
  category: PACKAGE_CATEGORIES[0],
  durationDays: 1,
  images: [],
  videos: [],
  estimatedPriceMinPKR: 0,
  estimatedPriceMaxPKR: 0,
  priceLastUpdated: new Date().toISOString().slice(0, 10),
  highlights: [],
  itinerary: [],
  included: [],
  excluded: [],
  regions: [],
};

interface PackageFormProps {
  mode: "create" | "edit";
  initial?: AdminPackage;
}

export default function PackageForm({ mode, initial }: PackageFormProps) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [values, setValues] = useState<AdminPackageInput>(
    initial
      ? {
          ...initial,
          videos: initial.videos ?? [],
          itinerary: initial.itinerary ?? [],
          priceLastUpdated: toDateInput(initial.priceLastUpdated),
        }
      : emptyPackage
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AdminPackageInput>(key: K, value: AdminPackageInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugTouched) set("slug", slugify(title));
  }

  function toggleRegion(region: string) {
    set(
      "regions",
      values.regions.includes(region)
        ? values.regions.filter((r) => r !== region)
        : [...values.regions, region]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    if (values.estimatedPriceMaxPKR < values.estimatedPriceMinPKR) {
      setError("Maximum price can't be lower than the minimum price.");
      return;
    }
    const blankDay = values.itinerary.findIndex((d) => !d.title.trim() || !d.description.trim());
    if (blankDay !== -1) {
      setError(`Day ${blankDay + 1} needs both a title and a description.`);
      return;
    }

    setSaving(true);
    const path = mode === "create" ? "packages" : `packages/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    // Strip empty optional day fields so they're absent rather than "" --
    // the public ItineraryDay contract treats both as "not set", and the
    // backend schema marks them optional.
    const payload = {
      ...values,
      itinerary: values.itinerary.map((d) => ({
        day: d.day,
        title: d.title.trim(),
        description: d.description.trim(),
        ...(d.meals && d.meals.length > 0 ? { meals: d.meals } : {}),
        ...(d.overnightAt?.trim() ? { overnightAt: d.overnightAt.trim() } : {}),
      })),
    };

    const { error: err } = await request(path, { method, body: JSON.stringify(payload) });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    router.push("/admin/packages");
    router.refresh();
  }

  const dayMismatch = values.itinerary.length > 0 && values.itinerary.length !== values.durationDays;

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
            <label className="text-sm font-semibold text-forest-800">Title</label>
            <input
              type="text"
              required
              value={values.title}
              onChange={(e) => handleTitleChange(e.target.value)}
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
            <label className="text-sm font-semibold text-forest-800">Category</label>
            <select
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            >
              {PACKAGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Duration (days)</label>
            <input
              type="number"
              min={1}
              required
              value={values.durationDays}
              onChange={(e) => set("durationDays", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
            {dayMismatch && (
              <p className="mt-1 text-xs font-semibold text-orange-700">
                Itinerary has {values.itinerary.length} day
                {values.itinerary.length === 1 ? "" : "s"} — doesn&apos;t match this duration.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-forest-800">Regions Covered</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {REGIONS.map((r) => {
              const active = values.regions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  aria-pressed={active}
                  className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
                    active
                      ? "border-forest-700 bg-forest-700 text-white"
                      : "border-cream-300 text-forest-600 hover:bg-forest-50"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Pricing (PKR)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-forest-800">Minimum</label>
            <input
              type="number"
              min={0}
              value={values.estimatedPriceMinPKR}
              onChange={(e) => set("estimatedPriceMinPKR", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Maximum</label>
            <input
              type="number"
              min={0}
              value={values.estimatedPriceMaxPKR}
              onChange={(e) => set("estimatedPriceMaxPKR", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Price Last Updated</label>
            <input
              type="date"
              required
              value={values.priceLastUpdated}
              onChange={(e) => set("priceLastUpdated", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Highlights &amp; Inclusions</h2>
        <div className="mt-4 space-y-4">
          <TagListInput
            label="Highlights"
            values={values.highlights}
            onChange={(v) => set("highlights", v)}
            placeholder="e.g. Sunrise over Nanga Parbat"
          />
          <TagListInput
            label="Included"
            values={values.included}
            onChange={(v) => set("included", v)}
            placeholder="e.g. Airport transfers"
          />
          <TagListInput
            label="Excluded"
            values={values.excluded}
            onChange={(v) => set("excluded", v)}
            placeholder="e.g. International flights"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Day-by-Day Itinerary</h2>
        <p className="mt-1 text-xs text-forest-500">
          Days are numbered automatically from their order — reorder with the arrows.
        </p>
        <div className="mt-4">
          <ItineraryEditor days={values.itinerary} onChange={(v) => set("itinerary", v)} />
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
          onClick={() => router.push("/admin/packages")}
          className="rounded-full border-2 border-forest-700 px-5 py-2.5 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Package" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
