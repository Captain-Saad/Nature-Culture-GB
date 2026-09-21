"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/shared/Modal";
import ImageGallery from "@/components/shared/ImageGallery";
import EstimatedBadge from "@/components/shared/EstimatedBadge";
import GlareHover from "@/components/shared/GlareHover";
import { useTripCart } from "@/lib/tripCart/TripCartContext";
import type { HotelRoom } from "@/lib/types";

interface RoomDetailModalProps {
  open: boolean;
  onClose: () => void;
  room: HotelRoom;
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  cancellationPolicy: string;
  lastUpdated: string;
}

/** Today, as "yyyy-mm-dd", for the check-in input's min attribute. */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function RoomDetailModal({
  open,
  onClose,
  room,
  hotelId,
  hotelSlug,
  hotelName,
  cancellationPolicy,
  lastUpdated,
}: RoomDetailModalProps) {
  const t = useTranslations();
  const { addHotelRoom } = useTripCart();
  const fieldId = useId();

  const [checkIn, setCheckIn] = useState(todayIso());
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(Math.min(2, room.capacity));
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addHotelRoom({
      hotelId,
      hotelSlug,
      hotelName,
      roomType: room.type,
      image: room.images[0] ?? null,
      checkIn,
      nights,
      guests,
      estimatedPricePKR: room.estimatedPricePKR,
    });
    setAdded(true);
  }

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

      <div className="mt-6 border-t border-cream-200 pt-5">
        <p className="font-display text-2xl font-bold text-forest-900">
          {t("common.currency")} {room.estimatedPricePKR.toLocaleString()}
          <span className="text-sm font-normal text-forest-600"> {t("common.perNight")}</span>
        </p>
        <EstimatedBadge lastUpdated={lastUpdated} />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${fieldId}-checkin`} className="text-sm font-semibold text-forest-800">
              {t("hotels.detail.checkIn")}
            </label>
            <input
              id={`${fieldId}-checkin`}
              type="date"
              min={todayIso()}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setAdded(false);
              }}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label htmlFor={`${fieldId}-nights`} className="text-sm font-semibold text-forest-800">
              {t("hotels.detail.nights")}
            </label>
            <input
              id={`${fieldId}-nights`}
              type="number"
              min={1}
              max={60}
              value={nights}
              onChange={(e) => {
                setNights(Math.max(1, Number(e.target.value)));
                setAdded(false);
              }}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
            />
          </div>
          <div>
            <label htmlFor={`${fieldId}-guests`} className="text-sm font-semibold text-forest-800">
              {t("hotels.detail.guestsLabel")}
            </label>
            <input
              id={`${fieldId}-guests`}
              type="number"
              min={1}
              max={room.capacity}
              value={guests}
              onChange={(e) => {
                setGuests(Math.max(1, Math.min(room.capacity, Number(e.target.value))));
                setAdded(false);
              }}
              className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
            />
          </div>
        </div>

        <GlareHover className="mt-4 block rounded-full">
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full rounded-full px-5 py-2.5 text-sm font-bold shadow-card transition-colors ${
              added
                ? "bg-forest-700 text-white hover:bg-forest-800"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {added ? `✓ ${t("common.addedToTrip")}` : t("common.addToMyTrip")}
          </button>
        </GlareHover>
      </div>
    </Modal>
  );
}
