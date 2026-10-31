import { z } from "zod";
import {
  AtsError,
  checkIntakeToken,
  clientAddress,
  failure,
  limitedForm,
  rateLimit,
  requireBackend,
  sameOrigin,
} from "@/lib/ats/http";
import { checkUpload } from "@/lib/ats/storage";
import { saveApplication } from "@/lib/ats/submission";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireBackend();
    sameOrigin(request);
    await rateLimit(`submission-ip:${clientAddress(request)}`, 20, 3600);
    const form = await limitedForm(request);
    if (form.get("website"))
      throw new AtsError(400, "This request could not be accepted.");
    checkIntakeToken(String(form.get("token") ?? ""));
    let details: unknown;
    try {
      details = JSON.parse(String(form.get("details") ?? ""));
    } catch {
      throw new AtsError(400, "The application details could not be read.");
    }
    const email = z
      .object({ email: z.string().trim().toLowerCase().max(254) })
      .parse(details).email;
    await rateLimit(`submission-email:${email}`, 5, 3600);
    const cv = form.get("cv"),
      certificates = form.getAll("certificates");
    if (!(cv instanceof File) || certificates.length > 2)
      throw new AtsError(
        422,
        "Include one CV and up to two optional certificates.",
      );
    const files = [await checkUpload(cv, "cv")];
    for (const file of certificates) {
      if (!(file instanceof File))
        throw new AtsError(422, "Choose a valid certificate file.");
      files.push(await checkUpload(file, "certificate"));
    }
    const value = await saveApplication(
      details,
      form.get("jobId") ? String(form.get("jobId")) : null,
      String(form.get("idempotencyKey") ?? ""),
      files,
    );
    return Response.json(
      {
        ...value,
        message:
          "Your application has been received. Our recruitment team will review it.",
      },
      {
        status: value.duplicate ? 200 : 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return failure(error);
  }
}
