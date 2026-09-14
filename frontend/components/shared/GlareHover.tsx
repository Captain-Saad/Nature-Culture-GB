"use client";

import { ReactNode, useRef } from "react";

interface GlareHoverProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
}

/**
 * Wraps CTA-style content with a cursor-tracked glare sweep on hover.
 * Pointer position drives a CSS radial-gradient via custom properties,
 * so the effect stays smooth without a per-frame JS animation loop.
 */
export default function GlareHover({
  children,
  className = "",
  glareColor = "rgba(255, 255, 255, 0.35)",
}: GlareHoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glare-x", `${x}%`);
    el.style.setProperty("--glare-y", `${y}%`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative isolate overflow-hidden ${className}`}
      style={{ "--glare-color": glareColor } as React.CSSProperties}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle 120px at var(--glare-x, 50%) var(--glare-y, 50%), var(--glare-color), transparent 70%)",
        }}
      />
    </div>
  );
}
