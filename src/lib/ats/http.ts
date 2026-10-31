import { createHmac, timingSafeEqual } from "node:crypto";
import { ZodError } from "zod";
import { atsEnabled, getPool } from "./db";
export class AtsError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireBackend() {
  if (!atsEnabled())
    throw new AtsError(
      503,
      "Online applications are unavailable. Please contact our team.",
    );
}
export function sameOrigin(request: Request) {
  const expected = process.env.ATS_PUBLIC_ORIGIN;
  if (!expected || request.headers.get("origin") !== new URL(expected).origin)
    throw new AtsError(
      403,
      "This request could not be verified. Reload the page and try again.",
    );
}
export function digest(value: string) {
  const key = process.env.BETTER_AUTH_SECRET;
  if (!key) throw new Error("Application secret is missing.");
  return createHmac("sha256", key).update(value).digest("hex");
}
export async function rateLimit(key: string, max: number, seconds: number) {
  const bucket = digest(`${key}:${Math.floor(Date.now() / (seconds * 1000))}`);
  await getPool().execute(
    "INSERT INTO ats_rate_limits(bucket,attempts,expires_at) VALUES(?,1,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL ? SECOND)) ON DUPLICATE KEY UPDATE attempts=attempts+1",
    [bucket, seconds],
  );
  const [[value]] = await getPool().query<import("mysql2").RowDataPacket[]>(
    "SELECT attempts FROM ats_rate_limits WHERE bucket=?",
    [bucket],
  );
  if (Number(value.attempts) > max)
    throw new AtsError(
      429,
      "Too many attempts. Please try again later or contact our team.",
    );
}
export function clientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown"
  ).slice(0, 100);
}
export function intakeToken() {
  const timestamp = Date.now().toString();
  return `${timestamp}.${digest(`intake:${timestamp}`)}`;
}
export function checkIntakeToken(value: string) {
  const [timestamp, signature] = value.split(".");
  const age = Date.now() - Number(timestamp);
  const expected = digest(`intake:${timestamp}`);
  if (
    !signature ||
    Buffer.byteLength(signature) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ||
    age < 1500 ||
    age > 7200000
  )
    throw new AtsError(400, "Please reload the form and try again.");
}
export async function limitedForm(request: Request, max = 15 * 1024 * 1024) {
  if (Number(request.headers.get("content-length")) > max)
    throw new AtsError(
      413,
      "The combined upload is too large. Use files totalling under 15 MB.",
    );
  if (!request.body) throw new AtsError(400, "The application form is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > max) {
        await reader.cancel();
        throw new AtsError(
          413,
          "The combined upload is too large. Use files totalling under 15 MB.",
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    throw new AtsError(400, "The form could not be read. Please try again.");
  }
}
export async function limitedJson(request: Request, max = 200000) {
  if (Number(request.headers.get("content-length")) > max)
    throw new AtsError(413, "The request is too large.");
  if (!request.body) throw new AtsError(400, "The request is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new AtsError(413, "The request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new AtsError(400, "The request could not be read.");
  }
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      {
        error: "Check the highlighted details.",
        fields: Object.fromEntries(
          error.issues.map((issue) => [issue.path.join("."), issue.message]),
        ),
      },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof AtsError)
    return Response.json(
      { error: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  console.error(
    "ATS request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    {
      error:
        "We could not complete this request. Please try again or contact our team.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
