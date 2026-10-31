import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { strFromU8, unzipSync } from "fflate";
import { createConnection } from "mysql2/promise";

const origin = "http://127.0.0.1:3001";
if (
  !process.env.ATS_DB_NAME?.endsWith("_local") ||
  process.env.ATS_PUBLIC_ORIGIN !== origin
)
  throw new Error(
    "Integration tests are restricted to the isolated local ATS.",
  );
const db = await createConnection({
  host: process.env.ATS_DB_HOST,
  port: Number(process.env.ATS_DB_PORT),
  user: process.env.ATS_DB_USER,
  password: process.env.ATS_DB_PASSWORD,
  database: process.env.ATS_DB_NAME,
  timezone: "Z",
});
const text = await readFile(
  path.join(process.env.ATS_PRIVATE_ROOT, "initial-admin.txt"),
  "utf8",
);
async function login(email, password) {
  const r = await fetch(`${origin}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(r.status, 200, `Sign in: ${r.status}`);
  return r.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
}
const admin = await login(
  process.env.ATS_INITIAL_ADMIN_EMAIL,
  text.match(/Initial password: (.+)/)[1],
);
async function call(route, body, cookie = admin, expected = 200) {
  const r = await fetch(`${origin}/api/ats/admin/${route}`, {
    headers: {
      Cookie: cookie,
      Origin: origin,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  const value = await r.json();
  assert.equal(r.status, expected, `${route}: ${JSON.stringify(value)}`);
  return value;
}
const run = randomUUID().slice(0, 8);
let jobId, job2Id;
try {
  await call("applications", undefined, "", 401);
  const signup = await fetch(`${origin}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Uninvited",
      email: `uninvited-${run}@example.invalid`,
      password: "Not-A-Real-Password-1234",
    }),
  });
  assert.ok(signup.status >= 400);
  const { id: clientId } = await call("clients", {
    name: `[TEST] Client ${run}`,
  });
  const job = {
    title: `[TEST] Cleaner ${run}`,
    category: "Cleaning & Facilities",
    employerKind: "client",
    clientId,
    country: "UAE",
    emirate: "Dubai",
    location: "[TEST] Dubai",
    vacancies: 2,
    salaryMinAed: 2000,
    salaryMaxAed: 3000,
    dutyHours: "Test schedule",
    weeklyOff: "Test day",
    experience: "Test experience",
    requiredCertification: "None for this test",
    benefits: "Test benefits",
    description: "Isolated local integration fixture, not a real vacancy.",
    closingDate: new Date(Date.now() + 30 * 86400000)
      .toISOString()
      .slice(0, 10),
    employerConfirmed: true,
    status: "published",
  };
  const options = await call("options");
  const ownerId = options.staff.id;
  ({ id: jobId } = await call("jobs", { job, staffIds: [ownerId] }));
  ({ id: job2Id } = await call("jobs", {
    job: { ...job, title: `[TEST] Helper ${run}` },
    staffIds: [ownerId],
  }));
  const publicRole = await fetch(`${origin}/jobs/${jobId}`);
  assert.equal(publicRole.status, 200);
  assert.ok((await publicRole.text()).includes(job.title));
  const candidate = {
    fullName: `[TEST] Ahmed ${run}`,
    email: `ats-${run}@example.invalid`,
    phone: `+97150${String(Date.now()).slice(-7)}`,
    country: "United Arab Emirates",
    emirate: "Dubai",
    preferredLocation: "Dubai",
    totalExperienceYears: 4,
    uaeExperienceYears: 2,
    lastJobTitle: "Cleaner",
    skills: "Cleaning",
    languages: "English",
    qualifications: "Secondary education",
    availability: "Immediate",
    expectedMonthlySalaryAed: 2500,
    visaType: "Not applicable",
    preferredRole: "Cleaner",
    consent: true,
    consentVersion: "recruitment-v1",
  };
  const token = (await (await fetch(`${origin}/api/ats/intake-token`)).json())
    .token;
  await new Promise((resolve) => setTimeout(resolve, 1700));
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
  );
  async function apply(details, job, key = randomUUID(), expected = 201) {
    const form = new FormData();
    form.set("details", JSON.stringify(details));
    form.set("jobId", job);
    form.set("token", token);
    form.set("idempotencyKey", key);
    form.set(
      "cv",
      new Blob([pdf], { type: "application/pdf" }),
      "[TEST]-cv.pdf",
    );
    const response = await fetch(`${origin}/api/ats/applications`, {
      method: "POST",
      headers: { Origin: origin },
      body: form,
    });
    const value = await response.json();
    assert.equal(response.status, expected, JSON.stringify(value));
    return value;
  }
  const key = randomUUID();
  const receipt = await apply(candidate, jobId, key);
  const retry = await apply(candidate, jobId, key, 200);
  assert.equal(receipt.reference, retry.reference);
  await apply(
    { ...candidate, fullName: `[TEST] Ahmed updated ${run}` },
    job2Id,
  );
  const list = await call(`applications?q=${run}`);
  assert.equal(list.total, 2);
  const app = list.records.find((row) => row.job_id === jobId),
    app2 = list.records.find((row) => row.job_id === job2Id);
  const [[count]] = await db.execute(
    "SELECT COUNT(*) count FROM ats_applications WHERE idempotency_key=?",
    [key],
  );
  assert.equal(count.count, 1);
  const detail = await call(`applications/${app.id}`);
  assert.equal(detail.record.candidate_snapshot.fullName, candidate.fullName);
  assert.equal(detail.documents[0].scan_status, "pending");
  await stat(
    path.join(
      process.env.ATS_PRIVATE_ROOT,
      "documents",
      (
        await db.execute("SELECT storage_key FROM ats_documents WHERE id=?", [
          detail.documents[0].id,
        ])
      )[0][0].storage_key,
    ),
  );
  await call(`documents/${detail.documents[0].id}`, undefined, "", 401);
  await call(`documents/${detail.documents[0].id}`, undefined, admin, 409);
  await call(`applications/${app.id}`, {
    action: "stage",
    stage: "Shortlisted",
    version: app.version,
  });
  await call(
    `applications/${app.id}`,
    { action: "stage", stage: "Hired", version: app.version },
    admin,
    409,
  );
  await call(`applications/${app.id}`, {
    action: "note",
    body: "[TEST] Recruiter review saved.",
  });
  const password = `Local-Test-${randomUUID()}-14`;
  await call("staff", {
    name: `[TEST] Recruiter ${run}`,
    email: `recruiter-${run}@example.invalid`,
    role: "recruiter",
    active: true,
    password,
  });
  await call("staff", {
    name: `[TEST] Manager ${run}`,
    email: `manager-${run}@example.invalid`,
    role: "hiring_manager",
    active: true,
    password,
  });
  const users = await call("options"),
    recruiterUser = users.users.find(
      (user) => user.email === `recruiter-${run}@example.invalid`,
    ),
    managerUser = users.users.find(
      (user) => user.email === `manager-${run}@example.invalid`,
    );
  const recruiter = await login(recruiterUser.email, password),
    manager = await login(managerUser.email, password);
  assert.equal((await call("applications", undefined, recruiter)).total, 0);
  await call(`applications/${app.id}`, undefined, recruiter, 403);
  const updated = await call(`applications/${app.id}`);
  await call(`applications/${app.id}`, {
    action: "assign",
    recruiterId: recruiterUser.id,
    version: updated.record.version,
  });
  assert.equal((await call("applications", undefined, recruiter)).total, 1);
  await call(
    `applications/${app.id}`,
    { action: "note", body: "[TEST] Assigned recruiter note." },
    recruiter,
  );
  await call(`applications/${app2.id}`, undefined, recruiter, 403);
  await call("jobs", {
    id: jobId,
    version: 1,
    job,
    staffIds: [ownerId, managerUser.id],
  });
  assert.equal((await call("applications", undefined, manager)).total, 1);
  await call(
    `applications/${app.id}`,
    { action: "stage", stage: "Hired", version: 3 },
    manager,
    403,
  );
  await call("export", { ids: [app.id], format: "csv" }, manager, 403);
  await call("staff", { name: "No access" }, manager, 403);
  const start = new Date(Date.now() + 86400000),
    end = new Date(start.getTime() + 3600000);
  await call(`applications/${app.id}`, {
    action: "interview",
    staffId: recruiterUser.id,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    timezone: "Asia/Dubai",
    location: "[TEST] Office",
    notes: "Test interview",
  });
  await call(
    `applications/${app.id}`,
    {
      action: "interview",
      staffId: recruiterUser.id,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timezone: "Asia/Dubai",
      location: "[TEST] Office",
      notes: "Overlap must fail",
    },
    admin,
    409,
  );
  const duplicateDetail = await call(`applications/${app2.id}`);
  assert.equal(duplicateDetail.duplicates.length, 1);
  await call("duplicates", {
    matchId: duplicateDetail.duplicates[0].id,
    resolution: "link",
    verified: true,
  });
  const linked = await call(`applications/${app2.id}`);
  assert.equal(linked.candidate.id, detail.candidate.id);
  assert.equal(linked.history.length, 2);
  assert.notEqual(
    linked.record.candidate_snapshot.fullName,
    detail.record.candidate_snapshot.fullName,
  );
  const xlsx = await fetch(`${origin}/api/ats/admin/export`, {
    method: "POST",
    headers: {
      Cookie: admin,
      Origin: origin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: [app.id, app2.id], format: "xlsx" }),
  });
  assert.equal(xlsx.status, 200);
  const zip = unzipSync(new Uint8Array(await xlsx.arrayBuffer()));
  assert.ok(
    strFromU8(zip["xl/worksheets/sheet1.xml"]).includes(candidate.fullName),
  );
  await apply(
    { ...candidate, clientId, category: "Security" },
    jobId,
    randomUUID(),
    422,
  );
  await call("jobs", {
    id: jobId,
    version: 2,
    job: { ...job, status: "closed" },
    staffIds: [ownerId, managerUser.id],
  });
  await apply(candidate, jobId, randomUUID(), 409);
  const [[messages]] = await db.execute(
    "SELECT COUNT(*) count FROM ats_outbox WHERE application_id IN (?,?)",
    [app.id, app2.id],
  );
  assert.equal(messages.count, 4);
  const [[history]] = await db.execute(
    "SELECT COUNT(*) count FROM ats_stage_history WHERE application_id=?",
    [app.id],
  );
  assert.equal(history.count, 2);
  console.log(
    "PASS: durable submissions, idempotency, snapshots, duplicate linking, private quarantine, roles/scopes, optimistic stages, notes, interview conflicts, XLSX, confirmed job closure and email outbox.",
  );
} finally {
  for (const id of [jobId, job2Id].filter(Boolean))
    await db.execute(
      "UPDATE ats_jobs SET status='closed',data=JSON_SET(data,'$.status','closed') WHERE id=?",
      [id],
    );
  await db.end();
}
