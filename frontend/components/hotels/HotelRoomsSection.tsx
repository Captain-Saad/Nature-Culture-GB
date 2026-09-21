"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import RoomDetailModal from "./RoomDetailModal";
import type { HotelRoom } from "@/lib/types";

interface HotelRoomsSectionProps {
  rooms: HotelRoom[];
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  cancellationPolicy: string;
  lastUpdated: string;
}

export default function HotelRoomsSection({
  rooms,
  hotelId,
  hotelSlug,
  hotelName,
  cancellationPolicy,
  lastUpdated,
}: HotelRoomsSectionProps) {
  const t = useTranslations();
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rooms.map((room) => (
          <button
            key={room.type}
            type="button"
            onClick={() => setSelectedRoom(room)}
            className="rounded-card bg-cream-100 p-4 text-left transition-shadow hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
          >
            <p className="font-semibold text-forest-900">{room.type}</p>
            <p className="mt-1 text-sm text-forest-600">
              {t("hotels.detail.upToGuests", { count: room.capacity })}
            </p>
            <p className="mt-2 font-display text-lg font-bold text-forest-900">
              {t("common.currency")} {room.estimatedPricePKR.toLocaleString()}
              <span className="text-sm font-normal text-forest-600"> {t("common.perNight")}</span>
            </p>
            <EstimatedBadge lastUpdated={lastUpdated} />
            <span className="mt-2 block text-xs font-semibold text-orange-600">
              {t("hotels.detail.viewRoomDetails")} →
            </span>
          </button>
        ))}
      </div>

      {selectedRoom && (
        <RoomDetailModal
          open
          onClose={() => setSelectedRoom(null)}
          room={selectedRoom}
          hotelId={hotelId}
          hotelSlug={hotelSlug}
          hotelName={hotelName}
          cancellationPolicy={cancellationPolicy}
          lastUpdated={lastUpdated}
        />
      )}
    </>
  );
}
