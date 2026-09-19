"use client";

import { useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { toMediaItems, canUseNextImage, type MediaItem } from "@/lib/utils/media";

interface ImageGalleryProps {
  images: string[];
  /**
   * Optional video URLs, rendered in the same grid and lightbox after the
   * images. Callers that predate video support pass nothing and behave
   * exactly as before.
   */
  videos?: string[];
  alt: string;
}

/** Thumbnail for one item: a still for images, a poster-frame for videos. */
function Thumb({ item, alt, index }: { item: MediaItem; alt: string; index: number }) {
  if (item.type === "video") {
    return (
      <>
        {/*
          preload="metadata" pulls just enough of the file for the browser to
          paint its first frame as a poster -- no separate poster image to
          generate or store, and no full download on a page that may show a
          dozen thumbnails.
        */}
        <video
          src={item.url}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          aria-label={`${alt} — video ${index + 1}`}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-900/25 transition-colors group-hover:bg-navy-900/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-card">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-navy-900" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </>
    );
  }

  return canUseNextImage(item.url) ? (
    <Image
      src={item.url}
      alt={`${alt} — ${index + 1}`}
      fill
      sizes="25vw"
      className="object-cover transition-transform group-hover:scale-105"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- admin-pasted URL from a host not in next.config's remotePatterns
    <img
      src={item.url}
      alt={`${alt} — ${index + 1}`}
      className="h-full w-full object-cover transition-transform group-hover:scale-105"
    />
  );
}

export default function ImageGallery({ images, videos, alt }: ImageGalleryProps) {
  const items = toMediaItems(images, videos);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const active = activeIndex === null ? null : items[activeIndex];

  function close() {
    setActiveIndex(null);
  }

  function next() {
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));
  }

  function prev() {
    setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item, i) => (
          <button
            key={`${item.value}-${i}`}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={
              item.type === "video" ? `Play video ${i + 1} of ${alt}` : `View image ${i + 1} of ${alt}`
            }
            className="group relative aspect-square overflow-hidden rounded-lg bg-cream-100"
          >
            <Thumb item={item} alt={alt} index={i} />
          </button>
        ))}
      </div>

      {active !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/90 p-4"
            role="dialog"
            aria-modal="true"
            onClick={close}
          >
            {items.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous item"
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 rtl:left-auto rtl:right-4"
              >
                ‹
              </button>
            )}

            <div className="relative h-[70vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              {active.type === "video" ? (
                // Gallery videos are content the visitor chose to open, not
                // background decoration: controls on, autoplay off, sound
                // under their control. key= forces a fresh element when
                // stepping between clips so the old one stops and unloads.
                <video
                  key={active.value}
                  src={active.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full bg-black object-contain"
                />
              ) : canUseNextImage(active.url) ? (
                <Image
                  src={active.url}
                  alt={`${alt} — ${activeIndex! + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- see Thumb
                <img
                  src={active.url}
                  alt={`${alt} — ${activeIndex! + 1}`}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            {items.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next item"
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 rtl:right-auto rtl:left-4"
              >
                ›
              </button>
            )}

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ✕
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
