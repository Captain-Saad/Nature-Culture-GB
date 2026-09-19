"use client";

import { useRef, useState } from "react";
import { useAdminApi } from "@/lib/admin/useAdminApi";
import { resolveMediaUrl, isUploadedFile, type MediaKind } from "@/lib/utils/media";

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_MIME = ["video/mp4"];
const ACCEPT = [...IMAGE_MIME, ...VIDEO_MIME].join(",");

// Mirrors backend/src/lib/uploads.ts. Client-side checks are for fast
// feedback only -- the backend re-validates type, size and magic bytes and
// is the actual gate.
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 30 * 1024 * 1024;

export interface MediaValue {
  images: string[];
  videos: string[];
}

interface MediaGalleryManagerProps {
  label: string;
  value: MediaValue;
  onChange: (next: MediaValue) => void;
  /** Overrides the video ceiling shown in help text (hero clips allow more). */
  videoMaxBytes?: number;
  helpText?: string;
}

interface Row {
  value: string;
  kind: MediaKind;
  /** Index within its own array (images[] or videos[]). */
  index: number;
}

function formatMb(bytes: number) {
  return `${Math.round(bytes / 1048576)}MB`;
}

/**
 * The media manager shared by every admin entity form: a mixed grid of image
 * and video thumbnails, each individually removable, plus upload-from-disk
 * and paste-a-URL. Images and videos are stored in separate arrays (see
 * lib/utils/media.ts) but presented as one gallery; drag-to-reorder moves an
 * item within its own kind.
 */
export default function MediaGalleryManager({
  label,
  value,
  onChange,
  videoMaxBytes = VIDEO_MAX_BYTES,
  helpText,
}: MediaGalleryManagerProps) {
  const { request } = useAdminApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragRow, setDragRow] = useState<Row | null>(null);

  const images = value.images ?? [];
  const videos = value.videos ?? [];

  const rows: Row[] = [
    ...images.map((v, index) => ({ value: v, kind: "image" as const, index })),
    ...videos.map((v, index) => ({ value: v, kind: "video" as const, index })),
  ];

  function apply(next: Partial<MediaValue>) {
    onChange({ images, videos, ...next });
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const list = Array.from(files);
    const accepted: string[] = [];
    const nextImages = [...images];
    const nextVideos = [...videos];

    setUploading({ done: 0, total: list.length });

    for (let i = 0; i < list.length; i += 1) {
      const file = list[i];
      const isVideo = VIDEO_MIME.includes(file.type);
      const isImage = IMAGE_MIME.includes(file.type);

      if (!isVideo && !isImage) {
        setError(`"${file.name}" isn't a supported type. Use JPG, PNG, WebP or MP4.`);
        break;
      }

      const limit = isVideo ? videoMaxBytes : IMAGE_MAX_BYTES;
      if (file.size > limit) {
        setError(`"${file.name}" is ${formatMb(file.size)} — the limit is ${formatMb(limit)}.`);
        break;
      }

      const form = new FormData();
      form.append("file", file);

      const { data, error: err } = await request<{ url: string; type: MediaKind }>("uploads", {
        method: "POST",
        body: form,
      });

      if (err || !data) {
        setError(err ?? `Upload of "${file.name}" failed.`);
        break;
      }

      accepted.push(data.url);
      if (data.type === "video") nextVideos.push(data.url);
      else nextImages.push(data.url);

      setUploading({ done: i + 1, total: list.length });
    }

    setUploading(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Keep whatever did upload before an error, rather than silently
    // orphaning those files on disk.
    if (accepted.length > 0) apply({ images: nextImages, videos: nextVideos });
  }

  function addUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setError("Enter a valid absolute URL (https://…).");
      return;
    }
    // Only the file extension tells us what a remote URL points at.
    const isVideo = /\.(mp4|webm|mov)(\?|#|$)/i.test(trimmed);
    apply(isVideo ? { videos: [...videos, trimmed] } : { images: [...images, trimmed] });
    setUrlDraft("");
    setError(null);
  }

  async function removeRow(row: Row) {
    setError(null);

    if (row.kind === "video") apply({ videos: videos.filter((_, i) => i !== row.index) });
    else apply({ images: images.filter((_, i) => i !== row.index) });

    // Locally uploaded files are ours to clean up; externally hosted URLs
    // just leave the array. A failure here is non-fatal -- the item is
    // already gone from the gallery -- but worth surfacing.
    if (isUploadedFile(row.value)) {
      const { error: err } = await request("uploads", {
        method: "DELETE",
        body: JSON.stringify({ url: row.value }),
      });
      if (err) setError(`Removed from the gallery, but the file could not be deleted: ${err}`);
    }
  }

  function handleDrop(target: Row) {
    if (!dragRow || dragRow.kind !== target.kind || dragRow.index === target.index) {
      setDragRow(null);
      return;
    }
    const list = dragRow.kind === "video" ? [...videos] : [...images];
    const [moved] = list.splice(dragRow.index, 1);
    list.splice(target.index, 0, moved);
    apply(dragRow.kind === "video" ? { videos: list } : { images: list });
    setDragRow(null);
  }

  return (
    <div>
      {label && <label className="text-sm font-semibold text-forest-800">{label}</label>}

      {rows.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map((row) => (
            <div
              key={`${row.kind}-${row.index}-${row.value}`}
              draggable
              onDragStart={() => setDragRow(row)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(row)}
              className="group relative aspect-square cursor-move overflow-hidden rounded-lg border border-cream-300 bg-cream-100"
            >
              {row.kind === "video" ? (
                <>
                  <video
                    src={resolveMediaUrl(row.value)}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-900/25">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-navy-900" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URLs, not next.config's configured domains
                <img
                  src={resolveMediaUrl(row.value)}
                  alt={`${row.kind} ${row.index + 1}`}
                  className="h-full w-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => removeRow(row)}
                aria-label={`Remove ${row.kind} ${row.index + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                ×
              </button>

              <span className="absolute bottom-1 left-1 rounded bg-navy-900/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                {row.kind === "video" ? "Video" : `Img ${row.index + 1}`}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-forest-500">No media yet.</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading !== null}
          className="rounded-lg bg-forest-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : "Upload files"}
        </button>
        <span className="text-xs text-forest-500">or</span>
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => {
            setUrlDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="https://example.com/photo.jpg"
          className="min-w-[12rem] flex-1 rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
        />
        <button
          type="button"
          onClick={addUrl}
          className="shrink-0 rounded-lg border-2 border-forest-700 px-3 py-2 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Add URL
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-orange-700">
          {error}
        </p>
      )}

      <p className="mt-1 text-xs text-forest-500">
        {helpText ??
          `JPG, PNG or WebP up to ${formatMb(IMAGE_MAX_BYTES)}; MP4 video up to ${formatMb(videoMaxBytes)}. Drag thumbnails to reorder within images or videos.`}
      </p>
    </div>
  );
}
