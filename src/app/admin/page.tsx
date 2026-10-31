import { AdminShell } from "@/components/ats/admin-shell";
import { AdminWorkspace } from "@/components/ats/admin-workspace";
import { requireStaff } from "@/lib/ats/auth";
export const dynamic = "force-dynamic";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const staff = await requireStaff();
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "overview";
  const allowed = [
    "overview",
    "applications",
    "candidates",
    "account",
    ...(staff.role === "admin"
      ? ["jobs", "clients", "team", "activity", "retention"]
      : []),
  ];
  const current = allowed.includes(tab) ? tab : "applications";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (key !== "tab" && typeof value === "string") query.set(key, value);
  return (
    <AdminShell staff={staff} current={current}>
      <AdminWorkspace
        key={`${current}:${query}`}
        tab={current}
        query={query.toString()}
      />
    </AdminShell>
  );
}
