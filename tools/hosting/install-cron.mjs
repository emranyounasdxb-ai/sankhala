import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";

if (process.platform !== "linux" || os.userInfo().username !== "sankhala")
  throw new Error("Use only the Sankhala hosting account.");
const run = promisify(execFile),
  base = "/home/sankhala",
  root = `${base}/private/sankhala-ats`,
  live = `${base}/apps/sankhala-live`,
  node = `${base}/.local/ats-bin/node`,
  env = `--env-file=${root}/application.env`;
let previous = "";
try {
  previous = (await run("crontab", ["-l"])).stdout;
} catch (error) {
  if (error.code !== 1) throw error;
}
previous = previous.replace(
  /# BEGIN SANKHALA ATS[\s\S]*?# END SANKHALA ATS\n?/g,
  "",
);
const lines = [
  "# BEGIN SANKHALA ATS",
  `*/2 * * * * ${node} ${env} ${live}/tools/hosting/deploy.mjs >> ${root}/deploy.log 2>&1`,
  `*/2 * * * * cd ${live} && ${node} ${env} tools/ats/worker.mjs >> ${root}/worker.log 2>&1`,
  `23 2 * * * cd ${live} && ${node} ${env} tools/ats/backup.mjs >> ${root}/backup.log 2>&1`,
  `17 */4 * * * cd ${live} && ${node} ${env} tools/ats/update-definitions.mjs >> ${root}/antivirus-update.log 2>&1`,
  "# END SANKHALA ATS",
  "",
];
const child = (await import("node:child_process")).spawn("crontab", ["-"], {
  stdio: ["pipe", "inherit", "inherit"],
});
child.stdin.end(`${previous.trim()}\n${lines.join("\n")}`);
const [code] = await (await import("node:events")).once(child, "close");
if (code !== 0) throw new Error("Cron installation failed.");
console.log(
  "Managed deployment, notification/document processing, encrypted backup and definition-update schedules installed; other cron entries preserved.",
);
