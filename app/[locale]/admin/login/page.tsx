import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Admin Login",
    description: "Staff access to Nature & Culture GB admin tools.",
    robots: { index: false, follow: false },
  };
}

export default async function AdminLoginPage() {
  const t = await getTranslations("admin");

  return (
    <div className="container-content py-16">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-forest-900">{t("loginTitle")}</h1>
        <p className="mt-2 text-forest-600">{t("loginSubtitle")}</p>
      </header>

      <AdminLoginForm />
    </div>
  );
}
