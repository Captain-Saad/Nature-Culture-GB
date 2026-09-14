"use client";

import { useRef } from "react";
import { Review } from "@/lib/types";
import ReviewCard from "./ReviewCard";

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <div key={review.id} className="w-[300px] shrink-0 sm:w-[340px]">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous reviews"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-forest-700 text-forest-700 hover:bg-forest-50"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next reviews"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-forest-700 text-forest-700 hover:bg-forest-50"
        >
          ›
        </button>
      </div>
    </div>
  );
}
