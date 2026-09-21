"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartDestinationItem, CartHotelRoomItem, CartItem, CartPackageItem } from "./types";

const STORAGE_KEY = "ncgb_trip_cart_v1";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface TripCartContextValue {
  items: CartItem[];
  count: number;
  /** False until the localStorage read on mount completes. Pages that
   * decide what to render based on whether the cart is empty (e.g.
   * /my-trip) should wait for this, otherwise they flash an "empty"
   * state before the real cart loads. */
  hydrated: boolean;
  addDestination: (item: Omit<CartDestinationItem, "cartItemId" | "type">) => void;
  addPackage: (item: Omit<CartPackageItem, "cartItemId" | "type">) => void;
  addHotelRoom: (item: Omit<CartHotelRoomItem, "cartItemId" | "type">) => void;
  removeItem: (cartItemId: string) => void;
  updateHotelRoom: (
    cartItemId: string,
    patch: Partial<Pick<CartHotelRoomItem, "nights" | "guests" | "checkIn">>
  ) => void;
  hasDestination: (id: string) => boolean;
  hasPackage: (id: string) => boolean;
  clear: () => void;
}

const TripCartContext = createContext<TripCartContextValue | null>(null);

export function TripCartProvider({ children }: { children: ReactNode }) {
  // Starts empty so server and first client render agree (no hydration
  // mismatch); the effect below loads whatever was actually stored.
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't overwrite storage with the initial [] before it's loaded
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addDestination = useCallback((item: Omit<CartDestinationItem, "cartItemId" | "type">) => {
    setItems((prev) => {
      const cartItemId = `destination:${item.id}`;
      if (prev.some((existing) => existing.cartItemId === cartItemId)) return prev;
      return [...prev, { ...item, cartItemId, type: "destination" }];
    });
  }, []);

  const addPackage = useCallback((item: Omit<CartPackageItem, "cartItemId" | "type">) => {
    setItems((prev) => {
      const cartItemId = `package:${item.id}`;
      if (prev.some((existing) => existing.cartItemId === cartItemId)) return prev;
      return [...prev, { ...item, cartItemId, type: "package" }];
    });
  }, []);

  const addHotelRoom = useCallback((item: Omit<CartHotelRoomItem, "cartItemId" | "type">) => {
    setItems((prev) => [...prev, { ...item, cartItemId: `hotelRoom:${randomId()}`, type: "hotelRoom" }]);
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateHotelRoom = useCallback(
    (cartItemId: string, patch: Partial<Pick<CartHotelRoomItem, "nights" | "guests" | "checkIn">>) => {
      setItems((prev) =>
        prev.map((item) => (item.cartItemId === cartItemId && item.type === "hotelRoom" ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const hasDestination = useCallback((id: string) => items.some((i) => i.cartItemId === `destination:${id}`), [items]);
  const hasPackage = useCallback((id: string) => items.some((i) => i.cartItemId === `package:${id}`), [items]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      hydrated,
      addDestination,
      addPackage,
      addHotelRoom,
      removeItem,
      updateHotelRoom,
      hasDestination,
      hasPackage,
      clear,
    }),
    [
      items,
      hydrated,
      addDestination,
      addPackage,
      addHotelRoom,
      removeItem,
      updateHotelRoom,
      hasDestination,
      hasPackage,
      clear,
    ]
  );

  return <TripCartContext.Provider value={value}>{children}</TripCartContext.Provider>;
}

export function useTripCart() {
  const ctx = useContext(TripCartContext);
  if (!ctx) throw new Error("useTripCart must be used within a TripCartProvider");
  return ctx;
}
