import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

if (
  process.env.ATS_DB_NAME !== "sankhala_ats" ||
  !process.env.ATS_AV_COMMAND?.startsWith("/home/sankhala/.local/")
)
  throw new Error("Use the Sankhala production scanner configuration.");
await promisify(execFile)(
  path.join(path.dirname(process.env.ATS_AV_COMMAND), "freshclam"),
  [`--config-file=${process.env.ATS_PRIVATE_ROOT}/antivirus/freshclam.conf`],
  {
    env: {
      ...process.env,
      LD_LIBRARY_PATH: process.env.ATS_AV_LIBRARY_PATH,
      CVD_CERTS_DIR: process.env.ATS_AV_CERTIFICATES,
    },
    timeout: 300000,
    maxBuffer: 2 * 1024 * 1024,
  },
);
console.log("Signed antivirus definitions verified and updated.");
