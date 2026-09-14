"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function AdminLoginForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(res.status === 401 ? t("invalidCredentials") : t("loginError"));
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(t("loginError"));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-card">
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800"
          >
            {error}
          </p>
        )}

        <div>
          <label htmlFor="admin-email" className="text-sm font-semibold text-forest-800">
            {t("email")}
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="admin-password" className="text-sm font-semibold text-forest-800">
            {t("password")}
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-forest-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
}
