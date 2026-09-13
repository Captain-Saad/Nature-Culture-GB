"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Phase 4 (backend) will POST this to the contact API.
    console.log("Contact form submission (client-side only):", {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-card bg-forest-50 p-6 text-center">
        <p className="font-semibold text-forest-800">Thanks — we&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white p-6 shadow-card">
      <div>
        <label htmlFor="contact-name" className="text-sm font-semibold text-forest-800">
          {t("name")}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          type="text"
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-semibold text-forest-800">
          {t("email")}
        </label>
        <input
          id="contact-email"
          name="email"
          required
          type="email"
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="text-sm font-semibold text-forest-800">
          {t("subject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold text-forest-800">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
      >
        {t("submit")}
      </button>
    </form>
  );
}
