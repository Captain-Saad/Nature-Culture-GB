import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getReviews } from "@/lib/api";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import StarRating from "@/components/shared/StarRating";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Reviews",
    description: "Read what travelers say about their trips with Nature & Culture GB.",
  };
}

export default async function ReviewsPage() {
  const t = await getTranslations("reviews");
  const reviews = await getReviews();
  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>

        {reviews.length > 0 && (
          <div className="mt-5 flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-bold text-forest-900">{average.toFixed(1)}</span>
            <StarRating rating={Math.round(average)} />
            <span className="text-sm text-forest-500">{t("basedOn", { count: reviews.length })}</span>
          </div>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5 sm:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>

        <div>
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
