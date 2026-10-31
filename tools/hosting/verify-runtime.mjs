import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createConnection } from "mysql2/promise";
import nodemailer from "nodemailer";

if (process.env.ATS_DB_NAME !== "sankhala_ats")
  throw new Error("Use the identified production ATS configuration.");
const run = promisify(execFile),
  root = process.env.ATS_PRIVATE_ROOT,
  env = {
    ...process.env,
    LD_LIBRARY_PATH: process.env.ATS_AV_LIBRARY_PATH,
    CVD_CERTS_DIR: process.env.ATS_AV_CERTIFICATES,
  };
const db = await createConnection({
  host: process.env.ATS_DB_HOST,
  port: Number(process.env.ATS_DB_PORT),
  user: process.env.ATS_DB_USER,
  password: process.env.ATS_DB_PASSWORD,
  database: process.env.ATS_DB_NAME,
});
try {
  const [[staff]] = await db.execute(
    "SELECT COUNT(*) count FROM auth_user WHERE email=? AND role='admin' AND active=TRUE",
    [process.env.ATS_INITIAL_ADMIN_EMAIL],
  );
  assert.equal(staff.count, 1);
  console.log("Production database and initial administrator verified.");
} finally {
  await db.end();
}
const transport = nodemailer.createTransport({
  host: process.env.ATS_SMTP_HOST,
  port: Number(process.env.ATS_SMTP_PORT),
  secure: Number(process.env.ATS_SMTP_PORT) === 465,
  requireTLS: true,
  auth: {
    user: process.env.ATS_SMTP_USER,
    pass: process.env.ATS_SMTP_PASSWORD,
  },
  connectionTimeout: 15000,
  socketTimeout: 20000,
});
await transport.verify();
console.log("Authenticated SMTP TLS verified; no external test email sent.");
const clean = path.join(root, `scanner-clean-${randomUUID()}.txt`),
  test = path.join(root, `scanner-eicar-${randomUUID()}.txt`);
try {
  await writeFile(clean, "Sankhala harmless scanner validation.", {
    mode: 0o600,
    flag: "wx",
  });
  const args = [
    `--database=${process.env.ATS_AV_DATABASE}`,
    "--no-summary",
    "--fail-if-cvd-older-than=3",
  ];
  await run(process.env.ATS_AV_COMMAND, [...args, clean], {
    env,
    timeout: 120000,
    maxBuffer: 1024 * 1024,
  });
  // Standard harmless EICAR antivirus validation, not executable malware.
  const eicar = [
    "X5O!P%@AP[4",
    "\\PZX54(P^)7CC)7}",
    "$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
  ].join("");
  await writeFile(test, eicar, { mode: 0o600, flag: "wx" });
  await assert.rejects(
    () =>
      run(process.env.ATS_AV_COMMAND, [...args, test], {
        env,
        timeout: 120000,
        maxBuffer: 1024 * 1024,
      }),
    (error) => error.code === 1,
  );
  console.log(
    "Private scanner verified: benign file accepted, standard EICAR test detected.",
  );
} finally {
  await unlink(clean).catch(() => {});
  await unlink(test).catch(() => {});
}
