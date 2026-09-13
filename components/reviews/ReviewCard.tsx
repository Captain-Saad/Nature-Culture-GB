import Image from "next/image";
import { Review } from "@/lib/types";
import StarRating from "@/components/shared/StarRating";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col rounded-card bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        {review.photo ? (
          <div className="relative h-11 w-11 overflow-hidden rounded-full">
            <Image src={review.photo} alt={review.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-100 font-display font-bold text-forest-700">
            {review.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-forest-900">{review.name}</p>
          <StarRating rating={review.rating} />
        </div>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-forest-700">&ldquo;{review.text}&rdquo;</p>
      <div className="mt-4 flex items-center justify-between text-xs text-forest-500">
        {review.relatedTo && <span>{review.relatedTo}</span>}
        <span>{new Date(review.date).toLocaleDateString()}</span>
      </div>
    </article>
  );
}
