"use client";

import { useRef, useState } from "react";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { resolveMediaUrl, isUploadedFile, type MediaKind } from "@/lib/utils/media";

const MIME: Record<MediaKind, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4"],
};

const DEFAULT_MAX: Record<MediaKind, number> = {
  image: 5 * 1024 * 1024,
  video: 30 * 1024 * 1024,
};

interface SingleMediaPickerProps {
  label: string;
  kind: MediaKind;
  /** "" or null when nothing is set. */
  value: string | null;
  onChange: (next: string) => void;
  maxBytes?: number;
  helpText?: string;
}

/**
 * One optional file, for fields that take a single item rather than a
 * gallery -- a situation report's attachment, the home hero's background.
 * Uses the same upload endpoint and cleanup rules as MediaGalleryManager:
 * replacing or clearing an uploaded file deletes the old one from disk.
 */
export default function SingleMediaPicker({
  label,
  kind,
  value,
  onChange,
  maxBytes,
  helpText,
}: SingleMediaPickerProps) {
  const { request } = useAdminApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const limit = maxBytes ?? DEFAULT_MAX[kind];

  async function deleteIfUploaded(url: string | null) {
    if (!url || !isUploadedFile(url)) return;
    await request("uploads", { method: "DELETE", body: JSON.stringify({ url }) });
  }

  async function handleFile(file: File) {
    setError(null);

    if (!MIME[kind].includes(file.type)) {
      setError(kind === "video" ? "Use an MP4 video." : "Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > limit) {
      setError(
        `File is ${Math.round(file.size / 1048576)}MB — the limit is ${Math.round(limit / 1048576)}MB.`
      );
      return;
    }

    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const { data, error: err } = await request<{ url: string }>("uploads", { method: "POST", body: form });

    if (err || !data) {
      setBusy(false);
      setError(err ?? "Upload failed.");
      return;
    }

    // The backend deletes the replaced hero file itself when the settings row
    // is saved, so this only cleans up when the field isn't server-managed.
    onChange(data.url);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove() {
    const previous = value;
    onChange("");
    setError(null);
    await deleteIfUploaded(previous);
  }

  return (
    <div>
      {label && <label className="text-sm font-semibold text-forest-800">{label}</label>}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {value ? (
          <div className="group relative h-24 w-40 overflow-hidden rounded-lg border border-cream-300 bg-cream-100">
            {kind === "video" ? (
              <video
                src={resolveMediaUrl(value)}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
              <img src={resolveMediaUrl(value)} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={remove}
              aria-label={`Remove ${kind}`}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-dashed border-cream-400 bg-cream-100 text-xs text-forest-500">
            No {kind}
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="file"
            accept={MIME[kind].join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-forest-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
          >
            {busy ? "Uploading…" : value ? `Replace ${kind}` : `Upload ${kind}`}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-orange-700">
          {error}
        </p>
      )}
      <p className="mt-1 text-xs text-forest-500">
        {helpText ??
          (kind === "video"
            ? `Optional. MP4 up to ${Math.round(limit / 1048576)}MB.`
            : `Optional. JPG, PNG or WebP up to ${Math.round(limit / 1048576)}MB.`)}
      </p>
    </div>
  );
}
