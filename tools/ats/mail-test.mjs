import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { createConnection } from "mysql2/promise";

if (
  !process.env.ATS_DB_NAME?.endsWith("_local") ||
  process.env.ATS_SMTP_HOST !== "127.0.0.1" ||
  process.env.ATS_SMTP_PORT !== "1028"
)
  throw new Error("Mail tests must use the isolated local SMTP sink.");
const run = promisify(execFile),
  env = {
    ...process.env,
    NODE_EXTRA_CA_CERTS: path.resolve(".runtime/mailpit/cert.pem"),
  };
const db = await createConnection({
  host: process.env.ATS_DB_HOST,
  port: Number(process.env.ATS_DB_PORT),
  user: process.env.ATS_DB_USER,
  password: process.env.ATS_DB_PASSWORD,
  database: process.env.ATS_DB_NAME,
});
try {
  await db.execute(
    "UPDATE ats_outbox SET next_attempt_at=UTC_TIMESTAMP(3) WHERE status='pending'",
  );
  await run(
    process.execPath,
    ["--env-file=.env.local", "tools/ats/worker.mjs"],
    { env, windowsHide: true },
  );
  const [[pending]] = await db.query(
    "SELECT COUNT(*) count FROM ats_outbox WHERE status<>'delivered'",
  );
  assert.equal(pending.count, 0);
  const response = await fetch("http://127.0.0.1:8028/api/v1/messages"),
    mail = await response.json();
  assert.ok(mail.total >= 6);
  assert.ok(
    mail.messages.some((message) =>
      message.Subject.startsWith("Application received: APP-"),
    ),
  );
  assert.ok(
    mail.messages.some((message) =>
      message.Subject.startsWith("New application: APP-"),
    ),
  );
  console.log(
    `PASS: candidate and HR notifications delivered over authenticated STARTTLS to the local-only mail sink (${mail.total} messages); application references preserved.`,
  );
} finally {
  await db.end();
}
