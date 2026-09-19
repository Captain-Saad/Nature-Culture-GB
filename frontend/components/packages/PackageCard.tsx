import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TourPackage } from "@/lib/types";
import { placeholderImage } from "@/lib/utils/image";
import { resolveMediaUrl } from "@/lib/utils/media";
import EstimatedBadge from "@/components/shared/EstimatedBadge";

export default function PackageCard({ pkg }: { pkg: TourPackage }) {
  const t = useTranslations("common");

  return (
    <article className="flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-card-lg">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={pkg.images[0] ? resolveMediaUrl(pkg.images[0]) : placeholderImage(pkg.slug, 640, 400)}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-forest-800/85 px-2.5 py-1 text-[11px] font-semibold text-cream-50">
          {pkg.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
          {pkg.durationDays} {t("days")}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-forest-900">{pkg.title}</h3>

        <ul className="mt-3 space-y-1 text-sm text-forest-700">
          {pkg.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 text-orange-500">●</span>
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          <span className="font-display text-lg font-bold text-forest-900">
            PKR {pkg.estimatedPricePKR.min.toLocaleString()}–{pkg.estimatedPricePKR.max.toLocaleString()}
          </span>
        </div>
        <div className="mt-1">
          <EstimatedBadge lastUpdated={pkg.lastUpdated} />
        </div>

        <Link
          href={`/packages/${pkg.slug}`}
          className="mt-4 block rounded-full bg-forest-700 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-forest-800"
        >
          {t("viewItinerary")}
        </Link>
      </div>
    </article>
  );
}
