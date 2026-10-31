export type AdminUser = {
  id: string;
  name: string;
  email?: string;
  role: "admin" | "recruiter" | "hiring_manager";
  active: number | boolean;
};
export type AdminOptions = {
  staff: { id: string; role: AdminUser["role"]; active: boolean };
  users: AdminUser[];
  clients: { id: string; name: string; active?: number }[];
  jobs: { id: string; reference: string; title: string; status: string }[];
};
export type AppSummary = {
  id: string;
  reference: string;
  candidate_id: string;
  job_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  applied_role: string;
  country: string;
  emirate: string | null;
  experience: number;
  availability: string;
  stage: string;
  version: number;
  read_at: string | null;
  created_at: string;
  assigned_recruiter_id: string | null;
  talent_pool: number;
  client_name: string | null;
};
export async function adminApi<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/ats/admin/${path}`, {
    cache: "no-store",
    ...(body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  if (response.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Your session ended. Please sign in again.");
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "This request could not be completed.");
  return data as T;
}
export function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(new Date(value));
}
