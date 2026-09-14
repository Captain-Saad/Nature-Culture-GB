"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ReviewForm() {
  const t = useTranslations("reviews.form");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Phase 5 (backend) will POST this to the reviews API.
    console.log("Review submission (client-side only):", {
      name: formData.get("name"),
      rating,
      text: formData.get("text"),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-card bg-forest-50 p-6 text-center">
        <p className="font-semibold text-forest-800">Thank you for sharing your experience!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-card">
      <h3 className="font-display text-lg font-bold text-forest-900">{t("title")}</h3>

      <div className="mt-4">
        <label className="text-sm font-semibold text-forest-800" htmlFor="review-name">
          {t("name")}
        </label>
        <input
          id="review-name"
          name="name"
          required
          type="text"
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-forest-800">{t("rating")}</label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} stars`}
              className="text-2xl"
            >
              <span className={star <= rating ? "text-orange-500" : "text-cream-400"}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-forest-800" htmlFor="review-text">
          {t("text")}
        </label>
        <textarea
          id="review-text"
          name="text"
          required
          rows={4}
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>

      <button
        type="submit"
        className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
      >
        {t("submit")}
      </button>
    </form>
  );
}
