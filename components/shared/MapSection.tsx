"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { MapPin } from "./LeafletMapInner";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-card bg-cream-200 text-sm text-forest-500">
      Loading map…
    </div>
  ),
});

interface MapSectionProps {
  pins: MapPin[];
  centerLat: number;
  centerLng: number;
  zoom?: number;
  className?: string;
}

export default function MapSection({
  pins,
  centerLat,
  centerLng,
  zoom,
  className = "h-80",
}: MapSectionProps) {
  const t = useTranslations("common");

  return (
    <div className={className}>
      <h3 className="mb-3 font-display text-lg font-bold text-forest-900">{t("map")}</h3>
      <div className="h-[calc(100%-2rem)] overflow-hidden rounded-card shadow-card">
        <LeafletMapInner pins={pins} centerLat={centerLat} centerLng={centerLng} zoom={zoom} />
      </div>
    </div>
  );
}
