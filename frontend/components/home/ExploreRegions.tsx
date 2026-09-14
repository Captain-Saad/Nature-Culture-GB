import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Region } from "@/lib/types";
import { placeholderImage } from "@/lib/utils/image";
import ScrollReveal from "@/components/shared/ScrollReveal";

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

export default function ExploreRegions() {
  return (
    <ScrollReveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {REGIONS.map((region) => (
        <Link
          key={region}
          href={{ pathname: "/destinations", query: { region } }}
          className="group relative aspect-square overflow-hidden rounded-card"
        >
          <Image
            src={placeholderImage(`region-${region}`, 400, 400)}
            alt={region}
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-navy-900/40 transition-colors group-hover:bg-navy-900/20" />
          <span className="absolute inset-x-0 bottom-3 text-center font-display text-sm font-bold text-cream-50">
            {region}
          </span>
        </Link>
      ))}
    </ScrollReveal>
  );
}
