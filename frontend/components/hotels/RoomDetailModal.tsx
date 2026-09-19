"use client";

import { useTranslations } from "next-intl";
import Modal from "@/components/shared/Modal";
import ImageGallery from "@/components/shared/ImageGallery";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import BookingButton from "@/components/shared/BookingButton";
import type { HotelRoom } from "@/lib/types";

interface RoomDetailModalProps {
  open: boolean;
  onClose: () => void;
  room: HotelRoom;
  hotelName: string;
  cancellationPolicy: string;
  lastUpdated: string;
}

export default function RoomDetailModal({
  open,
  onClose,
  room,
  hotelName,
  cancellationPolicy,
  lastUpdated,
}: RoomDetailModalProps) {
  const t = useTranslations();

  return (
    <Modal open={open} onClose={onClose} title={room.type} size="lg">
      {room.images.length > 0 && (
        <div className="mb-6">
          <ImageGallery images={room.images} videos={room.videos} alt={`${room.type} — ${hotelName}`} />
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card bg-cream-100 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
            {t("hotels.detail.bedConfiguration")}
          </dt>
          <dd className="mt-1 font-semibold text-forest-900">{room.bedConfig}</dd>
        </div>
        <div className="rounded-card bg-cream-100 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
            {t("hotels.detail.maxOccupancy")}
          </dt>
          <dd className="mt-1 font-semibold text-forest-900">
            {room.maxOccupancy.adults} {t("hotels.detail.adults")}
            {room.maxOccupancy.children > 0
              ? `, ${room.maxOccupancy.children} ${t("hotels.detail.children")}`
              : ""}
          </dd>
        </div>
        {room.sizeSqFt && (
          <div className="rounded-card bg-cream-100 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-forest-500">
              {t("hotels.detail.roomSize")}
            </dt>
            <dd className="mt-1 font-semibold text-forest-900">
              {room.sizeSqFt} {t("hotels.detail.sqft")}
            </dd>
          </div>
        )}
      </dl>

      {room.facilities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-forest-500">
            {t("hotels.detail.facilities")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {room.facilities.map((f) => (
              <span
                key={f}
                className="rounded-full bg-forest-100 px-3 py-1.5 text-sm font-medium text-forest-800"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-forest-500">
          {t("hotels.detail.cancellationPolicy")}
        </h3>
        <p className="mt-2 text-sm text-forest-600">{cancellationPolicy}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-cream-200 pt-5">
        <div>
          <p className="font-display text-2xl font-bold text-forest-900">
            {t("common.currency")} {room.estimatedPricePKR.toLocaleString()}
            <span className="text-sm font-normal text-forest-600"> {t("common.perNight")}</span>
          </p>
          <EstimatedBadge lastUpdated={lastUpdated} />
        </div>
        <BookingButton context={`${hotelName} — ${room.type}`} />
      </div>
    </Modal>
  );
}
