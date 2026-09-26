"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Hotel } from "@/lib/types";
import { REGIONS, HOTEL_CATEGORIES } from "@/lib/admin/enums";
import HotelCard from "./HotelCard";
import FilterPanel, { FilterValues } from "@/components/shared/FilterPanel";

const PRICE_STEP = 1000;

/**
 * Filter options come from the hotels actually listed (managed in
 * /admin/hotels), not fixed lists: a new city or a facility an admin typed
 * in shows up here automatically, and the price slider always spans the
 * real price range, so no hotel is unreachable.
 */
function filterOptions(hotels: Hotel[]) {
  const cities = REGIONS.filter((r) => hotels.some((h) => h.city === r));
  const categories = HOTEL_CATEGORIES.filter((c) => hotels.some((h) => h.category === c));

  // Most common facilities first -- they're the ones people filter by.
  const counts = new Map<string, number>();
  for (const h of hotels) for (const f of h.facilities) counts.set(f, (counts.get(f) ?? 0) + 1);
  const facilities = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([f]) => f);

  const prices = hotels.map((h) => h.estimatedPricePKR).filter((p) => Number.isFinite(p));
  const minPrice = prices.length ? Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP : 0;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP : 0;

  return { cities, categories, facilities, minPrice, maxPrice };
}

export default function HotelsClient({ hotels }: { hotels: Hotel[] }) {
  const t = useTranslations("hotels");
  const tc = useTranslations("common");

  const options = useMemo(() => filterOptions(hotels), [hotels]);
  const defaultFilters: FilterValues = {
    city: "",
    category: [],
    facilities: [],
    maxPrice: options.maxPrice,
    minRating: "",
  };
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      const matchesCity = !filters.city || h.city === filters.city;
      const matchesCategory =
        !(filters.category as string[])?.length || (filters.category as string[]).includes(h.category);
      const matchesFacilities =
        !(filters.facilities as string[])?.length ||
        (filters.facilities as string[]).every((f) => h.facilities.includes(f));
      const matchesPrice = h.estimatedPricePKR <= ((filters.maxPrice as number) ?? Infinity);
      const matchesRating = !filters.minRating || h.starRating >= Number(filters.minRating);
      return matchesCity && matchesCategory && matchesFacilities && matchesPrice && matchesRating;
    });
  }, [hotels, filters]);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <FilterPanel
        groups={[
          {
            type: "select",
            key: "city",
            label: t("filterCity"),
            options: [{ label: tc("region"), value: "" }, ...options.cities.map((c) => ({ label: c, value: c }))],
          },
          {
            type: "checkboxGroup",
            key: "category",
            label: t("filterCategory"),
            options: options.categories.map((c) => ({ label: c, value: c })),
          },
          {
            type: "range",
            key: "maxPrice",
            label: t("filterPriceRange"),
            min: options.minPrice,
            max: options.maxPrice,
            step: PRICE_STEP,
            unit: "PKR ",
          },
          {
            type: "select",
            key: "minRating",
            label: t("filterRating"),
            options: [
              { label: tc("rating"), value: "" },
              { label: "3+", value: "3" },
              { label: "4+", value: "4" },
            ],
          },
          {
            type: "checkboxGroup",
            key: "facilities",
            label: t("filterFacilities"),
            options: options.facilities.map((f) => ({ label: f, value: f })),
          },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={() => setFilters(defaultFilters)}
        className="lg:sticky lg:top-24 lg:self-start"
      />

      {filtered.length === 0 ? (
        <p className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
          {tc("noResults")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}
    </div>
  );
}
