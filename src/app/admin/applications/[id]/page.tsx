import { notFound } from "next/navigation";
import { AdminShell } from "@/components/ats/admin-shell";
import { ApplicationDetail } from "@/components/ats/application-detail";
import { requireStaff } from "@/lib/ats/auth";
export const dynamic = "force-dynamic";
export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) notFound();
  return (
    <AdminShell staff={staff} current="applications">
      <ApplicationDetail key={id} id={id} />
    </AdminShell>
  );
}
