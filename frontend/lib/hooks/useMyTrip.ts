"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ncgb_my_trip_destination_ids";

function readStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Client-side-only "trip list" backed by localStorage. Phase 4 (backend)
 * will replace this with a real user trip resource; call sites just
 * need `ids` and `add`/`remove`, so swapping the storage layer later
 * won't require touching consumers.
 */
export function useMyTrip() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readStoredIds());
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (id: string) => {
      persist(Array.from(new Set([...readStoredIds(), id])));
    },
    [persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(readStoredIds().filter((existing) => existing !== id));
    },
    [persist]
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, add, remove, has };
}
