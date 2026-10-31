import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { gunzipSync } from "node:zlib";
import { createConnection } from "mysql2/promise";

if (
  !process.env.ATS_DB_NAME?.endsWith("_local") ||
  process.env.ATS_DB_HOST !== "127.0.0.1"
)
  throw new Error("Restore tests are restricted to the isolated local ATS.");
const run = promisify(execFile),
  name = `sankhala_ats_restore_${randomUUID().slice(0, 8)}`,
  directory = path.resolve(".runtime", name),
  backups = path.resolve(process.env.ATS_PRIVATE_ROOT, "backups");
await mkdir(directory, { mode: 0o700 });
const manifest = JSON.parse(
  await readFile(path.join(backups, "latest.json"), "utf8"),
);
for (const [kind, filename] of [
  ["sql", manifest.sql],
  ["documents", manifest.documents],
]) {
  assert.match(filename, /^ats-(sql|documents)-[\dTZ-]+-[a-f\d-]{36}\.enc$/);
  await run(
    process.execPath,
    [
      "--env-file=.env.local",
      "tools/ats/backup.mjs",
      "decrypt",
      path.join(backups, filename),
      path.join(directory, `${kind}.gz`),
    ],
    { windowsHide: true },
  );
}
const corrupted = await readFile(path.join(backups, manifest.sql));
corrupted[corrupted.length - 1] ^= 1;
const corruptedPath = path.join(directory, "corrupted.enc");
await writeFile(corruptedPath, corrupted, { mode: 0o600 });
await assert.rejects(() =>
  run(
    process.execPath,
    [
      "--env-file=.env.local",
      "tools/ats/backup.mjs",
      "decrypt",
      corruptedPath,
      path.join(directory, "must-not-exist.gz"),
    ],
    { windowsHide: true },
  ),
);
await assert.rejects(() => access(path.join(directory, "must-not-exist.gz")));
const env = await readFile(".runtime/ats-db.env", "utf8"),
  password = env.match(/^MARIADB_ROOT_PASSWORD=(.+)$/m)[1];
const db = await createConnection({
  host: "127.0.0.1",
  port: Number(process.env.ATS_DB_PORT),
  user: "root",
  password,
  multipleStatements: true,
});
try {
  assert.match(name, /^sankhala_ats_restore_[a-f0-9]{8}$/);
  await db.query(`CREATE DATABASE \`${name}\``);
  await db.query(`USE \`${name}\``);
  await db.query(
    gunzipSync(await readFile(path.join(directory, "sql.gz"))).toString("utf8"),
  );
  const { stdout: list } = await run(
    "tar",
    ["-tzf", path.join(directory, "documents.gz")],
    { windowsHide: true },
  );
  assert.ok(
    list
      .split(/\r?\n/)
      .filter(Boolean)
      .every((value) =>
        /^documents\/(?:[a-f0-9-]{36}\.(?:pdf|docx|png|jpe?g))?$/.test(value),
      ),
  );
  await run(
    "tar",
    ["-xzf", path.join(directory, "documents.gz"), "-C", directory],
    { windowsHide: true },
  );
  const [documents] = await db.query(
    "SELECT storage_key,sha256 FROM ats_documents WHERE scan_status<>'deleted'",
  );
  assert.ok(documents.length > 0);
  for (const document of documents) {
    const bytes = await readFile(
      path.join(directory, "documents", document.storage_key),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      document.sha256,
    );
  }
  const [[applications]] = await db.query(
    "SELECT COUNT(*) count FROM ats_applications",
  );
  assert.ok(applications.count >= 2);
  console.log(
    `PASS: encrypted SQL and ${documents.length} private documents restored into a separate scratch database; corrupted backup rejected.`,
  );
} finally {
  assert.match(name, /^sankhala_ats_restore_[a-f0-9]{8}$/);
  await db.query(`DROP DATABASE IF EXISTS \`${name}\``);
  await db.end();
}
