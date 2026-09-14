"use client";

import { useState } from "react";

interface ImageGalleryManagerProps {
  label: string;
  images: string[];
  onChange: (next: string[]) => void;
}

/**
 * Generic string[] image manager: add by URL, delete, drag-to-reorder.
 * There's no file-upload backend yet (see the Destinations CRUD
 * summary), so "adding an image" means pasting a URL for now -- delete
 * and reorder both just send a modified array to the existing PATCH
 * endpoint, no new backend needed for those.
 */
export default function ImageGalleryManager({ label, images, onChange }: ImageGalleryManagerProps) {
  const [urlDraft, setUrlDraft] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addImage() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setUrlError("Enter a valid image URL.");
      return;
    }
    onChange([...images, trimmed]);
    setUrlDraft("");
    setUrlError(null);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div>
      <label className="text-sm font-semibold text-forest-800">{label}</label>

      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="group relative aspect-square cursor-move overflow-hidden rounded-lg border border-cream-300 bg-cream-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-pasted URLs, not from next.config's configured image domains */}
              <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                ×
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-navy-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-forest-500">No images yet.</p>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => {
            setUrlDraft(e.target.value);
            setUrlError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage();
            }
          }}
          placeholder="https://example.com/photo.jpg"
          className="flex-1 rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
        />
        <button
          type="button"
          onClick={addImage}
          className="shrink-0 rounded-lg border-2 border-forest-700 px-3 py-2 text-sm font-bold text-forest-700 hover:bg-forest-50"
        >
          Add Image
        </button>
      </div>
      {urlError && <p className="mt-1 text-xs font-semibold text-orange-700">{urlError}</p>}
      <p className="mt-1 text-xs text-forest-500">
        Paste an image URL to add it. Drag thumbnails to reorder.
      </p>
    </div>
  );
}
