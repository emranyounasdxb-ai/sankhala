import { atsEnabled, json, rows } from "./db";
import type { VacancyInput } from "./domain";
export type PublishedJob = { id: string; reference: string; job: VacancyInput };
export async function publishedJobs(): Promise<PublishedJob[]> {
  if (!atsEnabled()) return [];
  const records = await rows<{ id: string; reference: string; data: unknown }>(
    "SELECT id,reference,data FROM ats_jobs WHERE status='published' AND employer_confirmed=TRUE AND closing_date>=UTC_DATE() ORDER BY created_at DESC LIMIT 200",
  );
  return records.map((record) => ({
    id: record.id,
    reference: record.reference,
    job: json<VacancyInput>(record.data),
  }));
}
export async function publishedJob(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id) || !atsEnabled()) return null;
  const [record] = await rows<{ id: string; reference: string; data: unknown }>(
    "SELECT id,reference,data FROM ats_jobs WHERE id=? AND status='published' AND employer_confirmed=TRUE AND closing_date>=UTC_DATE()",
    [id],
  );
  return record
    ? {
        id: record.id,
        reference: record.reference,
        job: json<VacancyInput>(record.data),
      }
    : null;
}
