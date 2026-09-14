import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AdminLogoutButton from "./AdminLogoutButton";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  userEmail: string;
  children: ReactNode;
  showBack?: boolean;
}

export default async function AdminShell({
  title,
  subtitle,
  userEmail,
  children,
  showBack = true,
}: AdminShellProps) {
  const t = await getTranslations("admin");

  return (
    <div className="container-content py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          {showBack && (
            <Link href="/admin" className="text-sm font-semibold text-orange-600 hover:underline">
              ← {t("backToDashboard")}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-forest-900">{title}</h1>
          {subtitle && <p className="mt-1 text-forest-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-forest-600 sm:inline">{t("loggedInAs", { email: userEmail })}</span>
          <AdminLogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
