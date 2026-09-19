import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mountain } from "@/lib/types";
import { placeholderImage } from "@/lib/utils/image";
import { resolveMediaUrl } from "@/lib/utils/media";

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-forest-100 text-forest-800",
  Moderate: "bg-cream-300 text-forest-800",
  Challenging: "bg-orange-200 text-orange-800",
  Extreme: "bg-navy-800 text-cream-50",
};

export default function MountainCard({ mountain }: { mountain: Mountain }) {
  const t = useTranslations();

  return (
    <Link
      href={`/mountains/${mountain.slug}`}
      className="group block overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-card-lg"
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={
            mountain.images[0]
              ? resolveMediaUrl(mountain.images[0])
              : placeholderImage(mountain.slug, 600, 450)
          }
          alt={mountain.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${DIFFICULTY_STYLES[mountain.difficulty]}`}
        >
          {mountain.difficulty}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
          {mountain.range} · {t("mountains.elevation")} {mountain.heightMeters.toLocaleString()}m
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-forest-900">{mountain.name}</h3>
        <p className="mt-1 text-sm text-forest-600">
          {t("common.range")} #{mountain.worldRank} · {mountain.nearestTown}
        </p>
      </div>
    </Link>
  );
}
