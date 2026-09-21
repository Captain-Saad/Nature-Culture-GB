"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTripCart } from "@/lib/tripCart/TripCartContext";
import { estimateTotal } from "@/lib/tripCart/estimateTotal";
import { submitTripRequest } from "@/lib/tripCart/submitTripRequest";
import { PHONE_NUMBERS, WHATSAPP_NUMBER } from "@/lib/businessContact";
import CartGroupedList from "./CartGroupedList";
import GlareHover from "@/components/shared/GlareHover";

type Status = "idle" | "submitting" | "success" | "error";

function EmptyState() {
  const t = useTranslations("checkout");
  return (
    <div className="container-content flex flex-col items-center py-24 text-center">
      <p className="font-display text-2xl font-bold text-forest-900">{t("emptyTitle")}</p>
      <p className="mt-2 max-w-sm text-forest-600">{t("emptyBody")}</p>
      <Link
        href="/destinations"
        className="mt-6 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600"
      >
        {t("browseDestinations")}
      </Link>
    </div>
  );
}

function ConfirmationScreen({ contact }: { contact: string }) {
  const t = useTranslations("checkout");
  const tBooking = useTranslations("booking");
  return (
    <div className="container-content flex flex-col items-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-700">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="mt-5 font-display text-2xl font-bold text-forest-900">{t("confirmTitle")}</p>
      <p className="mt-2 max-w-md text-forest-600">{t("confirmBody", { contact })}</p>

      <div className="mt-8 w-full max-w-xs rounded-card bg-white p-5 shadow-card">
        <p className="text-sm font-semibold text-forest-800">{t("confirmCallToAction")}</p>
        <div className="mt-3 space-y-1.5">
          {PHONE_NUMBERS.map((num) => (
            <p key={num} className="font-display text-lg font-bold text-forest-900">
              {num}
            </p>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={`tel:${PHONE_NUMBERS[0].replace(/\s/g, "")}`}
            className="rounded-full bg-forest-700 px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-forest-800"
          >
            {tBooking("callAction")}
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-forest-700 px-5 py-2.5 text-center text-sm font-bold text-forest-700 transition-colors hover:bg-forest-50"
          >
            {tBooking("whatsappAction")}
          </a>
        </div>
      </div>

      <Link href="/" className="mt-8 text-sm font-bold text-forest-700 hover:text-orange-600">
        {t("backHome")}
      </Link>
    </div>
  );
}

export default function MyTripClient() {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const { items, clear, hydrated } = useTripCart();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDates, setPreferredDates] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmedContact, setConfirmedContact] = useState("");

  const total = estimateTotal(items);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const result = await submitTripRequest({
      name,
      contact,
      email: email.trim() || undefined,
      preferredDates: preferredDates.trim() || undefined,
      travelers,
      notes: notes.trim() || undefined,
      cartItems: items,
    });

    if (result.ok) {
      setConfirmedContact(contact);
      clear();
      setStatus("success");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return <ConfirmationScreen contact={confirmedContact} />;
  }

  // Cart is localStorage-backed and reads it after mount (see
  // TripCartContext) -- without this, a visitor with a full cart briefly
  // sees the empty state before it loads.
  if (!hydrated) {
    return null;
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container-content py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900 sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("pageSubtitle")}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <CartGroupedList size="lg" />
        </div>

        <div className="space-y-6">
          {total.hasAny && (
            <div className="rounded-card bg-white p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="badge-estimated">{tc("estimated")}</span>
                <span className="text-sm font-semibold text-forest-800">{t("estimatedTotal")}</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-forest-900">
                {tc("currency")} {total.min.toLocaleString()}
                {total.max !== total.min && `–${total.max.toLocaleString()}`}
              </p>
              <p className="mt-1 text-xs text-forest-500">{t("totalDisclaimer")}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="rounded-card bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-forest-900">{t("formTitle")}</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="trip-name" className="text-sm font-semibold text-forest-800">
                  {t("name")}
                </label>
                <input
                  id="trip-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label htmlFor="trip-contact" className="text-sm font-semibold text-forest-800">
                  {t("contact")}
                </label>
                <input
                  id="trip-contact"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label htmlFor="trip-email" className="text-sm font-semibold text-forest-800">
                  {t("email")}
                </label>
                <input
                  id="trip-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="trip-dates" className="text-sm font-semibold text-forest-800">
                    {t("preferredDates")}
                  </label>
                  <input
                    id="trip-dates"
                    placeholder="e.g. Oct 10–15"
                    value={preferredDates}
                    onChange={(e) => setPreferredDates(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                  />
                </div>
                <div>
                  <label htmlFor="trip-travelers" className="text-sm font-semibold text-forest-800">
                    {t("travelers")}
                  </label>
                  <input
                    id="trip-travelers"
                    type="number"
                    min={1}
                    max={50}
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                    className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="trip-notes" className="text-sm font-semibold text-forest-800">
                  {t("notes")}
                </label>
                <textarea
                  id="trip-notes"
                  rows={3}
                  placeholder={t("notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
                />
              </div>
            </div>

            {status === "error" && error && (
              <p role="alert" className="mt-4 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
                {error}
              </p>
            )}

            <GlareHover className="mt-5 block rounded-full">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-orange-600 disabled:opacity-60"
              >
                {status === "submitting" ? t("submitting") : t("submit")}
              </button>
            </GlareHover>
          </form>
        </div>
      </div>
    </div>
  );
}
