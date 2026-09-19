"use client";

import { useState } from "react";
import TagListInput from "@/components/admin/shared/TagListInput";
import MediaGalleryManager from "@/components/admin/shared/MediaGalleryManager";
import type { AdminRoomType } from "@/lib/admin/types";

interface RoomsEditorProps {
  rooms: AdminRoomType[];
  onChange: (next: AdminRoomType[]) => void;
}

const emptyRoom: AdminRoomType = {
  type: "",
  capacity: 2,
  estimatedPricePKR: 0,
  images: [],
  videos: [],
  bedConfig: "",
  maxOccupancy: { adults: 2, children: 0 },
  facilities: [],
};

/**
 * Room types, edited inside the hotel form. They're stored as a JSON array on
 * Hotel rather than their own table (see backend/prisma/schema.prisma), so
 * they save with the hotel -- there's no separate room endpoint to call.
 *
 * Rooms are collapsed by default: a hotel with six room types, each carrying
 * its own gallery, is unusable as six expanded forms stacked vertically.
 */
export default function RoomsEditor({ rooms, onChange }: RoomsEditorProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function addRoom() {
    onChange([...rooms, { ...emptyRoom, images: [], videos: [], facilities: [] }]);
    setOpenIndex(rooms.length);
  }

  function removeRoom(index: number) {
    onChange(rooms.filter((_, i) => i !== index));
    setOpenIndex(null);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rooms.length) return;
    const next = [...rooms];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpenIndex(target);
  }

  function update(index: number, patch: Partial<AdminRoomType>) {
    onChange(rooms.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  return (
    <div>
      {rooms.length === 0 && (
        <p className="rounded-lg border border-dashed border-cream-400 bg-cream-100 px-4 py-6 text-center text-sm text-forest-500">
          No room types yet. Add the first one below.
        </p>
      )}

      <div className="space-y-3">
        {rooms.map((room, i) => {
          const isOpen = openIndex === i;
          const mediaCount = room.images.length + (room.videos?.length ?? 0);

          return (
            <div key={i} className="rounded-lg border border-cream-300 bg-cream-50">
              <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="font-semibold text-forest-900">
                    {room.type.trim() || <em className="text-forest-500">Untitled room type</em>}
                  </span>
                  <span className="ml-2 text-xs text-forest-500">
                    {room.estimatedPricePKR.toLocaleString()} PKR · sleeps {room.capacity} ·{" "}
                    {mediaCount} media
                  </span>
                </button>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${room.type || "room"} up`}
                    className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === rooms.length - 1}
                    aria-label={`Move ${room.type || "room"} down`}
                    className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="rounded-md border border-forest-700 px-2 py-1 text-xs font-bold text-forest-700 hover:bg-forest-50"
                  >
                    {isOpen ? "Close" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoom(i)}
                    aria-label={`Remove ${room.type || "room"}`}
                    className="rounded-md border border-red-600 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-cream-300 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Room Name / Type</label>
                      <input
                        type="text"
                        value={room.type}
                        onChange={(e) => update(i, { type: e.target.value })}
                        placeholder="e.g. Deluxe Double"
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Bed Configuration</label>
                      <input
                        type="text"
                        value={room.bedConfig}
                        onChange={(e) => update(i, { bedConfig: e.target.value })}
                        placeholder="e.g. 1 King Bed"
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Price / Night (PKR)</label>
                      <input
                        type="number"
                        min={0}
                        value={room.estimatedPricePKR}
                        onChange={(e) => update(i, { estimatedPricePKR: Number(e.target.value) })}
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Size (sq ft)</label>
                      <input
                        type="number"
                        min={1}
                        value={room.sizeSqFt ?? ""}
                        onChange={(e) =>
                          update(i, {
                            sizeSqFt: e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                        placeholder="Optional"
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Sleeps (total)</label>
                      <input
                        type="number"
                        min={1}
                        value={room.capacity}
                        onChange={(e) => update(i, { capacity: Number(e.target.value) })}
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Max Adults</label>
                      <input
                        type="number"
                        min={0}
                        value={room.maxOccupancy.adults}
                        onChange={(e) =>
                          update(i, {
                            maxOccupancy: { ...room.maxOccupancy, adults: Number(e.target.value) },
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-forest-800">Max Children</label>
                      <input
                        type="number"
                        min={0}
                        value={room.maxOccupancy.children}
                        onChange={(e) =>
                          update(i, {
                            maxOccupancy: { ...room.maxOccupancy, children: Number(e.target.value) },
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2 text-sm outline-none focus:border-forest-500"
                      />
                    </div>
                  </div>

                  <TagListInput
                    label="Room Facilities"
                    values={room.facilities}
                    onChange={(v) => update(i, { facilities: v })}
                    placeholder="e.g. Mountain View"
                  />

                  <div>
                    <label className="text-sm font-semibold text-forest-800">Room Photos &amp; Videos</label>
                    <div className="mt-2">
                      <MediaGalleryManager
                        label=""
                        value={{ images: room.images, videos: room.videos ?? [] }}
                        onChange={(next) => update(i, { images: next.images, videos: next.videos })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRoom}
        className="mt-4 rounded-lg border-2 border-forest-700 px-4 py-2 text-sm font-bold text-forest-700 hover:bg-forest-50"
      >
        + Add Room Type
      </button>
    </div>
  );
}
