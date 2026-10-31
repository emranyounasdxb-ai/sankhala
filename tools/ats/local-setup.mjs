import { randomBytes } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";

await mkdir(".runtime", { recursive: true });
try {
  await access(".env.local");
  throw new Error(
    ".env.local exists; refusing to replace local configuration.",
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const password = randomBytes(32).toString("hex");
await writeFile(
  ".runtime/ats-db.env",
  `MARIADB_DATABASE=sankhala_ats_local\nMARIADB_USER=sankhala_atsapp\nMARIADB_PASSWORD=${password}\nMARIADB_ROOT_PASSWORD=${randomBytes(32).toString("hex")}\n`,
  { mode: 0o600, flag: "wx" },
);
await writeFile(
  ".env.local",
  `SEO_INDEXABLE=false\nATS_ENABLED=true\nATS_DB_HOST=127.0.0.1\nATS_DB_PORT=3311\nATS_DB_NAME=sankhala_ats_local\nATS_DB_USER=sankhala_atsapp\nATS_DB_PASSWORD=${password}\nBETTER_AUTH_SECRET=${randomBytes(48).toString("hex")}\nATS_PUBLIC_ORIGIN=http://127.0.0.1:3001\nATS_INITIAL_ADMIN_EMAIL=admin@sankhala.ae\nATS_HR_EMAIL=admin@sankhala.ae\nATS_PRIVATE_ROOT=.runtime/ats-private\nATS_RETENTION_DAYS=365\n`,
  { mode: 0o600, flag: "wx" },
);
console.log("Private local ATS configuration created; no secrets printed.");
