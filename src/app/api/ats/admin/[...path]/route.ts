import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import {
  adminOnly,
  applicationDetail,
  applicationList,
  mutateApplication,
  resolveDuplicate,
  saveVacancy,
  scopedApplication,
  scopeWhere,
} from "@/lib/ats/admin";
import { currentStaff } from "@/lib/ats/auth";
import { json, rows, transaction } from "@/lib/ats/db";
import type { CandidateSubmission } from "@/lib/ats/domain";
import { exportCsv, exportXlsx } from "@/lib/ats/export";
import {
  AtsError,
  failure,
  limitedJson,
  requireBackend,
  sameOrigin,
} from "@/lib/ats/http";
import { documentPath } from "@/lib/ats/storage";
import { audit } from "@/lib/ats/submission";
export const runtime = "nodejs";
type Context = { params: Promise<{ path: string[] }> };
async function staffFor(request: Request) {
  requireBackend();
  const staff = await currentStaff(request.headers);
  if (!staff) throw new AtsError(401, "Sign in to access recruitment records.");
  return staff;
}
const reply = (data: unknown) =>
  Response.json(data, { headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request, context: Context) {
  try {
    const staff = await staffFor(request);
    const { path } = await context.params;
    const query = new URL(request.url).searchParams;
    if (path[0] === "applications" && path.length === 1)
      return reply(await applicationList(staff, query));
    if (path[0] === "applications" && path.length === 2)
      return reply(await applicationDetail(staff, path[1]));
    if (path[0] === "options") {
      const users = await rows(
        `SELECT id,name,role,active${staff.role === "admin" ? ",email" : ""} FROM auth_user ORDER BY name`,
      );
      const clients =
        staff.role === "admin"
          ? await rows("SELECT id,name,active FROM ats_clients ORDER BY name")
          : await rows(
              "SELECT DISTINCT c.id,c.name FROM ats_clients c JOIN ats_jobs j ON j.client_id=c.id JOIN ats_applications a ON a.job_id=j.id WHERE " +
                scopeWhere(staff).sql,
              scopeWhere(staff).values,
            );
      const jobScope =
        staff.role === "admin"
          ? { sql: "1=1", values: [] as string[] }
          : {
              sql: "(EXISTS(SELECT 1 FROM ats_job_staff js WHERE js.job_id=j.id AND js.staff_id=?) OR EXISTS(SELECT 1 FROM ats_applications a WHERE a.job_id=j.id AND a.assigned_recruiter_id=?))",
              values: [staff.id, staff.id],
            };
      const jobs = await rows(
        `SELECT j.id,j.reference,j.title,j.status FROM ats_jobs j WHERE ${jobScope.sql} ORDER BY j.created_at DESC`,
        jobScope.values,
      );
      return reply({ staff, users, clients, jobs });
    }
    if (path[0] === "stats") {
      const scope = scopeWhere(staff);
      const [counts] = await rows(
        `SELECT COUNT(*) total,COALESCE(SUM(a.read_at IS NULL),0) unread,COALESCE(SUM(a.stage='Hired'),0) hired FROM ats_applications a WHERE ${scope.sql}`,
        scope.values,
      );
      const stages = await rows(
        `SELECT a.stage,COUNT(*) count FROM ats_applications a WHERE ${scope.sql} GROUP BY a.stage`,
        scope.values,
      );
      const jobs = await rows(
        `SELECT a.job_id,a.applied_role title,COUNT(*) count FROM ats_applications a WHERE ${scope.sql} GROUP BY a.job_id,a.applied_role ORDER BY count DESC LIMIT 20`,
        scope.values,
      );
      const operational =
        staff.role === "admin"
          ? (
              await rows(
                "SELECT (SELECT COUNT(*) FROM ats_outbox WHERE status IN ('pending','processing','failed')) emails_pending,(SELECT COUNT(*) FROM ats_documents WHERE scan_status IN ('pending','error')) scans_pending,(SELECT COUNT(*) FROM ats_duplicate_matches WHERE resolution='pending') duplicates,(SELECT COUNT(*) FROM ats_retention WHERE status<>'Completed') retention_pending",
              )
            )[0]
          : null;
      return reply({ counts, stages, jobs, operational });
    }
    if (path[0] === "jobs") {
      adminOnly(staff);
      const jobs = await rows<{ id: string; data: unknown }>(
        "SELECT j.*,DATE_FORMAT(j.closing_date,'%Y-%m-%d') closing_date,(SELECT COUNT(*) FROM ats_applications a WHERE a.job_id=j.id) applicant_count FROM ats_jobs j ORDER BY created_at DESC",
      );
      for (const job of jobs) {
        job.data = json(job.data);
        Object.assign(job, {
          staffIds: (
            await rows<{ staff_id: string }>(
              "SELECT staff_id FROM ats_job_staff WHERE job_id=?",
              [job.id],
            )
          ).map((value) => value.staff_id),
        });
      }
      return reply({ records: jobs });
    }
    if (path[0] === "candidates") {
      const scope = scopeWhere(staff);
      return reply({
        records: await rows(
          `SELECT DISTINCT c.id,c.reference,c.full_name,c.email,c.phone,c.talent_pool,c.review_after,(SELECT COUNT(*) FROM ats_applications all_a WHERE all_a.candidate_id=c.id ${staff.role === "admin" ? "" : "AND (all_a.assigned_recruiter_id=? OR EXISTS(SELECT 1 FROM ats_job_staff s WHERE s.job_id=all_a.job_id AND s.staff_id=?))"}) application_count FROM ats_candidates c JOIN ats_applications a ON a.candidate_id=c.id WHERE c.merged_into IS NULL AND ${scope.sql} ORDER BY c.created_at DESC LIMIT 500`,
          [
            ...(staff.role === "admin" ? [] : [staff.id, staff.id]),
            ...scope.values,
          ],
        ),
      });
    }
    if (path[0] === "documents" && path.length === 2) {
      z.uuid().parse(path[1]);
      const [document] = await rows<{
        application_id: string;
        storage_key: string;
        mime: string;
        original_name: string;
        scan_status: string;
        sha256: string;
      }>("SELECT * FROM ats_documents WHERE id=?", [path[1]]);
      if (!document) throw new AtsError(404, "Document not found.");
      await transaction(async (connection) => {
        await scopedApplication(
          staff,
          document.application_id,
          "document",
          connection,
        );
        if (document.scan_status !== "clean")
          throw new AtsError(
            409,
            "This document is not available until its security check completes.",
          );
        await audit(
          connection,
          staff.id,
          query.get("preview") === "true"
            ? "document_preview"
            : "document_download",
          path[1],
        );
      });
      const bytes = await readFile(await documentPath(document.storage_key));
      if (createHash("sha256").update(bytes).digest("hex") !== document.sha256)
        throw new AtsError(
          409,
          "This document could not be verified. Contact the administrator.",
        );
      const inline =
        query.get("preview") === "true" && document.mime === "application/pdf";
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": document.mime,
          "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(document.original_name)}`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy":
            "sandbox; default-src 'none'; frame-ancestors 'self'",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    if (path[0] === "activity") {
      adminOnly(staff);
      return reply({
        records: await rows(
          "SELECT a.*,u.name actor_name FROM ats_activity a LEFT JOIN auth_user u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 200",
        ),
      });
    }
    if (path[0] === "retention") {
      adminOnly(staff);
      return reply({
        records: await rows(
          "SELECT r.*,c.reference,c.full_name FROM ats_retention r JOIN ats_candidates c ON c.id=r.candidate_id ORDER BY r.created_at DESC",
        ),
        due: await rows(
          "SELECT id,reference,full_name,review_after FROM ats_candidates WHERE merged_into IS NULL AND review_after<=UTC_DATE() ORDER BY review_after LIMIT 200",
        ),
      });
    }
    throw new AtsError(404, "Recruitment endpoint not found.");
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const staff = await staffFor(request);
    const { path } = await context.params;
    const input = await limitedJson(request);
    if (path[0] === "applications" && path.length === 2)
      return reply(await mutateApplication(staff, path[1], input));
    if (path[0] === "jobs") return reply(await saveVacancy(staff, input));
    if (path[0] === "duplicates")
      return reply(await resolveDuplicate(staff, input));
    if (path[0] === "clients") {
      adminOnly(staff);
      const value = z
        .object({ name: z.string().trim().min(2).max(160) })
        .strict()
        .parse(input);
      const id = randomUUID();
      await transaction(async (c) => {
        await c.execute("INSERT INTO ats_clients(id,name) VALUES(?,?)", [
          id,
          value.name,
        ]);
        await audit(c, staff.id, "client_created", id);
      });
      return reply({ id });
    }
    if (path[0] === "staff") {
      adminOnly(staff);
      const value = z
        .object({
          id: z.string().max(128).optional(),
          name: z.string().trim().min(2).max(160),
          email: z.email().max(254),
          role: z.enum(["admin", "recruiter", "hiring_manager"]),
          active: z.boolean(),
          password: z.string().min(14).max(128).optional(),
        })
        .strict()
        .parse(input);
      const hash = value.password ? await hashPassword(value.password) : null;
      await transaction(async (c) => {
        if (value.id) {
          if (
            value.id === staff.id &&
            (!value.active || value.role !== "admin")
          )
            throw new AtsError(
              422,
              "Keep your own administrator access active. Another administrator can change it.",
            );
          await c.execute(
            "UPDATE auth_user SET name=?,email=?,role=?,active=?,updatedAt=UTC_TIMESTAMP(3) WHERE id=?",
            [
              value.name,
              value.email.toLowerCase(),
              value.role,
              value.active,
              value.id,
            ],
          );
          if (hash)
            await c.execute(
              "UPDATE auth_account SET password=?,updatedAt=UTC_TIMESTAMP(3) WHERE userId=? AND providerId='credential'",
              [hash, value.id],
            );
          await c.execute("DELETE FROM auth_session WHERE userId=?", [
            value.id,
          ]);
          await audit(c, staff.id, "staff_updated", value.id, {
            role: value.role,
            active: value.active,
          });
        } else {
          if (!hash)
            throw new AtsError(
              422,
              "Set an initial password of at least 14 characters.",
            );
          const id = randomUUID();
          await c.execute(
            "INSERT INTO auth_user(id,name,email,emailVerified,createdAt,updatedAt,role,active) VALUES(?,?,?,FALSE,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3),?,?)",
            [
              id,
              value.name,
              value.email.toLowerCase(),
              value.role,
              value.active,
            ],
          );
          await c.execute(
            "INSERT INTO auth_account(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,'credential',?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",
            [randomUUID(), id, id, hash],
          );
          await audit(c, staff.id, "staff_created", id, { role: value.role });
        }
      });
      return reply({ saved: true });
    }
    if (path[0] === "export") {
      if (staff.role === "hiring_manager")
        throw new AtsError(
          403,
          "A recruiter or administrator must export records.",
        );
      const value = z
        .object({
          ids: z.array(z.uuid()).min(1).max(500),
          format: z.enum(["csv", "xlsx"]),
        })
        .strict()
        .parse(input);
      const unique = [...new Set(value.ids)];
      const data = await transaction(async (c) => {
        const result = [];
        for (const id of unique) {
          const record = await scopedApplication(staff, id, "export", c);
          const person = json<CandidateSubmission>(record.candidate_snapshot);
          result.push([
            record.reference,
            record.candidate_id,
            person.fullName,
            person.email,
            person.phone,
            record.applied_role,
            record.country,
            record.emirate,
            record.experience,
            record.availability,
            record.stage,
          ]);
        }
        await audit(c, staff.id, "applications_exported", null, {
          ids: unique,
          format: value.format,
        });
        return result;
      });
      const headers = [
        "Application reference",
        "Candidate ID",
        "Candidate",
        "Email",
        "Phone",
        "Applied role",
        "Country",
        "Emirate",
        "Experience years",
        "Availability",
        "Stage",
      ];
      const cells = data as (string | number | null)[][];
      const bytes =
        value.format === "csv"
          ? exportCsv(headers, cells)
          : exportXlsx(headers, cells);
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type":
            value.format === "csv"
              ? "text/csv; charset=utf-8"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="sankhala-applications.${value.format}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (path[0] === "retention") {
      adminOnly(staff);
      const value = z
        .object({
          candidateId: z.uuid(),
          reason: z.string().trim().min(5).max(500),
          verified: z.boolean(),
          holdReason: z.string().max(500).default(""),
        })
        .strict()
        .parse(input);
      await transaction(async (c) => {
        const [candidate] = await rows(
          "SELECT id FROM ats_candidates WHERE id=?",
          [value.candidateId],
          c,
        );
        if (!candidate) throw new AtsError(404, "Candidate not found.");
        await c.execute(
          "INSERT INTO ats_retention(id,candidate_id,reason,status,verified_by,verified_at,hold_reason) VALUES(?,?,?,?,?,IF(?,UTC_TIMESTAMP(3),NULL),?)",
          [
            randomUUID(),
            value.candidateId,
            value.reason,
            value.verified && !value.holdReason ? "Approved" : "Review",
            value.verified ? staff.id : null,
            value.verified,
            value.holdReason || null,
          ],
        );
        await audit(c, staff.id, "retention_review", value.candidateId, {
          approved: value.verified && !value.holdReason,
        });
      });
      return reply({ saved: true });
    }
    throw new AtsError(404, "Recruitment endpoint not found.");
  } catch (error) {
    return failure(error);
  }
}
