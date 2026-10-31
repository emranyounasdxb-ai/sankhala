import { getAuth } from "@/lib/ats/auth";
import { atsEnabled } from "@/lib/ats/db";
export const runtime = "nodejs";
function handler(request: Request) {
  if (!atsEnabled())
    return Response.json(
      { error: "Staff sign in is unavailable." },
      { status: 503 },
    );
  return getAuth().handler(request);
}
export const GET = handler;
export const POST = handler;
