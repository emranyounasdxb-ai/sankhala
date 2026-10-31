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
