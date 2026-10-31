import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  realpath,
  stat,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createPool } from "mysql2/promise";
import { deliverNotification } from "../../src/lib/ats/notifications.ts";

if (!/^sankhala_[a-z0-9_]+$/.test(process.env.ATS_DB_NAME ?? ""))
  throw new Error("Refusing a non-Sankhala database.");
const pool = createPool({
  host: process.env.ATS_DB_HOST,
  port: Number(process.env.ATS_DB_PORT ?? 3306),
  user: process.env.ATS_DB_USER,
  password: process.env.ATS_DB_PASSWORD,
  database: process.env.ATS_DB_NAME,
  timezone: "Z",
  connectionLimit: 2,
});
await mkdir(
  path.resolve(process.env.ATS_PRIVATE_ROOT ?? ".runtime/ats-private"),
  { recursive: true, mode: 0o700 },
);
const root = await realpath(
  path.resolve(process.env.ATS_PRIVATE_ROOT ?? ".runtime/ats-private"),
);
if (
  root === path.resolve("public") ||
  root.startsWith(path.resolve("public") + path.sep)
)
  throw new Error("Private storage cannot be public.");
const run = promisify(execFile);
await mkdir(path.join(root, "documents"), { recursive: true, mode: 0o700 });
const json = (value) => (typeof value === "string" ? JSON.parse(value) : value);
function filePath(key) {
  if (!/^[a-f0-9-]{36}\.(pdf|docx|png|jpe?g)$/.test(key))
    throw new Error("Invalid private document key.");
  return path.join(root, "documents", key);
}
async function claim(table, where, update) {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [[record]] = await c.query(
      `SELECT * FROM ${table} WHERE ${where} ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED`,
    );
    if (record)
      await c.execute(`UPDATE ${table} SET ${update} WHERE id=?`, [record.id]);
    await c.commit();
    return record;
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
}
async function outbox() {
  if (!process.env.ATS_SMTP_HOST) return;
  for (let count = 0; count < 20; count++) {
    const record = await claim(
      "ats_outbox",
      "attempts<8 AND next_attempt_at<=UTC_TIMESTAMP(3) AND (status='pending' OR (status='processing' AND locked_until<UTC_TIMESTAMP(3)))",
      "status='processing', attempts=attempts+1, locked_until=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 5 MINUTE)",
    );
    if (!record) break;
    try {
      await deliverNotification(json(record.payload));
      await pool.execute(
        "UPDATE ats_outbox SET status='delivered',delivered_at=UTC_TIMESTAMP(3),locked_until=NULL,last_error=NULL WHERE id=?",
        [record.id],
      );
    } catch {
      await pool.execute(
        "UPDATE ats_outbox SET status=?,locked_until=NULL,last_error='Mail transport unavailable or recipient not accepted',next_attempt_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ? SECOND) WHERE id=?",
        [
          record.attempts + 1 >= 8 ? "failed" : "pending",
          Math.min(3600, 60 * 2 ** record.attempts),
          record.id,
        ],
      );
    }
  }
}
async function scan() {
  const command = process.env.ATS_AV_COMMAND;
  if (!command) return;
  const container = process.env.ATS_AV_CONTAINER;
  if (
    container &&
    (container !== "sankhala-ats-av" ||
      !process.env.ATS_DB_NAME.endsWith("_local"))
  )
    throw new Error("Container scanning is restricted to the local ATS.");
  if (!path.isAbsolute(command))
    throw new Error("Scanner executable must be an absolute path.");
  for (let count = 0; count < 5; count++) {
    const record = await claim(
      "ats_documents",
      "scan_attempts<5 AND ((scan_status IN ('pending','error') AND (scanned_at IS NULL OR scanned_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 10 MINUTE))) OR (scan_status='scanning' AND scanned_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 10 MINUTE)))",
      "scan_status='scanning',scan_attempts=scan_attempts+1,scanned_at=UTC_TIMESTAMP(3)",
    );
    if (!record) break;
    let status = "error";
    try {
      const file = filePath(record.storage_key);
      const bytes = await readFile(file);
      if (createHash("sha256").update(bytes).digest("hex") !== record.sha256)
        status = "rejected";
      else {
        const args = [
          "--no-summary",
          "--max-filesize=8M",
          "--max-scansize=32M",
          "--max-files=250",
          "--max-recursion=10",
          "--alert-exceeds-max=yes",
          "--fail-if-cvd-older-than=3",
          "--alert-encrypted=yes",
          ...(process.env.ATS_AV_DATABASE
            ? [`--database=${process.env.ATS_AV_DATABASE}`]
            : []),
          "--",
          container ? `/documents/${record.storage_key}` : file,
        ];
        await run(
          command,
          container ? ["exec", container, "clamscan", ...args] : args,
          {
            timeout: 120000,
            maxBuffer: 1024 * 1024,
            windowsHide: true,
            env: {
              ...process.env,
              ...(process.env.ATS_AV_LIBRARY_PATH
                ? { LD_LIBRARY_PATH: process.env.ATS_AV_LIBRARY_PATH }
                : {}),
              ...(process.env.ATS_AV_CERTIFICATES
                ? { CVD_CERTS_DIR: process.env.ATS_AV_CERTIFICATES }
                : {}),
            },
          },
        );
        status = "clean";
      }
    } catch (error) {
      if (error.code === 1) status = "rejected";
    }
    await pool.execute(
      "UPDATE ats_documents SET scan_status=?,scanned_at=UTC_TIMESTAMP(3) WHERE id=? AND scan_status='scanning'",
      [status, record.id],
    );
  }
}
async function retention() {
  const [requests] = await pool.query(
    "SELECT * FROM ats_retention WHERE status='Approved' AND verified_at IS NOT NULL AND hold_reason IS NULL LIMIT 10",
  );
  for (const request of requests) {
    const c = await pool.getConnection();
    try {
      await c.beginTransaction();
      let target = request.candidate_id;
      const visited = new Set();
      while (!visited.has(target)) {
        visited.add(target);
        const [[person]] = await c.execute(
          "SELECT merged_into FROM ats_candidates WHERE id=? FOR UPDATE",
          [target],
        );
        if (!person?.merged_into) break;
        target = person.merged_into;
      }
      const [people] = await c.execute(
        "WITH RECURSIVE people AS (SELECT id FROM ats_candidates WHERE id=? UNION ALL SELECT c.id FROM ats_candidates c JOIN people p ON c.merged_into=p.id) SELECT id FROM people",
        [target],
      );
      const ids = people.map((person) => person.id);
      if (!ids.length) {
        await c.rollback();
        continue;
      }
      const marks = ids.map(() => "?").join(",");
      await c.execute(
        `SELECT id FROM ats_candidates WHERE id IN (${marks}) ORDER BY id FOR UPDATE`,
        ids,
      );
      await c.execute(
        `SELECT id FROM ats_applications WHERE candidate_id IN (${marks}) FOR UPDATE`,
        ids,
      );
      const [[holds]] = await c.execute(
        `SELECT COUNT(*) count FROM ats_retention WHERE candidate_id IN (${marks}) AND hold_reason IS NOT NULL AND hold_reason<>'' AND status<>'Completed'`,
        ids,
      );
      if (holds.count) {
        await c.rollback();
        continue;
      }
      const [documents] = await c.execute(
        `SELECT d.storage_key FROM ats_documents d JOIN ats_applications a ON a.id=d.application_id WHERE a.candidate_id IN (${marks})`,
        ids,
      );
      let removed = true;
      for (const document of documents) {
        try {
          await unlink(filePath(document.storage_key));
        } catch (error) {
          if (error.code !== "ENOENT") removed = false;
        }
      }
      if (!removed) continue;
      // Audit identifiers remain; candidate content, messages and documents are removed.
      await c.execute(
        `UPDATE ats_notes n JOIN ats_applications a ON a.id=n.application_id SET n.body='Removed following verified deletion request' WHERE a.candidate_id IN (${marks})`,
        ids,
      );
      await c.execute(
        `UPDATE ats_interviews i JOIN ats_applications a ON a.id=i.application_id SET i.location='Removed',i.notes='',i.status='Deleted' WHERE a.candidate_id IN (${marks})`,
        ids,
      );
      await c.execute(
        `UPDATE ats_outbox o JOIN ats_applications a ON a.id=o.application_id SET o.payload=JSON_OBJECT('redacted',TRUE),o.status='cancelled' WHERE a.candidate_id IN (${marks})`,
        ids,
      );
      await c.execute(
        `UPDATE ats_documents d JOIN ats_applications a ON a.id=d.application_id SET d.original_name='',d.sha256=REPEAT('0',64),d.size_bytes=0,d.scan_status='deleted' WHERE a.candidate_id IN (${marks})`,
        ids,
      );
      await c.execute(
        `UPDATE ats_applications SET candidate_snapshot=JSON_OBJECT('deleted',TRUE,'fullName','Deleted candidate'),country='Removed',emirate=NULL,experience=0,availability='Removed',version=version+1 WHERE candidate_id IN (${marks})`,
        ids,
      );
      await c.execute(
        `UPDATE ats_candidates SET full_name='Deleted candidate',email=CONCAT(id,'@deleted.invalid'),phone='removed',profile=JSON_OBJECT('deleted',TRUE),talent_pool=FALSE,updated_at=UTC_TIMESTAMP(3) WHERE id IN (${marks})`,
        ids,
      );
      await c.execute(
        `UPDATE ats_retention SET status='Completed',completed_at=UTC_TIMESTAMP(3),reason='Verified deletion completed' WHERE candidate_id IN (${marks}) AND status='Approved'`,
        ids,
      );
      await c.execute(
        "INSERT INTO ats_activity(id,actor_id,action,record_id,metadata) VALUES(?,?,'retention_completed',?,?)",
        [
          randomUUID(),
          request.verified_by,
          target,
          JSON.stringify({ profiles: ids.length }),
        ],
      );
      await c.commit();
    } catch (error) {
      await c.rollback();
      throw error;
    } finally {
      await c.rollback();
      c.release();
    }
  }
}
async function cleanup() {
  await pool.execute(
    "DELETE FROM ats_rate_limits WHERE expires_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 DAY)",
  );
  for (const entry of await readdir(path.join(root, "documents"))) {
    if (!/^[a-f0-9-]{36}\.(pdf|docx|png|jpe?g)$/.test(entry)) continue;
    const file = filePath(entry),
      info = await stat(file);
    if (info.mtimeMs > Date.now() - 48 * 3600000) continue;
    const [[record]] = await pool.execute(
      "SELECT id FROM ats_documents WHERE storage_key=?",
      [entry],
    );
    if (!record) await unlink(file);
  }
}
try {
  const c = await pool.getConnection();
  try {
    const [[lock]] = await c.query(
      "SELECT GET_LOCK('sankhala_ats_worker',0) acquired",
    );
    if (lock.acquired !== 1) {
      console.log("Another ATS worker is running.");
    } else {
      try {
        await outbox();
        await scan();
        const [[maintenance]] = await c.query(
          "SELECT GET_LOCK('sankhala_ats_maintenance',0) acquired",
        );
        if (maintenance.acquired === 1) {
          try {
            await retention();
            await cleanup();
          } finally {
            await c.query("SELECT RELEASE_LOCK('sankhala_ats_maintenance')");
          }
        }
        console.log("ATS background work completed.");
      } finally {
        await c.query("SELECT RELEASE_LOCK('sankhala_ats_worker')");
      }
    }
  } finally {
    c.release();
  }
} finally {
  await pool.end();
}
