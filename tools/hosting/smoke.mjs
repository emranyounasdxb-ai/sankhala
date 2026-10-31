// Initial production verification. Reads the server-only initial credential;
// never prints credentials, cookies, candidate details or authentication tokens.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import os from "node:os";
import { createConnection } from "mysql2/promise";

if (process.platform !== "linux" || os.userInfo().username !== "sankhala")
  throw new Error("Run only on the Sankhala hosting account.");
process.loadEnvFile("/home/sankhala/private/sankhala-ats/application.env");
const origin = "https://sankhala.ae";
const request = (route, options = {}) =>
  fetch(origin + route, {
    signal: AbortSignal.timeout(30000),
    ...options,
    headers: {
      "User-Agent": "Sankhala-Deployment/1.0 (health verification)",
      ...options.headers,
    },
  });
for (const route of ["/", "/jobs", "/contact", "/submit-cv", "/admin/login"]) {
  const response = await request(route);
  assert.equal(response.status, 200, `Public page ${route}`);
  assert.ok((await response.text()).includes("Sankhala"));
}
assert.equal((await request("/api/ats/admin/applications")).status, 401);
assert.equal((await request("/api/ats/health")).status, 401);
const credential = await readFile(
  "/home/sankhala/private/sankhala-ats/initial-admin.txt",
  "utf8",
);
const login = await request("/api/auth/sign-in/email", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin },
  body: JSON.stringify({
    email: process.env.ATS_INITIAL_ADMIN_EMAIL,
    password: credential.match(/Initial password: (.+)/)[1],
  }),
});
assert.equal(login.status, 200, "Production staff sign in");
const cookies = login.headers.getSetCookie();
assert.ok(cookies.some((value) => /;\s*Secure/i.test(value)));
assert.ok(cookies.some((value) => /;\s*HttpOnly/i.test(value)));
const cookie = cookies.map((value) => value.split(";")[0]).join("; ");
for (const route of ["stats", "applications", "options", "jobs"]) {
  const response = await request(`/api/ats/admin/${route}`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(response.status, 200, `Authenticated ${route}`);
  assert.match(response.headers.get("cache-control"), /no-store/);
  await response.json();
}
await request("/api/auth/sign-out", {
  method: "POST",
  headers: {
    Cookie: cookie,
    Origin: origin,
    "Content-Type": "application/json",
  },
  body: "{}",
});
const db = await createConnection({
  host: process.env.ATS_DB_HOST,
  port: Number(process.env.ATS_DB_PORT),
  user: process.env.ATS_DB_USER,
  password: process.env.ATS_DB_PASSWORD,
  database: process.env.ATS_DB_NAME,
});
try {
  const [[charset]] = await db.query("SELECT @@character_set_database charset");
  assert.equal(charset.charset, "utf8mb4");
  const [[tables]] = await db.execute(
    "SELECT COUNT(*) invalid FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE='BASE TABLE' AND TABLE_COLLATION NOT LIKE 'utf8mb4%'",
    [process.env.ATS_DB_NAME],
  );
  assert.equal(tables.invalid, 0);
} finally {
  await db.end();
}
console.log(
  "Live HTTPS pages, staff login, secure cookies, private API authorization and UTF-8 database verified; no vacancy or application test data inserted.",
);
