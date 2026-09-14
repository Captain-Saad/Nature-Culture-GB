"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Destination, Region } from "@/lib/types";
import DestinationCard from "./DestinationCard";
import SearchBar from "@/components/shared/SearchBar";
import FilterPanel, { FilterValues } from "@/components/shared/FilterPanel";

const REGIONS: Region[] = [
  "Skardu",
  "Hunza",
  "Gilgit",
  "Astore",
  "Ghizer",
  "Nagar",
  "Diamer",
  "Ghanche",
  "Shigar",
  "Kharmang",
];

export default function DestinationsClient({ destinations }: { destinations: Destination[] }) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [filters, setFilters] = useState<FilterValues>({
    region: searchParams.get("region") ?? "",
  });

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      const matchesRegion = !filters.region || d.region === filters.region;
      const matchesQuery =
        !query ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.shortDescription.toLowerCase().includes(query.toLowerCase());
      return matchesRegion && matchesQuery;
    });
  }, [destinations, filters.region, query]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <FilterPanel
        groups={[
          {
            type: "select",
            key: "region",
            label: t("destinations.filterByRegion"),
            options: [
              { label: t("destinations.allRegions"), value: "" },
              ...REGIONS.map((r) => ({ label: r, value: r })),
            ],
          },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={() => setFilters({ region: "" })}
        className="lg:sticky lg:top-24 lg:self-start"
      />

      <div>
        <SearchBar value={query} onChange={setQuery} className="mb-6" />

        {filtered.length === 0 ? (
          <p className="rounded-card bg-white p-8 text-center text-forest-500 shadow-card">
            {t("common.noResults")}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
