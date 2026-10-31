import { timingSafeEqual } from "node:crypto";
import { getPool } from "@/lib/ats/db";
import { privateRoot } from "@/lib/ats/storage";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const expected = process.env.ATS_HEALTH_TOKEN ?? "",
    provided = request.headers.get("x-health-key") ?? "";
  if (
    !expected ||
    Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  )
    return new Response(null, { status: 401 });
  try {
    await getPool().execute("SELECT 1");
    await privateRoot();
    return Response.json(
      {
        ok: true,
        revision: process.env.ATS_RELEASE_SHA ?? null,
        node: process.version,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
