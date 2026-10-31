import { spawn } from "node:child_process";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import { once } from "node:events";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { createConnection } from "mysql2/promise";

const key = Buffer.from(process.env.ATS_BACKUP_KEY ?? "", "base64");
if (key.length !== 32)
  throw new Error("Configure a private 32-byte ATS_BACKUP_KEY before backups.");
const root = path.resolve(
    process.env.ATS_PRIVATE_ROOT ?? ".runtime/ats-private",
  ),
  directory = path.join(root, "backups");
if (
  root === path.resolve("public") ||
  root.startsWith(path.resolve("public") + path.sep)
)
  throw new Error("Backups must not be public.");
await mkdir(directory, { recursive: true, mode: 0o700 });
export async function decryptBackup(source, target) {
  const handle = await open(source, "r");
  const info = await handle.stat(),
    prefix = Buffer.alloc(1024);
  await handle.read(prefix, 0, Math.min(prefix.length, info.size), 0);
  const end = prefix.indexOf(10);
  if (end < 0) throw new Error("Invalid encrypted backup header.");
  const header = prefix.subarray(0, end + 1),
    metadata = JSON.parse(header.toString());
  if (metadata.v !== 1 || !["sql", "documents"].includes(metadata.kind))
    throw new Error("Unsupported backup format.");
  const tag = Buffer.alloc(16);
  await handle.read(tag, 0, 16, info.size - 16);
  await handle.close();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(metadata.iv, "hex"),
  );
  decipher.setAAD(header);
  decipher.setAuthTag(tag);
  const temp = `${target}.partial`;
  try {
    await pipeline(
      createReadStream(source, { start: end + 1, end: info.size - 17 }),
      decipher,
      createWriteStream(temp, { flags: "wx", mode: 0o600 }),
    );
  } catch (error) {
    await unlink(temp).catch(() => {});
    throw error;
  }
  await rename(temp, target);
  return metadata;
}
async function encryptProcess(kind, command, args, env) {
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `ats-${kind}-${now}-${randomUUID()}.enc`,
    target = path.join(directory, filename),
    temp = `${target}.partial`;
  const iv = randomBytes(12),
    header = Buffer.from(
      `${JSON.stringify({
        v: 1,
        kind,
        iv: iv.toString("hex"),
        createdAt: new Date().toISOString(),
        database: process.env.ATS_DB_NAME,
      })}\n`,
    );
  const handle = await open(temp, "wx", 0o600);
  await handle.write(header);
  await handle.close();
  const child = spawn(command, args, {
    env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let errorText = "";
  child.stderr.on("data", (chunk) => {
    if (errorText.length < 2000) errorText += chunk.toString();
  });
  const completion = once(child, "close");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(header);
  try {
    if (kind === "sql")
      await pipeline(
        child.stdout,
        createGzip(),
        cipher,
        createWriteStream(temp, { flags: "a", mode: 0o600 }),
      );
    else
      await pipeline(
        child.stdout,
        cipher,
        createWriteStream(temp, { flags: "a", mode: 0o600 }),
      );
    const [code] = await completion;
    if (code !== 0) throw new Error(`Backup ${kind} command failed (${code}).`);
    const file = await open(temp, "a");
    await file.write(cipher.getAuthTag());
    await file.close();
    await rename(temp, target);
    return filename;
  } catch (error) {
    child.kill();
    await completion.catch(() => {});
    throw error;
  }
}
if (process.argv[2] === "decrypt") {
  if (!process.argv[3] || !process.argv[4])
    throw new Error(
      "Specify an encrypted backup and a new private output file.",
    );
  const metadata = await decryptBackup(
    path.resolve(process.argv[3]),
    path.resolve(process.argv[4]),
  );
  console.log(
    `Verified ${metadata.kind} backup decrypted to the requested private output.`,
  );
} else if (process.argv[2] !== "library") {
  if (!/^sankhala_[a-z0-9_]+$/.test(process.env.ATS_DB_NAME ?? ""))
    throw new Error("Refusing a non-Sankhala database.");
  const container = process.env.ATS_DUMP_CONTAINER;
  if (
    container &&
    (container !== "sankhala-ats-db" ||
      !process.env.ATS_DB_NAME.endsWith("_local"))
  )
    throw new Error(
      "Container backup is restricted to the isolated local ATS.",
    );
  const lock = await createConnection({
    host: process.env.ATS_DB_HOST,
    port: Number(process.env.ATS_DB_PORT ?? 3306),
    user: process.env.ATS_DB_USER,
    password: process.env.ATS_DB_PASSWORD,
    database: process.env.ATS_DB_NAME,
  });
  try {
    const [[value]] = await lock.query(
      "SELECT GET_LOCK('sankhala_ats_maintenance',60) acquired",
    );
    if (value.acquired !== 1)
      throw new Error("Backup maintenance lock unavailable.");
    const arguments_ = [
      `--host=${container ? "127.0.0.1" : process.env.ATS_DB_HOST}`,
      `--port=${container ? 3306 : (process.env.ATS_DB_PORT ?? 3306)}`,
      `--user=${process.env.ATS_DB_USER}`,
      "--single-transaction",
      "--quick",
      "--skip-lock-tables",
      "--hex-blob",
      "--no-tablespaces",
      process.env.ATS_DB_NAME,
    ];
    const sql = await encryptProcess(
      "sql",
      container ? "docker" : (process.env.ATS_DUMP_COMMAND ?? "mariadb-dump"),
      container
        ? [
            "exec",
            "--env",
            "MYSQL_PWD",
            container,
            "mariadb-dump",
            ...arguments_,
          ]
        : arguments_,
      { ...process.env, MYSQL_PWD: process.env.ATS_DB_PASSWORD },
    );
    const documents = await encryptProcess(
      "documents",
      process.env.ATS_TAR_COMMAND ?? "tar",
      ["-czf", "-", "-C", root, "documents"],
      process.env,
    );
    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      sql,
      documents,
    };
    await writeManifest(manifest);
    const retention = Math.max(
      7,
      Math.min(365, Number(process.env.ATS_BACKUP_RETENTION_DAYS) || 30),
    );
    for (const file of await readdir(directory)) {
      if (!/^ats-(?:sql|documents)-[\dTZ-]+-[a-f\d-]{36}\.enc$/.test(file))
        continue;
      const target = path.join(directory, file);
      if ((await stat(target)).mtimeMs < Date.now() - retention * 86400000)
        await unlink(target);
    }
    console.log("Encrypted database and private document backups completed.");
  } finally {
    await lock.query("SELECT RELEASE_LOCK('sankhala_ats_maintenance')");
    await lock.end();
  }
}
async function writeManifest(value) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(
    path.join(directory, "latest.json"),
    JSON.stringify(value, null, 2),
    { mode: 0o600 },
  );
}
