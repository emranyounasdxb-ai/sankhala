import nodemailer from "nodemailer";
import { z } from "zod";

const notificationSchema = z.object({
  kind: z.enum(["candidate_receipt", "hr_new_application"]),
  applicationId: z.uuid(),
  reference: z.string().regex(/^APP-[A-Z0-9-]+$/),
  candidateName: z.string().trim().min(1).max(160),
  candidateEmail: z.email(),
  jobTitle: z.string().trim().min(1).max(160),
});
export type ApplicationNotification = z.infer<typeof notificationSchema>;

export function notificationMessage(
  input: ApplicationNotification,
  origin: string,
  hrEmail: string,
) {
  const value = notificationSchema.parse(input);
  const url = new URL(origin);
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["127.0.0.1", "localhost"].includes(url.hostname)
      ))
  )
    throw new Error("Use the configured public HTTPS application origin.");
  z.email().parse(hrEmail);
  if (value.kind === "candidate_receipt")
    return {
      to: value.candidateEmail,
      subject: `Application received: ${value.reference}`,
      text: `Hello ${value.candidateName},\n\nYour application for ${value.jobTitle} has been received. Application reference: ${value.reference}.\n\nOur recruitment team will review your application. This receipt does not guarantee an interview or an offer.\n\nSankhala Employment`,
    };
  return {
    to: hrEmail,
    subject: `New application: ${value.reference}`,
    text: `A new application has been saved.\n\nCandidate: ${value.candidateName}\nJob: ${value.jobTitle}\nReference: ${value.reference}\n\nSign in to review:\n${new URL(`/admin/applications/${value.applicationId}`, url).href}`,
  };
}

/** Only the durable outbox worker may call this after a committed submission. */
export async function deliverNotification(input: ApplicationNotification) {
  const config = z
    .object({
      host: z.string().min(1),
      port: z.coerce.number().int().positive(),
      user: z.string().min(1),
      password: z.string().min(1),
      from: z.email(),
      origin: z.url(),
      hr: z.email(),
    })
    .parse({
      host: process.env.ATS_SMTP_HOST,
      port: process.env.ATS_SMTP_PORT ?? "465",
      user: process.env.ATS_SMTP_USER,
      password: process.env.ATS_SMTP_PASSWORD,
      from: process.env.ATS_SMTP_FROM,
      origin: process.env.ATS_PUBLIC_ORIGIN,
      hr: process.env.ATS_HR_EMAIL,
    });
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: true,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });
  const result = await transport.sendMail({
    from: config.from,
    ...notificationMessage(input, config.origin, config.hr),
    messageId: `<${input.kind}.${input.applicationId}@${new URL(config.origin).hostname}>`,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  if (!result.accepted.length || result.rejected.length)
    throw new Error("SMTP did not accept the recipient.");
  return { messageId: result.messageId };
}
