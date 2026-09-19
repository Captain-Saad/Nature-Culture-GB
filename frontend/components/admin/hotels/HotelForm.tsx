"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { slugify } from "@/lib/admin/slugify";
import { REGIONS, HOTEL_CATEGORIES } from "@/lib/admin/enums";
import TagListInput from "@/components/admin/shared/TagListInput";
import MediaGalleryManager from "@/components/admin/shared/MediaGalleryManager";
import RoomsEditor from "@/components/admin/hotels/RoomsEditor";
import type { AdminHotel, AdminHotelInput } from "@/lib/admin/types";

/** The API returns an ISO timestamp; <input type="date"> wants yyyy-mm-dd. */
function toDateInput(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyHotel: AdminHotelInput = {
  slug: "",
  name: "",
  region: REGIONS[0],
  images: [],
  videos: [],
  description: "",
  starRating: 3,
  category: HOTEL_CATEGORIES[1],
  estimatedPricePerNightPKR: 0,
  priceLastUpdated: todayInput(),
  facilities: [],
  roomTypes: [],
  cancellationPolicy: "",
  lat: 0,
  lng: 0,
};

interface HotelFormProps {
  mode: "create" | "edit";
  initial?: AdminHotel;
}

export default function HotelForm({ mode, initial }: HotelFormProps) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [values, setValues] = useState<AdminHotelInput>(
    initial
      ? {
          ...initial,
          description: initial.description ?? "",
          videos: initial.videos ?? [],
          roomTypes: initial.roomTypes ?? [],
          priceLastUpdated: toDateInput(initial.priceLastUpdated),
        }
      : emptyHotel
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof AdminHotelInput>(key: K, value: AdminHotelInput[K]) {
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
    if (!values.cancellationPolicy.trim()) {
      setError("Cancellation policy is required.");
      return;
    }

    // Caught here so an incomplete room reads as "Room 2 needs…" rather than
    // arriving as a Zod field-path error from the backend.
    const badRoom = values.roomTypes.findIndex(
      (r) => !r.type.trim() || !r.bedConfig.trim() || r.capacity < 1
    );
    if (badRoom !== -1) {
      setError(
        `Room type ${badRoom + 1} needs a name, a bed configuration, and a capacity of at least 1.`
      );
      return;
    }

    setSaving(true);
    const path = mode === "create" ? "hotels" : `hotels/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    // description is sent as "" rather than omitted when empty --
    // JSON.stringify drops undefined keys, which on a PATCH would silently
    // keep the old text instead of clearing it. sizeSqFt is the opposite
    // case: the backend marks it optional, so an unset one must be absent
    // rather than null.
    const payload = {
      ...values,
      description: values.description?.trim() ?? "",
      roomTypes: values.roomTypes.map((r) => ({
        type: r.type.trim(),
        capacity: r.capacity,
        estimatedPricePKR: r.estimatedPricePKR,
        images: r.images,
        videos: r.videos ?? [],
        bedConfig: r.bedConfig.trim(),
        maxOccupancy: r.maxOccupancy,
        facilities: r.facilities,
        ...(r.sizeSqFt ? { sizeSqFt: r.sizeSqFt } : {}),
      })),
    };

    const { error: err } = await request(path, { method, body: JSON.stringify(payload) });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    router.push("/admin/hotels");
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
            <label className="text-sm font-semibold text-forest-800">Location (Region)</label>
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
            <label className="text-sm font-semibold text-forest-800">Category</label>
            <select
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            >
              {HOTEL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Star Rating</label>
            <select
              value={values.starRating}
              onChange={(e) => set("starRating", Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} star{n === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-forest-800">Description</label>
          <textarea
            rows={4}
            value={values.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Editorial description shown in the admin and available to the public API."
            className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Pricing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-forest-800">Estimated Price / Night (PKR)</label>
            <input
              type="number"
              min={0}
              required
              value={values.estimatedPricePerNightPKR}
              onChange={(e) => set("estimatedPricePerNightPKR", Number(e.target.value))}
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
            <p className="mt-1 text-xs text-forest-500">
              Shown to visitors as the &ldquo;estimated price&rdquo; date — keep it current.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Facilities &amp; Policy</h2>
        <div className="mt-4 space-y-4">
          <TagListInput
            label="Facilities"
            values={values.facilities}
            onChange={(v) => set("facilities", v)}
            placeholder="e.g. Free Wi-Fi"
          />
          <div>
            <label className="text-sm font-semibold text-forest-800">Cancellation Policy</label>
            <textarea
              required
              rows={3}
              value={values.cancellationPolicy}
              onChange={(e) => set("cancellationPolicy", e.target.value)}
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

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Room Types</h2>
        <p className="mt-1 text-xs text-forest-500">
          Room types are saved with the hotel — press Save Changes below once you&apos;ve edited them.
        </p>
        <div className="mt-4">
          <RoomsEditor rooms={values.roomTypes} onChange={(v) => set("roomTypes", v)} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/hotels")}
          className="rounded-full border-2 border-forest-700 px-5 py-2.5 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Hotel" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
