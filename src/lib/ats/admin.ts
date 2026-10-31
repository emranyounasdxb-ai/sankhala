import { randomUUID } from "node:crypto";
import { z } from "zod";
import { json, rows, type SqlConnection, transaction } from "./db";
import { type CandidateSubmission, stageSchema, vacancySchema } from "./domain";
import { AtsError } from "./http";
import { type AtsAction, mayAccess, type StaffIdentity } from "./permissions";
import { audit, reference } from "./submission";

export function adminOnly(staff: StaffIdentity) {
  if (staff.role !== "admin")
    throw new AtsError(403, "Administrator access is required.");
}
export function scopeWhere(staff: StaffIdentity, alias = "a") {
  return staff.role === "admin"
    ? { sql: "1=1", values: [] as string[] }
    : {
        sql: `(${alias}.assigned_recruiter_id=? OR EXISTS(SELECT 1 FROM ats_job_staff js WHERE js.job_id=${alias}.job_id AND js.staff_id=?))`,
        values: [staff.id, staff.id],
      };
}
export async function scopedApplication(
  staff: StaffIdentity,
  id: string,
  action: AtsAction,
  connection: SqlConnection,
  lock = false,
) {
  z.uuid().parse(id);
  const [record] = await rows<
    Record<string, unknown> & {
      id: string;
      candidate_id: string;
      job_id: string | null;
      assigned_recruiter_id: string | null;
      version: number;
      stage: string;
    }
  >(
    `SELECT a.* FROM ats_applications a WHERE a.id=?${lock ? " FOR UPDATE" : ""}`,
    [id],
    connection,
  );
  if (!record) throw new AtsError(404, "Application not found.");
  const assigned = record.job_id
    ? await rows<{ staff_id: string }>(
        "SELECT staff_id FROM ats_job_staff WHERE job_id=?",
        [record.job_id],
        connection,
      )
    : [];
  if (
    !mayAccess(staff, action, {
      assignedRecruiterId: record.assigned_recruiter_id,
      assignedStaffIds: assigned.map((row) => row.staff_id),
    })
  )
    throw new AtsError(
      403,
      "This application is outside your assigned access.",
    );
  return record;
}
export async function applicationList(
  staff: StaffIdentity,
  query: URLSearchParams,
) {
  const scope = scopeWhere(staff);
  const where = [scope.sql];
  const values: (string | number)[] = [...scope.values];
  for (const [key, column] of Object.entries({
    stage: "a.stage",
    job: "a.job_id",
    candidate: "a.candidate_id",
    client: "a.client_id",
    category: "a.category",
    country: "a.country",
    emirate: "a.emirate",
    availability: "a.availability",
    recruiter: "a.assigned_recruiter_id",
  })) {
    const value = query.get(key);
    if (value) {
      where.push(`${column}=?`);
      values.push(value.slice(0, 160));
    }
  }
  const search = query.get("q")?.trim().slice(0, 160);
  if (search) {
    where.push(
      "(c.full_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR a.reference LIKE ? OR a.applied_role LIKE ?)",
    );
    values.push(...Array(5).fill(`%${search}%`));
  }
  const band = query.get("experience");
  if (band === "fresher") where.push("a.experience=0");
  if (band === "1-2") where.push("a.experience>0 AND a.experience<=2");
  if (band === "3-5") where.push("a.experience>2 AND a.experience<=5");
  if (band === "5+") where.push("a.experience>5");
  for (const [key, operator] of [
    ["from", ">="],
    ["to", "<="],
  ] as const) {
    const value = query.get(key);
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      where.push(`DATE(a.created_at)${operator}?`);
      values.push(value);
    }
  }
  if (query.get("unread") === "true") where.push("a.read_at IS NULL");
  if (query.get("pool") === "true") where.push("c.talent_pool=TRUE");
  const page = Math.max(1, Math.min(10000, Number(query.get("page")) || 1));
  const limit = 50;
  const from = `FROM ats_applications a JOIN ats_candidates c ON c.id=a.candidate_id LEFT JOIN ats_clients cl ON cl.id=a.client_id WHERE ${where.join(" AND ")}`;
  const [count] = await rows<{ total: number }>(
    `SELECT COUNT(*) total ${from}`,
    values,
  );
  const records = await rows(
    `SELECT a.id,a.reference,a.candidate_id,a.job_id,a.applied_role,a.category,a.country,a.emirate,a.experience,a.availability,a.stage,a.read_at,a.version,a.assigned_recruiter_id,a.created_at,c.full_name,c.email,c.phone,c.talent_pool,cl.name client_name ${from} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    values,
  );
  return { records, total: Number(count.total), page, limit };
}
export async function applicationDetail(staff: StaffIdentity, id: string) {
  return transaction(async (connection) => {
    const record = await scopedApplication(staff, id, "view", connection);
    await connection.execute(
      "UPDATE ats_applications SET read_at=COALESCE(read_at,UTC_TIMESTAMP(3)) WHERE id=?",
      [id],
    );
    await audit(connection, staff.id, "application_view", id);
    const [candidate] = await rows<{
      id: string;
      reference: string;
      full_name: string;
      email: string;
      phone: string;
      talent_pool: number;
      review_after: string;
    }>(
      "SELECT id,reference,full_name,email,phone,talent_pool,review_after FROM ats_candidates WHERE id=?",
      [record.candidate_id],
      connection,
    );
    const scope = scopeWhere(staff);
    const history = await rows(
      `SELECT a.id,a.reference,a.applied_role,a.stage,a.created_at FROM ats_applications a WHERE a.candidate_id=? AND ${scope.sql} ORDER BY a.created_at DESC`,
      [record.candidate_id, ...scope.values],
      connection,
    );
    const documents = await rows(
      "SELECT id,original_name,mime,size_bytes,kind,scan_status FROM ats_documents WHERE application_id=?",
      [id],
      connection,
    );
    const stages = await rows(
      "SELECT h.*,u.name actor_name FROM ats_stage_history h LEFT JOIN auth_user u ON u.id=h.actor_id WHERE h.application_id=? ORDER BY h.created_at",
      [id],
      connection,
    );
    const notes = await rows(
      "SELECT n.*,u.name actor_name FROM ats_notes n JOIN auth_user u ON u.id=n.actor_id WHERE n.application_id=? ORDER BY n.created_at DESC",
      [id],
      connection,
    );
    const interviews = await rows(
      "SELECT i.*,u.name staff_name FROM ats_interviews i JOIN auth_user u ON u.id=i.staff_id WHERE i.application_id=? ORDER BY i.starts_at",
      [id],
      connection,
    );
    const duplicates =
      staff.role === "admin"
        ? await rows(
            "SELECT d.id,d.evidence,d.possible_candidate_id,c.reference,c.full_name,c.email,c.phone FROM ats_duplicate_matches d JOIN ats_candidates c ON c.id=d.possible_candidate_id WHERE d.candidate_id=? AND d.resolution='pending'",
            [record.candidate_id],
            connection,
          )
        : [];
    return {
      record: {
        ...record,
        candidate_snapshot: json<CandidateSubmission>(
          record.candidate_snapshot,
        ),
        job_snapshot: record.job_snapshot ? json(record.job_snapshot) : null,
      },
      candidate,
      history,
      documents,
      stages,
      notes,
      interviews,
      duplicates,
    };
  });
}
export async function mutateApplication(
  staff: StaffIdentity,
  id: string,
  input: unknown,
) {
  const value = z
    .discriminatedUnion("action", [
      z
        .object({
          action: z.literal("stage"),
          stage: stageSchema,
          version: z.number().int().positive(),
        })
        .strict(),
      z
        .object({
          action: z.literal("note"),
          body: z.string().trim().min(1).max(5000),
        })
        .strict(),
      z
        .object({
          action: z.literal("assign"),
          recruiterId: z.string().max(128).nullable(),
          version: z.number().int().positive(),
        })
        .strict(),
      z.object({ action: z.literal("pool"), enabled: z.boolean() }).strict(),
      z
        .object({
          action: z.literal("interview"),
          staffId: z.string().max(128),
          startsAt: z.iso.datetime(),
          endsAt: z.iso.datetime(),
          timezone: z.string().min(1).max(100),
          location: z.string().trim().min(1).max(500),
          notes: z.string().max(3000),
        })
        .strict(),
    ])
    .parse(input);
  return transaction(async (connection) => {
    const record = await scopedApplication(
      staff,
      id,
      value.action === "stage"
        ? "stage"
        : value.action === "note"
          ? "note"
          : value.action === "interview"
            ? "interview"
            : "view",
      connection,
      true,
    );
    if (value.action === "stage") {
      if (value.version !== record.version)
        throw new AtsError(
          409,
          "This record changed. Refresh it before updating.",
        );
      if (record.stage !== value.stage) {
        await connection.execute(
          "UPDATE ats_applications SET stage=?,version=version+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",
          [value.stage, id],
        );
        await connection.execute(
          "INSERT INTO ats_stage_history(id,application_id,actor_id,old_stage,new_stage) VALUES(?,?,?,?,?)",
          [randomUUID(), id, staff.id, record.stage, value.stage],
        );
        await audit(connection, staff.id, "stage_change", id, {
          from: record.stage,
          to: value.stage,
        });
      }
    } else if (value.action === "note") {
      await connection.execute(
        "INSERT INTO ats_notes(id,application_id,actor_id,body) VALUES(?,?,?,?)",
        [randomUUID(), id, staff.id, value.body],
      );
      await audit(connection, staff.id, "note_added", id);
    } else if (value.action === "assign") {
      adminOnly(staff);
      if (value.version !== record.version)
        throw new AtsError(
          409,
          "This record changed. Refresh before assigning it.",
        );
      if (value.recruiterId) {
        const [user] = await rows(
          "SELECT id FROM auth_user WHERE id=? AND active=TRUE AND role IN ('admin','recruiter')",
          [value.recruiterId],
          connection,
        );
        if (!user) throw new AtsError(422, "Choose an active recruiter.");
      }
      await connection.execute(
        "UPDATE ats_applications SET assigned_recruiter_id=?,version=version+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",
        [value.recruiterId, id],
      );
      await audit(connection, staff.id, "recruiter_assignment", id, {
        staffId: value.recruiterId,
      });
    } else if (value.action === "pool") {
      if (staff.role === "hiring_manager")
        throw new AtsError(
          403,
          "A recruiter or administrator must manage the Talent Pool.",
        );
      await connection.execute(
        "UPDATE ats_candidates SET talent_pool=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?",
        [value.enabled, record.candidate_id],
      );
      await audit(connection, staff.id, "talent_pool", record.candidate_id, {
        enabled: value.enabled,
      });
    } else {
      const start = new Date(value.startsAt),
        end = new Date(value.endsAt);
      try {
        new Intl.DateTimeFormat("en", { timeZone: value.timezone }).format(
          start,
        );
      } catch {
        throw new AtsError(422, "Choose a valid interview timezone.");
      }
      if (
        start <= new Date() ||
        end <= start ||
        end.getTime() - start.getTime() > 8 * 3600000
      )
        throw new AtsError(
          422,
          "Choose a future interview lasting up to eight hours.",
        );
      const [user] = await rows<{ id: string; role: StaffIdentity["role"] }>(
        "SELECT id,role FROM auth_user WHERE id=? AND active=TRUE FOR UPDATE",
        [value.staffId],
        connection,
      );
      if (!user) throw new AtsError(422, "Choose an active staff member.");
      await scopedApplication(
        { id: value.staffId, role: user.role, active: true },
        id,
        "view",
        connection,
      );
      const overlap = await rows(
        "SELECT id FROM ats_interviews WHERE staff_id=? AND status='Scheduled' AND starts_at<? AND ends_at>?",
        [value.staffId, end, start],
        connection,
      );
      if (overlap.length)
        throw new AtsError(
          409,
          "That staff member already has an interview at this time.",
        );
      await connection.execute(
        "INSERT INTO ats_interviews(id,application_id,staff_id,starts_at,ends_at,timezone,location,notes) VALUES(?,?,?,?,?,?,?,?)",
        [
          randomUUID(),
          id,
          value.staffId,
          start,
          end,
          value.timezone,
          value.location,
          value.notes,
        ],
      );
      await audit(connection, staff.id, "interview_scheduled", id, {
        staffId: value.staffId,
      });
    }
    return { saved: true };
  });
}
export async function saveVacancy(staff: StaffIdentity, input: unknown) {
  adminOnly(staff);
  const envelope = z
    .object({
      id: z.uuid().optional(),
      version: z.number().int().positive().optional(),
      job: vacancySchema,
      staffIds: z.array(z.string().max(128)).max(100).default([]),
    })
    .strict()
    .parse(input);
  const value = envelope.job;
  if (
    value.status === "published" &&
    value.closingDate < new Date().toISOString().slice(0, 10)
  )
    throw new AtsError(
      422,
      "The closing date has passed. Choose a future date before publishing.",
    );
  return transaction(async (connection) => {
    if (value.clientId) {
      const [client] = await rows(
        "SELECT id FROM ats_clients WHERE id=? AND active=TRUE",
        [value.clientId],
        connection,
      );
      if (!client) throw new AtsError(422, "Choose an active client company.");
    }
    for (const id of envelope.staffIds) {
      const [user] = await rows(
        "SELECT id FROM auth_user WHERE id=? AND active=TRUE",
        [id],
        connection,
      );
      if (!user) throw new AtsError(422, "Choose active staff for the job.");
    }
    const id = envelope.id ?? randomUUID();
    if (envelope.id) {
      const [job] = await rows<{ version: number }>(
        "SELECT version FROM ats_jobs WHERE id=? FOR UPDATE",
        [id],
        connection,
      );
      if (!job) throw new AtsError(404, "Job not found.");
      if (job.version !== envelope.version)
        throw new AtsError(409, "This job changed. Reload before saving.");
      await connection.execute(
        "UPDATE ats_jobs SET title=?,category=?,employer_kind=?,client_id=?,location=?,emirate=?,status=?,employer_confirmed=?,confirmed_by=?,closing_date=?,data=?,version=version+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",
        [
          value.title,
          value.category,
          value.employerKind,
          value.clientId,
          value.location,
          value.emirate,
          value.status,
          value.employerConfirmed,
          value.employerConfirmed ? staff.id : null,
          value.closingDate,
          JSON.stringify(value),
          id,
        ],
      );
    } else
      await connection.execute(
        "INSERT INTO ats_jobs(id,reference,title,category,employer_kind,client_id,location,emirate,status,employer_confirmed,confirmed_by,closing_date,data) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          id,
          reference("JOB"),
          value.title,
          value.category,
          value.employerKind,
          value.clientId,
          value.location,
          value.emirate,
          value.status,
          value.employerConfirmed,
          value.employerConfirmed ? staff.id : null,
          value.closingDate,
          JSON.stringify(value),
        ],
      );
    await connection.execute("DELETE FROM ats_job_staff WHERE job_id=?", [id]);
    for (const userId of new Set(envelope.staffIds))
      await connection.execute(
        "INSERT INTO ats_job_staff(job_id,staff_id) VALUES(?,?)",
        [id, userId],
      );
    await audit(connection, staff.id, "job_saved", id, {
      status: value.status,
    });
    return { id };
  });
}
export async function resolveDuplicate(staff: StaffIdentity, input: unknown) {
  adminOnly(staff);
  const value = z
    .object({
      matchId: z.uuid(),
      resolution: z.enum(["link", "different"]),
      verified: z.literal(true),
    })
    .strict()
    .parse(input);
  return transaction(async (connection) => {
    const [match] = await rows<{
      id: string;
      candidate_id: string;
      possible_candidate_id: string;
      resolution: string;
    }>(
      "SELECT * FROM ats_duplicate_matches WHERE id=? FOR UPDATE",
      [value.matchId],
      connection,
    );
    if (match?.resolution !== "pending")
      throw new AtsError(409, "This duplicate has already been reviewed.");
    if (value.resolution === "link") {
      const people = await rows<{ id: string; merged_into: string | null }>(
        "SELECT id,merged_into FROM ats_candidates WHERE id IN (?,?) ORDER BY id FOR UPDATE",
        [match.candidate_id, match.possible_candidate_id],
        connection,
      );
      if (people.some((person) => person.merged_into))
        throw new AtsError(
          409,
          "A candidate link changed. Refresh before reviewing it.",
        );
      await connection.execute(
        "UPDATE ats_applications SET candidate_id=? WHERE candidate_id=?",
        [match.possible_candidate_id, match.candidate_id],
      );
      await connection.execute(
        "UPDATE ats_candidates SET merged_into=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?",
        [match.possible_candidate_id, match.candidate_id],
      );
    }
    await connection.execute(
      "UPDATE ats_duplicate_matches SET resolution=?,resolved_by=?,resolved_at=UTC_TIMESTAMP(3) WHERE id=?",
      [value.resolution, staff.id, match.id],
    );
    await audit(connection, staff.id, "duplicate_review", match.candidate_id, {
      target: match.possible_candidate_id,
      resolution: value.resolution,
    });
    return { saved: true };
  });
}
