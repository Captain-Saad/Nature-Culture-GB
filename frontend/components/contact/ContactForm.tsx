"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { postToApi } from "@/lib/postToApi";

/** Posts to the backend's POST /contact, which stores the message for /admin/leads and emails a notification. */
export default function ContactForm() {
  const t = useTranslations("contact.form");
  const tc = useTranslations("common");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const subject = String(formData.get("subject") ?? "").trim();

    setError(null);
    setSending(true);
    const result = await postToApi("/contact", {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: subject || undefined,
      message: formData.get("message"),
    });
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-card bg-forest-50 p-6 text-center">
        <p className="font-semibold text-forest-800">{t("success")}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-semibold text-orange-600 underline-offset-2 hover:underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card bg-white p-6 shadow-card">
      {error && (
        <p role="alert" className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="contact-name" className="text-sm font-semibold text-forest-800">
          {t("name")}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          maxLength={200}
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
          maxLength={300}
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
          maxLength={5000}
          rows={5}
          className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
      >
        {sending ? tc("sending") : t("submit")}
      </button>
    </form>
  );
}
