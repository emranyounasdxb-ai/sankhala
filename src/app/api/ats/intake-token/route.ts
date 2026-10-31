import { failure, intakeToken, requireBackend } from "@/lib/ats/http";
export function GET() {
  try {
    requireBackend();
    return Response.json(
      { token: intakeToken() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
