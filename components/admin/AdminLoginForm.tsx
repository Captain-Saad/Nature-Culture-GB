"use client";

import { useTranslations } from "next-intl";

/**
 * UI PLACEHOLDER ONLY — no authentication is wired up yet.
 * Submitting this form does nothing beyond preventing the default
 * page reload. Real auth arrives with the backend phases.
 */
export default function AdminLoginForm() {
  const t = useTranslations("admin");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-card">
        <div>
          <label htmlFor="admin-username" className="text-sm font-semibold text-forest-800">
            {t("username")}
          </label>
          <input
            id="admin-username"
            name="username"
            type="text"
            autoComplete="off"
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
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-cream-300 px-3 py-2.5 text-sm outline-none focus:border-forest-500"
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-forest-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-forest-800"
        >
          {t("signIn")}
        </button>
      </form>

      <p className="mt-4 rounded-lg border border-dashed border-cream-400 bg-cream-100 p-3 text-center text-xs text-forest-500">
        {t("placeholderNotice")}
      </p>
    </div>
  );
}
