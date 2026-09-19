"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import SingleMediaPicker from "@/components/admin/shared/SingleMediaPicker";
import type { AdminSiteSettings } from "@/lib/admin/types";

const HERO_VIDEO_MAX_BYTES = 30 * 1024 * 1024;

type Editable = Omit<AdminSiteSettings, "id" | "updatedAt">;

interface SiteSettingsFormProps {
  initial: AdminSiteSettings;
}

/**
 * The site-settings singleton: no list, no create, no delete -- just this
 * one form, PATCHing the single row.
 */
export default function SiteSettingsForm({ initial }: SiteSettingsFormProps) {
  const router = useRouter();
  const { request } = useAdminApi();
  const [values, setValues] = useState<Editable>({
    heroHeadline: initial.heroHeadline ?? "",
    heroSubtext: initial.heroSubtext ?? "",
    aboutUsCopy: initial.aboutUsCopy ?? "",
    contactDisplayText: initial.contactDisplayText ?? "",
    heroBackgroundImage: initial.heroBackgroundImage ?? "",
    heroBackgroundVideo: initial.heroBackgroundVideo ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Editable>(key: K, value: Editable[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const { error: err } = await request("site-settings", {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }
    setSaved(true);
    // Refreshes the server-rendered home page so a new hero shows immediately.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-forest-100 px-4 py-3 text-sm font-semibold text-forest-800">
          Saved. The home page will show the change on its next load.
        </p>
      )}

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Home Hero Text</h2>
        <p className="mt-1 text-xs text-forest-500">
          Leave a field empty to keep the site&apos;s built-in wording.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-forest-800">Headline</label>
            <input
              type="text"
              value={values.heroHeadline ?? ""}
              onChange={(e) => set("heroHeadline", e.target.value)}
              placeholder="Discover the Mountains. Experience the Culture."
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Subtext</label>
            <textarea
              rows={3}
              value={values.heroSubtext ?? ""}
              onChange={(e) => set("heroSubtext", e.target.value)}
              placeholder="Plan your journey through Gilgit-Baltistan…"
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Home Hero Background</h2>
        <p className="mt-1 text-xs text-forest-500">
          If a video is set it plays behind the hero, with the image as its poster. On phones and
          for visitors who prefer reduced motion, the image is shown instead of the video.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <SingleMediaPicker
            label="Background Image"
            kind="image"
            value={values.heroBackgroundImage}
            onChange={(url) => set("heroBackgroundImage", url)}
            helpText="Used on its own, and as the video's poster frame. JPG, PNG or WebP up to 5MB."
          />
          <SingleMediaPicker
            label="Background Video"
            kind="video"
            value={values.heroBackgroundVideo}
            onChange={(url) => set("heroBackgroundVideo", url)}
            maxBytes={HERO_VIDEO_MAX_BYTES}
            helpText="Optional. Muted, looping MP4 up to 30MB — keep it short."
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-forest-900">Site Copy</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-forest-800">About Us</label>
            <textarea
              rows={6}
              value={values.aboutUsCopy ?? ""}
              onChange={(e) => set("aboutUsCopy", e.target.value)}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-forest-800">Contact Display Text</label>
            <textarea
              rows={3}
              value={values.contactDisplayText ?? ""}
              onChange={(e) => set("contactDisplayText", e.target.value)}
              placeholder="Phone, email or office hours shown on the contact page."
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
