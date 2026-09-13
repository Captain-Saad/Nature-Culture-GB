import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TiltedCard from "@/components/shared/TiltedCard";
import { Destination } from "@/lib/types";

export default function DestinationCard({ destination }: { destination: Destination }) {
  const t = useTranslations("common");

  return (
    <Link href={`/destinations/${destination.slug}`} className="block">
      <TiltedCard
        imageSrc={destination.images[0]}
        altText={destination.name}
        overlay={
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
              {destination.region}
            </p>
            <h3 className="font-display text-xl font-bold">{destination.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-cream-100/90">
              {destination.shortDescription}
            </p>
            <span className="mt-2 inline-block text-xs font-semibold text-orange-300">
              {t("viewDetails")} →
            </span>
          </div>
        }
      />
    </Link>
  );
}
