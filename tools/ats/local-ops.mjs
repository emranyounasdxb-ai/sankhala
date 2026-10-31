import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { access, appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const env = await readFile(".env.local", "utf8");
if (!env.includes("ATS_DB_NAME=sankhala_ats_local"))
  throw new Error("This helper is only for the isolated local ATS.");
await mkdir(".runtime/mailpit", { recursive: true });
const cert = path.resolve(".runtime/mailpit/cert.pem"),
  key = path.resolve(".runtime/mailpit/key.pem");
try {
  await access(cert);
} catch {
  execFileSync(
    process.platform === "win32"
      ? "C:/Program Files/Git/usr/bin/openssl.exe"
      : "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      key,
      "-out",
      cert,
      "-days",
      "7",
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1",
    ],
    { stdio: "ignore", windowsHide: true },
  );
}
const additions = {
  ATS_BACKUP_KEY: randomBytes(32).toString("base64"),
  ATS_DUMP_CONTAINER: "sankhala-ats-db",
  ATS_SMTP_HOST: "127.0.0.1",
  ATS_SMTP_PORT: "1028",
  ATS_SMTP_USER: "local-only",
  ATS_SMTP_PASSWORD: randomBytes(20).toString("hex"),
  ATS_SMTP_FROM: "notifications@sankhala.ae",
  NODE_EXTRA_CA_CERTS: cert.replace(/\\/g, "/"),
};
Object.assign(additions, {
  ATS_AV_COMMAND:
    process.platform === "win32"
      ? "C:/Program Files/Docker/Docker/resources/bin/docker.exe"
      : "/usr/bin/docker",
  ATS_AV_CONTAINER: "sankhala-ats-av",
});
for (const [name, value] of Object.entries(additions))
  if (!new RegExp(`^${name}=`, "m").test(env))
    await appendFile(".env.local", `${name}=${value}\n`);
console.log("Local-only mail TLS and encrypted backup configuration prepared.");
