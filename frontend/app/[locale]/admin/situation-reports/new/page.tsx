import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import SituationReportForm from "@/components/admin/situation/SituationReportForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · New Travel Update", robots: { index: false, follow: false } };
}

export default async function AdminNewSituationReportPage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell title="New Travel Update" userEmail={user.email}>
      <SituationReportForm mode="create" adminEmail={user.email} />
    </AdminShell>
  );
}
