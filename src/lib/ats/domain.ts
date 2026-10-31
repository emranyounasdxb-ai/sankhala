import { z } from "zod";
import { jobCategories } from "@/lib/job-categories";

export const applicationStages = [
  "New",
  "Screening",
  "Shortlisted",
  "Interview",
  "Offered",
  "Hired",
  "Rejected",
] as const;
export const staffRoles = ["admin", "recruiter", "hiring_manager"] as const;
export const emirates = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
] as const;
export const visaTypes = [
  "Not applicable",
  "Visit / tourist",
  "Employment",
  "Residence / family",
  "Golden visa",
  "Other",
] as const;
export const availabilityTypes = [
  "Immediate",
  "30 days",
  "60 days",
  "90 days",
  "Other",
] as const;
export const stageSchema = z.enum(applicationStages);
const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Complete this field.")
    .max(max, `Use no more than ${max} characters.`);
const optionalText = (max: number) => z.string().trim().max(max).default("");
const phone = z
  .string()
  .trim()
  .min(6)
  .max(30)
  .regex(/^\+[1-9][\d\s().-]+$/, "Include an international country code.")
  .transform((value) => `+${value.replace(/\D/g, "")}`)
  .refine(
    (value) => /^\+[1-9]\d{5,14}$/.test(value),
    "Enter a valid international number.",
  );
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Use a valid calendar date.");

// Submission owns a snapshot; it never writes over an existing person's profile.
// Job/category/client/status/recruiter fields are resolved by the server.
export const candidateSubmissionSchema = z
  .object({
    fullName: text(160),
    email: z
      .string()
      .trim()
      .max(254)
      .pipe(z.email({ error: "Enter a valid email address." }))
      .transform((value) => value.toLowerCase()),
    phone,
    country: text(100),
    emirate: z.enum(emirates).optional(),
    preferredLocation: text(160),
    totalExperienceYears: z.number().min(0).max(60),
    uaeExperienceYears: z.number().min(0).max(60),
    lastJobTitle: optionalText(160),
    skills: text(2000),
    languages: text(500),
    qualifications: text(1000),
    availability: z.enum(availabilityTypes),
    availabilityNotes: optionalText(300),
    expectedMonthlySalaryAed: z.number().min(0).max(1000000),
    visaType: z.enum(visaTypes),
    visaExpiry: isoDate.optional(),
    visaNotes: optionalText(300),
    licenceCategory: optionalText(300),
    tradeCertification: optionalText(1000),
    preferredRole: optionalText(160),
    consent: z.literal(true, {
      error: "Confirm recruitment processing consent to continue.",
    }),
    consentVersion: z.literal("recruitment-v1"),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.totalExperienceYears > 0 && !value.lastJobTitle)
      context.addIssue({
        code: "custom",
        path: ["lastJobTitle"],
        message: "Include your current or last job title.",
      });
    if (value.visaType !== "Not applicable" && !value.visaExpiry)
      context.addIssue({
        code: "custom",
        path: ["visaExpiry"],
        message: "Include the applicable visa expiry date.",
      });
    if (value.uaeExperienceYears > value.totalExperienceYears)
      context.addIssue({
        code: "custom",
        path: ["uaeExperienceYears"],
        message: "UAE experience cannot exceed total experience.",
      });
    if (
      ["AE", "UAE", "UNITED ARAB EMIRATES"].includes(
        value.country.toUpperCase(),
      ) &&
      !value.emirate
    )
      context.addIssue({
        code: "custom",
        path: ["emirate"],
        message: "Choose your current emirate.",
      });
    if (value.availability === "Other" && !value.availabilityNotes)
      context.addIssue({
        code: "custom",
        path: ["availabilityNotes"],
        message: "Explain your joining availability.",
      });
    if (value.visaType === "Other" && !value.visaNotes)
      context.addIssue({
        code: "custom",
        path: ["visaNotes"],
        message: "Describe your visa status.",
      });
  });
export type CandidateSubmission = z.infer<typeof candidateSubmissionSchema>;

export const vacancySchema = z
  .object({
    title: text(160),
    category: z.enum(
      jobCategories.map((category) => category.name) as [string, ...string[]],
    ),
    employerKind: z.enum(["sankhala", "client"]),
    clientId: z.uuid().nullable(),
    country: text(100),
    emirate: z.enum(emirates).nullable(),
    location: text(200),
    vacancies: z.number().int().min(1).max(100000),
    salaryMinAed: z.number().min(0),
    salaryMaxAed: z.number().min(0),
    dutyHours: text(300),
    weeklyOff: text(200),
    experience: text(1000),
    requiredCertification: text(1000),
    benefits: text(1500),
    description: text(12000),
    closingDate: isoDate,
    employerConfirmed: z.boolean(),
    status: z.enum(["draft", "published", "closed"]),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.salaryMaxAed < value.salaryMinAed)
      context.addIssue({
        code: "custom",
        path: ["salaryMaxAed"],
        message: "Maximum salary must be at least the minimum.",
      });
    if (value.employerKind === "client" && !value.clientId)
      context.addIssue({
        code: "custom",
        path: ["clientId"],
        message: "Choose the hiring client.",
      });
    if (value.employerKind === "sankhala" && value.clientId)
      context.addIssue({
        code: "custom",
        path: ["clientId"],
        message: "Internal vacancies cannot belong to a client.",
      });
    if (value.status === "published" && !value.employerConfirmed)
      context.addIssue({
        code: "custom",
        path: ["employerConfirmed"],
        message: "Employer confirmation is required before publication.",
      });
  });
export type VacancyInput = z.infer<typeof vacancySchema>;
export type StaffRole = (typeof staffRoles)[number];
export type ApplicationStage = (typeof applicationStages)[number];

export function experienceBand(years: number) {
  return years === 0
    ? "Fresher"
    : years <= 2
      ? "1–2 years"
      : years <= 5
        ? "3–5 years"
        : "5+ years";
}
export function normalizedIdentity(email: string, number: string) {
  return {
    email: email.trim().toLowerCase(),
    phone: `+${number.replace(/\D/g, "")}`,
  };
}
