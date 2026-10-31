import { createHash, randomUUID } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { z } from "zod";
import { getPool, json, rows } from "./db";
import { candidateSubmissionSchema, type VacancyInput } from "./domain";
import { AtsError, digest } from "./http";
import { type CheckedUpload, storeUpload } from "./storage";
export function reference(prefix: string) {
  return `${prefix}-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}
export async function audit(
  connection: PoolConnection,
  actor: string | null,
  action: string,
  id: string | null,
  metadata: Record<string, unknown> = {},
) {
  await connection.execute(
    "INSERT INTO ats_activity(id,actor_id,action,record_id,metadata) VALUES(?,?,?,?,?)",
    [randomUUID(), actor, action, id, JSON.stringify(metadata)],
  );
}
export async function saveApplication(
  raw: unknown,
  jobId: string | null,
  idempotencyKey: string,
  files: CheckedUpload[],
) {
  const candidate = candidateSubmissionSchema.parse(raw);
  z.uuid().parse(idempotencyKey);
  if (jobId) z.uuid().parse(jobId);
  if (
    files.filter((file) => file.kind === "cv").length !== 1 ||
    files.length > 3
  )
    throw new AtsError(422, "Include one CV and up to two certificates.");
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        candidate,
        jobId,
        files: files.map((file) => ({
          kind: file.kind,
          hash: file.sha256,
          name: file.originalName,
        })),
      }),
    )
    .digest("hex");
  const connection = await getPool().getConnection();
  const locks = [
    `identity:email:${candidate.email}`,
    `identity:phone:${candidate.phone}`,
    `idempotency:${idempotencyKey}`,
  ]
    .map(digest)
    .sort();
  const acquired: string[] = [];
  try {
    for (const lock of locks) {
      const [result] = await rows<{ acquired: number }>(
        "SELECT GET_LOCK(?,10) AS acquired",
        [lock],
        connection,
      );
      if (result.acquired !== 1)
        throw new AtsError(
          409,
          "Another request is processing. Please try again.",
        );
      acquired.push(lock);
    }
    await connection.beginTransaction();
    const [previous] = await rows<{ reference: string; request_hash: string }>(
      "SELECT reference,request_hash FROM ats_applications WHERE idempotency_key=?",
      [idempotencyKey],
      connection,
    );
    if (previous) {
      if (previous.request_hash !== hash)
        throw new AtsError(
          409,
          "This submission reference was already used for different details. Reload the form.",
        );
      await connection.commit();
      return { reference: previous.reference, duplicate: true };
    }
    let job: VacancyInput | null = null;
    let category: string | null = null;
    let clientId: string | null = null;
    if (jobId) {
      const [record] = await rows<{
        data: unknown;
        category: string;
        client_id: string | null;
      }>(
        "SELECT data,category,client_id FROM ats_jobs WHERE id=? AND status='published' AND employer_confirmed=TRUE AND closing_date>=UTC_DATE() FOR UPDATE",
        [jobId],
        connection,
      );
      if (!record)
        throw new AtsError(
          409,
          "This vacancy is no longer accepting applications. You can send a general CV instead.",
        );
      job = json<VacancyInput>(record.data);
      category = record.category;
      clientId = record.client_id;
    }
    const role = job?.title || candidate.preferredRole;
    if (role && /\bdriver\b/i.test(role) && !candidate.licenceCategory)
      throw new AtsError(
        422,
        "Include your driving licence category for a driving role.",
      );
    if (!role)
      throw new AtsError(
        422,
        "Include your preferred role for future opportunities.",
      );
    const id = randomUUID(),
      candidateId = randomUUID(),
      appReference = reference("APP");
    const matches = await rows<{ id: string; email: string; phone: string }>(
      "SELECT id,email,phone FROM ats_candidates WHERE merged_into IS NULL AND (email=? OR phone=?)",
      [candidate.email, candidate.phone],
      connection,
    );
    const retention = Math.min(
      3650,
      Math.max(30, Number(process.env.ATS_RETENTION_DAYS) || 365),
    );
    await connection.execute(
      "INSERT INTO ats_candidates(id,reference,full_name,email,phone,profile,review_after) VALUES(?,?,?,?,?,?,DATE_ADD(UTC_DATE(),INTERVAL ? DAY))",
      [
        candidateId,
        reference("CAN"),
        candidate.fullName,
        candidate.email,
        candidate.phone,
        JSON.stringify(candidate),
        retention,
      ],
    );
    await connection.execute(
      "INSERT INTO ats_applications(id,reference,candidate_id,job_id,candidate_snapshot,job_snapshot,category,client_id,applied_role,country,emirate,experience,availability,consent_version,consent_at,idempotency_key,request_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP(3),?,?)",
      [
        id,
        appReference,
        candidateId,
        jobId,
        JSON.stringify(candidate),
        job ? JSON.stringify(job) : null,
        category,
        clientId,
        role,
        candidate.country,
        candidate.emirate ?? null,
        candidate.totalExperienceYears,
        candidate.availability,
        candidate.consentVersion,
        idempotencyKey,
        hash,
      ],
    );
    for (const match of matches)
      await connection.execute(
        "INSERT INTO ats_duplicate_matches(id,candidate_id,possible_candidate_id,evidence) VALUES(?,?,?,?)",
        [
          randomUUID(),
          candidateId,
          match.id,
          match.email === candidate.email && match.phone === candidate.phone
            ? "email+phone"
            : match.email === candidate.email
              ? "email"
              : "phone",
        ],
      );
    for (const file of files) {
      await storeUpload(file);
      await connection.execute(
        "INSERT INTO ats_documents(id,application_id,storage_key,original_name,mime,size_bytes,sha256,kind) VALUES(?,?,?,?,?,?,?,?)",
        [
          file.id,
          id,
          file.storageKey,
          file.originalName,
          file.mime,
          file.size,
          file.sha256,
          file.kind,
        ],
      );
    }
    await connection.execute(
      "INSERT INTO ats_stage_history(id,application_id,new_stage) VALUES(?,?,'New')",
      [randomUUID(), id],
    );
    for (const kind of ["candidate_receipt", "hr_new_application"]) {
      const payload = {
        kind,
        applicationId: id,
        reference: appReference,
        candidateName: candidate.fullName,
        candidateEmail: candidate.email,
        jobTitle: job?.title ?? `Future opportunities: ${role}`,
      };
      await connection.execute(
        "INSERT INTO ats_outbox(id,application_id,delivery_key,payload) VALUES(?,?,?,?)",
        [randomUUID(), id, `${kind}:${id}`, JSON.stringify(payload)],
      );
    }
    await audit(connection, null, "application_received", id, {
      documents: files.length,
    });
    await connection.commit();
    return { reference: appReference, duplicate: false };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    for (const lock of acquired)
      await connection.execute("SELECT RELEASE_LOCK(?)", [lock]);
    connection.release();
  }
}
