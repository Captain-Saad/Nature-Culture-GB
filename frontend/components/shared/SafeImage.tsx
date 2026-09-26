"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { TbPhotoOff } from "react-icons/tb";

/**
 * Drop-in replacement for next/image that degrades to a neutral placeholder
 * when the source fails to load, instead of the browser's broken-image icon
 * and alt text. A stored media reference can outlive its file (deleted from
 * storage, or lost from an ephemeral server disk), and one dead reference
 * shouldn't break the card or hero it sits in.
 */
export default function SafeImage({ onError, className, fill, width, height, style, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt.
  useEffect(() => setFailed(false), [props.src]);

  if (failed) {
    return <MediaPlaceholder className={className} fill={fill} width={width} height={height} label={alt} />;
  }

  return (
    <Image
      {...props}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      style={style}
      className={className}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}

/** Same fallback for places that render a plain <img>. */
export function SafeImg({ className, alt, onError, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [props.src]);

  if (failed) return <MediaPlaceholder className={className} label={alt} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary stored/admin-supplied URLs
    <img
      {...props}
      alt={alt}
      className={className}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}

function MediaPlaceholder({
  className = "",
  fill,
  width,
  height,
  label,
}: {
  className?: string;
  fill?: boolean;
  width?: number | `${number}`;
  height?: number | `${number}`;
  label?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label || undefined}
      className={`${fill ? "absolute inset-0 h-full w-full" : ""} flex items-center justify-center bg-gradient-to-br from-forest-100 via-cream-100 to-forest-200 text-forest-400 ${className}`}
      style={fill ? undefined : { width: width ? Number(width) : undefined, height: height ? Number(height) : undefined }}
    >
      <TbPhotoOff aria-hidden className="h-8 w-8 opacity-60" />
    </div>
  );
}
