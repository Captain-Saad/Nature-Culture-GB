import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { adminFetch } from "@/lib/admin/api";
import AdminShell from "@/components/admin/AdminShell";
import SituationReportForm from "@/components/admin/situation/SituationReportForm";
import type { AdminSituationReport } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Admin · Edit Travel Update", robots: { index: false, follow: false } };
}

export default async function AdminEditSituationReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();

  const report = await adminFetch<AdminSituationReport>(`/admin/situation-reports/${id}`, token);
  if (!report) notFound();

  return (
    <AdminShell title={`Edit: ${report.title}`} userEmail={user.email}>
      <SituationReportForm mode="edit" initial={report} adminEmail={user.email} />
    </AdminShell>
  );
}
