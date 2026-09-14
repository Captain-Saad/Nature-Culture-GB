"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Hotel, HotelCategory, Region } from "@/lib/types";
import HotelCard from "./HotelCard";
import FilterPanel, { FilterValues } from "@/components/shared/FilterPanel";

const CITIES: Region[] = ["Skardu", "Hunza", "Gilgit", "Shigar", "Diamer", "Ghanche"];
const CATEGORIES: HotelCategory[] = ["Budget", "Mid-Range", "Luxury"];
const ALL_FACILITIES = ["Free Wi-Fi", "Parking", "Restaurant", "Mountain View", "Lake View", "Garden"];

export default function HotelsClient({ hotels }: { hotels: Hotel[] }) {
  const t = useTranslations("hotels");
  const tc = useTranslations("common");

  const [filters, setFilters] = useState<FilterValues>({
    city: "",
    category: [],
    facilities: [],
    maxPrice: 50000,
    minRating: "",
  });

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
            options: [{ label: tc("region"), value: "" }, ...CITIES.map((c) => ({ label: c, value: c }))],
          },
          {
            type: "checkboxGroup",
            key: "category",
            label: t("filterCategory"),
            options: CATEGORIES.map((c) => ({ label: c, value: c })),
          },
          {
            type: "range",
            key: "maxPrice",
            label: t("filterPriceRange"),
            min: 5000,
            max: 50000,
            step: 1000,
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
            options: ALL_FACILITIES.map((f) => ({ label: f, value: f })),
          },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={() =>
          setFilters({ city: "", category: [], facilities: [], maxPrice: 50000, minRating: "" })
        }
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
