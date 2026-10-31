import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hashPassword } from "better-auth/crypto";
import { createConnection } from "mysql2/promise";

const database = process.env.ATS_DB_NAME;
if (!/^sankhala_[a-z0-9_]+$/.test(database ?? ""))
  throw new Error("Refusing a database outside the Sankhala namespace.");
const connection = await createConnection({
  host: process.env.ATS_DB_HOST,
  port: Number(process.env.ATS_DB_PORT ?? 3306),
  user: process.env.ATS_MIGRATION_USER ?? process.env.ATS_DB_USER,
  password: process.env.ATS_MIGRATION_PASSWORD ?? process.env.ATS_DB_PASSWORD,
  database,
  timezone: "Z",
  multipleStatements: false,
});
try {
  const [[lock]] = await connection.execute(
    "SELECT GET_LOCK('sankhala_ats_migrations',30) AS acquired",
  );
  if (lock.acquired !== 1) throw new Error("Migration lock unavailable.");
  await connection.execute(
    "CREATE TABLE IF NOT EXISTS ats_migrations (name VARCHAR(100) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB",
  );
  const sql = (
    await readFile(new URL("./schema.sql", import.meta.url), "utf8")
  ).replace(/\r\n/g, "\n");
  const checksum = createHash("sha256").update(sql).digest("hex");
  const [[applied]] = await connection.execute(
    "SELECT checksum FROM ats_migrations WHERE name='001_initial'",
  );
  if (applied && applied.checksum !== checksum)
    throw new Error("Applied migration changed; add a new migration instead.");
  if (!applied) {
    for (const statement of sql
      .split(/;\s*(?:\r?\n|$)/)
      .map((value) => value.trim())
      .filter(Boolean))
      await connection.query(statement);
    await connection.execute(
      "INSERT INTO ats_migrations(name,checksum) VALUES('001_initial',?)",
      [checksum],
    );
  }
  // cPanel databases may inherit latin1. Explicitly support multilingual names
  // and four-byte Unicode in both existing tables and future schema changes.
  const unicodePlan =
    "002_utf8mb4:database-and-owned-tables:utf8mb4_unicode_ci";
  const unicodeChecksum = createHash("sha256")
    .update(unicodePlan)
    .digest("hex");
  const [[unicodeApplied]] = await connection.execute(
    "SELECT checksum FROM ats_migrations WHERE name='002_utf8mb4'",
  );
  if (unicodeApplied && unicodeApplied.checksum !== unicodeChecksum)
    throw new Error("Applied Unicode migration changed.");
  if (!unicodeApplied) {
    await connection.query(
      `ALTER DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE='BASE TABLE'",
      [database],
    );
    for (const { name } of tables)
      if (!/^(ats|auth)_[a-z0-9_]+$/.test(name))
        throw new Error("Unexpected table in the isolated ATS database.");
    // MariaDB requires FK definitions to be removed during charset conversion.
    // Persist them before any DDL so an interrupted migration can resume.
    const root = path.resolve(
      process.env.ATS_PRIVATE_ROOT ?? ".runtime/ats-private",
    );
    await mkdir(root, { recursive: true, mode: 0o700 });
    const manifest = path.join(root, "migration-002-foreign-keys.json");
    let keys;
    try {
      keys = JSON.parse(await readFile(manifest, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      keys = [];
      for (const { name } of tables) {
        const [[definition]] = await connection.query(
          `SHOW CREATE TABLE \`${name}\``,
        );
        for (const line of definition["Create Table"].split("\n")) {
          const match = line
            .trim()
            .match(/^CONSTRAINT `([a-zA-Z0-9_]+)` FOREIGN KEY .+$/);
          if (match)
            keys.push({
              table: name,
              name: match[1],
              ddl: match[0].replace(/,$/, ""),
            });
        }
      }
      await writeFile(manifest, JSON.stringify(keys), {
        mode: 0o600,
        flag: "wx",
      });
    }
    for (const key of keys) {
      if (
        !/^(ats|auth)_[a-z0-9_]+$/.test(key.table) ||
        !/^[a-zA-Z0-9_]+$/.test(key.name) ||
        !key.ddl.startsWith(`CONSTRAINT \`${key.name}\` FOREIGN KEY `) ||
        /[;\r\n]/.test(key.ddl)
      )
        throw new Error("Invalid saved foreign-key definition.");
      const [[present]] = await connection.execute(
        "SELECT COUNT(*) count FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME=? AND CONSTRAINT_NAME=? AND CONSTRAINT_TYPE='FOREIGN KEY'",
        [database, key.table, key.name],
      );
      if (present.count)
        await connection.query(
          `ALTER TABLE \`${key.table}\` DROP FOREIGN KEY \`${key.name}\``,
        );
    }
    for (const { name } of tables)
      await connection.query(
        `ALTER TABLE \`${name}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    for (const key of keys)
      await connection.query(`ALTER TABLE \`${key.table}\` ADD ${key.ddl}`);
    await connection.execute(
      "INSERT INTO ats_migrations(name,checksum) VALUES('002_utf8mb4',?)",
      [unicodeChecksum],
    );
  }
  const email = process.env.ATS_INITIAL_ADMIN_EMAIL;
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const [[existing]] = await connection.execute(
      "SELECT id FROM auth_user WHERE email=?",
      [email.toLowerCase()],
    );
    if (!existing) {
      const password = randomBytes(30).toString("base64url");
      const id = randomUUID();
      const hash = await hashPassword(password);
      await connection.beginTransaction();
      await connection.execute(
        "INSERT INTO auth_user(id,name,email,emailVerified,createdAt,updatedAt,role,active) VALUES(?,?,?,FALSE,NOW(3),NOW(3),'admin',TRUE)",
        [id, "Sankhala administrator", email.toLowerCase()],
      );
      await connection.execute(
        "INSERT INTO auth_account(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,'credential',?,?,NOW(3),NOW(3))",
        [randomUUID(), id, id, hash],
      );
      const root = path.resolve(
        process.env.ATS_PRIVATE_ROOT ?? ".runtime/ats-private",
      );
      await mkdir(root, { recursive: true, mode: 0o700 });
      const file = path.join(root, "initial-admin.txt");
      await writeFile(
        file,
        `Sankhala staff sign in\nEmail: ${email}\nInitial password: ${password}\nChange this password immediately after signing in. Keep this file private.\n`,
        { mode: 0o600, flag: "wx" },
      );
      await connection.commit();
      console.log(
        `Initial administrator created. Credentials are in the private file: ${file}`,
      );
    }
  }
  console.log("Sankhala ATS migration verified.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.query("SELECT RELEASE_LOCK('sankhala_ats_migrations')");
  await connection.end();
}
