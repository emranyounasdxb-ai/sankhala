import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readlink,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { createConnection } from "mysql2/promise";

const base = "/home/sankhala",
  privateRoot = `${base}/private/sankhala-ats`,
  repository = `${base}/apps/sankhala`,
  releases = `${base}/apps/sankhala-releases`,
  live = `${base}/apps/sankhala-live`,
  node = `${base}/.local/ats-bin/node`,
  npm = `${base}/.local/node-v26.13.0-linux-x64/lib/node_modules/npm/bin/npm-cli.js`;
if (process.platform !== "linux" || os.userInfo().username !== "sankhala")
  throw new Error("Deployment is restricted to the Sankhala hosting account.");
process.loadEnvFile(`${privateRoot}/application.env`);
process.env.PATH = `${base}/.local/ats-bin:${process.env.PATH}`;
const run = promisify(execFile),
  db = await createConnection({
    host: process.env.ATS_DB_HOST,
    port: Number(process.env.ATS_DB_PORT),
    user: process.env.ATS_DB_USER,
    password: process.env.ATS_DB_PASSWORD,
    database: process.env.ATS_DB_NAME,
  });
const healthKey = process.env.ATS_HEALTH_TOKEN;
async function revisionAtLive() {
  try {
    return (await readFile(`${live}/REVISION`, "utf8")).trim();
  } catch {
    return null;
  }
}
async function health(origin, revision) {
  try {
    const response = await fetch(`${origin}/api/ats/health`, {
      headers: {
        "x-health-key": healthKey,
        "User-Agent": "Sankhala-Deployment/1.0 (health verification)",
      },
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    return response.ok && data.ok && data.revision === revision;
  } catch {
    return false;
  }
}
async function command(file, args, cwd) {
  const child = spawn(file, args, {
    cwd,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
  });
  const [code] = await once(child, "close");
  if (code !== 0)
    throw new Error(
      `Deployment step failed: ${path.basename(file)} (${code}).`,
    );
}
async function restart(root) {
  if (!root) return;
  await mkdir(`${root}/tmp`, { recursive: true });
  await writeFile(`${root}/tmp/restart.txt`, new Date().toISOString());
}
async function publishFavicon(root) {
  // cPanel may serve a pre-existing document-root icon before Passenger.
  // Replace only that named public file, preserving its first previous value.
  const icon = await readFile(`${root}/public/favicon.ico`);
  const target = `${base}/public_html/favicon.ico`;
  try {
    const info = await lstat(target);
    if (!info.isFile())
      throw new Error("The public favicon must be a regular file.");
    const previous = await readFile(target);
    if (previous.equals(icon)) return;
    await mkdir(`${privateRoot}/backups`, { recursive: true, mode: 0o700 });
    try {
      await writeFile(
        `${privateRoot}/backups/favicon-before-sankhala.ico`,
        previous,
        { flag: "wx", mode: 0o600 },
      );
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const temporary = `${base}/public_html/.sankhala-favicon-${process.pid}.ico`;
  try {
    await writeFile(temporary, icon, { flag: "wx", mode: 0o644 });
    await chmod(temporary, 0o644);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(
    "Public document-root favicon synchronized with the Sankhala release.",
  );
}
async function switchLive(target) {
  if (
    !target.startsWith(`${releases}/`) ||
    !/^\w{40}$/.test(path.basename(target))
  )
    throw new Error("Invalid release target.");
  const temporary = `${live}.next-${process.pid}`;
  await symlink(target, temporary);
  await rename(temporary, live);
}
try {
  const [[lock]] = await db.query(
    "SELECT GET_LOCK('sankhala_ats_deploy',0) acquired",
  );
  if (lock.acquired !== 1) {
    console.log("Another deployment is running.");
    process.exitCode = 0;
  } else
    try {
      await run("git", ["fetch", "origin", "main"], { cwd: repository });
      const { stdout } = await run("git", ["rev-parse", "origin/main"], {
        cwd: repository,
      });
      const revision = stdout.trim();
      if (!/^[a-f0-9]{40}$/.test(revision))
        throw new Error("Invalid Git revision.");
      const previous = await revisionAtLive();
      if (process.argv.includes("--verify-live")) {
        if (!(await health("https://sankhala.ae", previous)))
          throw new Error("Live HTTPS health check failed.");
        console.log(`Live revision ${previous} verified.`);
      } else if (previous === revision) {
        await publishFavicon(live);
        console.log(`Already deployed ${revision}.`);
      } else {
        const response = await fetch(
          `https://api.github.com/repos/emranyounasdxb-ai/sankhala/actions/workflows/validate.yml/runs?head_sha=${revision}&branch=main&event=push&per_page=5`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "Sankhala-Deployment",
            },
            signal: AbortSignal.timeout(20000),
          },
        );
        if (!response.ok)
          throw new Error("GitHub validation status could not be verified.");
        const runs = await response.json();
        const passed = runs.workflow_runs?.some(
          (run) =>
            run.head_sha === revision &&
            run.head_branch === "main" &&
            run.event === "push" &&
            run.status === "completed" &&
            run.conclusion === "success",
        );
        if (!passed) {
          console.log(`Waiting for successful GitHub checks on ${revision}.`);
        } else {
          await mkdir(releases, { recursive: true, mode: 0o711 });
          await chmod(releases, 0o711);
          const release = `${releases}/${revision}`;
          try {
            await stat(release);
            if ((await revisionAtLive()) === revision)
              throw new Error("Refusing to overwrite the live release.");
            if (
              !release.startsWith(`${releases}/`) ||
              !/^\w{40}$/.test(path.basename(release))
            )
              throw new Error("Invalid cleanup target.");
            await rm(release, { recursive: true });
          } catch (error) {
            if (error.code !== "ENOENT") throw error;
          }
          // Apache must traverse the code directory to detect the Passenger app.
          // Credentials and documents remain in the separate owner-only root.
          await mkdir(release, { mode: 0o755 });
          const archive = spawn("git", ["archive", revision], {
              cwd: repository,
              stdio: ["ignore", "pipe", "inherit"],
            }),
            extract = spawn("tar", ["-x", "-C", release], {
              stdio: ["pipe", "inherit", "inherit"],
            });
          const archiveExit = once(archive, "close"),
            extractExit = once(extract, "close");
          archive.stdout.pipe(extract.stdin);
          if ((await archiveExit)[0] !== 0 || (await extractExit)[0] !== 0)
            throw new Error("Release archive extraction failed.");
          await symlink(
            `${privateRoot}/application.env`,
            `${release}/.env.production.local`,
          );
          await writeFile(`${release}/REVISION`, revision);
          await command(node, [npm, "ci", "--include=dev"], release);
          await command(node, [npm, "run", "build:cpanel"], release);
          await command(
            node,
            [
              `--env-file=${privateRoot}/migration.env`,
              "tools/ats/migrate.mjs",
            ],
            release,
          );
          const port = await new Promise((resolve, reject) => {
            const server = createServer();
            server.once("error", reject);
            server.listen(0, "127.0.0.1", () => {
              const port = server.address().port;
              server.close(() => resolve(port));
            });
          });
          const preview = spawn(node, ["app.js"], {
            cwd: release,
            env: { ...process.env, PORT: String(port), NODE_ENV: "production" },
            stdio: "inherit",
          });
          try {
            let ready = false;
            for (let count = 0; count < 30; count++) {
              if (await health(`http://127.0.0.1:${port}`, revision)) {
                ready = true;
                break;
              }
              await delay(1000);
            }
            if (!ready)
              throw new Error(
                "Release preflight failed; current live version was preserved.",
              );
          } finally {
            preview.kill("SIGTERM");
            await once(preview, "close").catch(() => {});
          }
          let oldTarget = null;
          try {
            oldTarget = await readlink(live);
          } catch (error) {
            if (error.code !== "ENOENT") throw error;
          }
          await switchLive(release);
          await restart(oldTarget);
          await restart(release);
          if (!process.argv.includes("--prepare")) {
            let ready = false;
            for (let count = 0; count < 12; count++) {
              if (await health("https://sankhala.ae", revision)) {
                ready = true;
                break;
              }
              await delay(2500);
            }
            if (!ready) {
              if (oldTarget) {
                await switchLive(oldTarget);
                await restart(oldTarget);
                await restart(release);
              }
              throw new Error(
                "Live verification failed; previous release restored when available.",
              );
            }
          }
          await publishFavicon(release);
          console.log(
            `Sankhala release ready: ${revision}${process.argv.includes("--prepare") ? "; first application registration is pending" : "; live HTTPS health verified"}.`,
          );
        }
      }
    } finally {
      await db.query("SELECT RELEASE_LOCK('sankhala_ats_deploy')");
    }
} finally {
  await db.end();
}
