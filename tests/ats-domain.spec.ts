import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";
import {
  candidateSubmissionSchema,
  normalizedIdentity,
  vacancySchema,
} from "../src/lib/ats/domain";
import { exportCsv, exportXlsx } from "../src/lib/ats/export";
import { notificationMessage } from "../src/lib/ats/notifications";
import { mayAccess } from "../src/lib/ats/permissions";

// biome-ignore lint/correctness/noEmptyPattern: Playwright requires a fixture pattern before TestInfo.
test.beforeEach(({}, info) =>
  test.skip(
    info.project.name !== "desktop",
    "Pure server/domain contracts are shared across browser projects.",
  ),
);
const candidate = {
  fullName: "Test candidate",
  email: "test@example.com",
  phone: "+971 50 123 4567",
  country: "UAE",
  emirate: "Dubai",
  preferredLocation: "Dubai",
  totalExperienceYears: 4,
  uaeExperienceYears: 2,
  lastJobTitle: "Driver",
  skills: "Driving",
  languages: "English",
  qualifications: "Secondary education",
  availability: "Immediate",
  expectedMonthlySalaryAed: 3000,
  visaType: "Not applicable",
  licenceCategory: "Light vehicle",
  consent: true,
  consentVersion: "recruitment-v1",
};
test("applicant validation rejects consent, experience and mass-assignment attacks", () => {
  expect(candidateSubmissionSchema.parse(candidate).phone).toBe(
    "+971501234567",
  );
  expect(
    candidateSubmissionSchema.safeParse({ ...candidate, consent: false })
      .success,
  ).toBe(false);
  expect(
    candidateSubmissionSchema.safeParse({ ...candidate, uaeExperienceYears: 8 })
      .success,
  ).toBe(false);
  expect(
    candidateSubmissionSchema.safeParse({ ...candidate, emirate: undefined })
      .success,
  ).toBe(false);
  for (const field of [
    "candidateId",
    "clientId",
    "category",
    "status",
    "assignedRecruiter",
    "role",
  ])
    expect(
      candidateSubmissionSchema.safeParse({ ...candidate, [field]: "attacker" })
        .success,
    ).toBe(false);
  expect(normalizedIdentity(" TEST@EXAMPLE.COM ", "+971 50 123 4567")).toEqual({
    email: "test@example.com",
    phone: "+971501234567",
  });
});
test("publication requires complete terms and employer confirmation", () => {
  const job = {
    title: "Driver",
    category: "Drivers & Transport",
    employerKind: "sankhala",
    clientId: null,
    country: "UAE",
    emirate: "Dubai",
    location: "Deira",
    vacancies: 2,
    salaryMinAed: 2500,
    salaryMaxAed: 3500,
    dutyHours: "Employer-confirmed schedule",
    weeklyOff: "Employer-confirmed day",
    experience: "Two years",
    requiredCertification: "Required driving licence",
    benefits: "Employer-confirmed benefits",
    description: "Role responsibilities",
    closingDate: "2026-12-31",
    employerConfirmed: true,
    status: "published",
  };
  expect(vacancySchema.safeParse(job).success).toBe(true);
  expect(
    vacancySchema.safeParse({ ...job, employerConfirmed: false }).success,
  ).toBe(false);
  expect(
    vacancySchema.safeParse({ ...job, employerKind: "client" }).success,
  ).toBe(false);
  expect(vacancySchema.safeParse({ ...job, salaryMaxAed: 1000 }).success).toBe(
    false,
  );
});
test("staff scope denies anonymous, inactive and unassigned access", () => {
  const scope = { assignedRecruiterId: "r1", assignedStaffIds: ["m1"] };
  expect(mayAccess(null, "view", scope)).toBe(false);
  expect(
    mayAccess({ id: "a", role: "admin", active: false }, "export", scope),
  ).toBe(false);
  expect(
    mayAccess({ id: "r2", role: "recruiter", active: true }, "document", scope),
  ).toBe(false);
  expect(
    mayAccess({ id: "r1", role: "recruiter", active: true }, "stage", scope),
  ).toBe(true);
  expect(
    mayAccess(
      { id: "m1", role: "hiring_manager", active: true },
      "view",
      scope,
    ),
  ).toBe(true);
  expect(
    mayAccess(
      { id: "m1", role: "hiring_manager", active: true },
      "manage_staff",
      scope,
    ),
  ).toBe(false);
  expect(
    mayAccess(
      { id: "m1", role: "hiring_manager", active: true },
      "export",
      scope,
    ),
  ).toBe(false);
});
test("CSV and XLSX exports preserve Unicode and neutralize formulas", () => {
  const csv = strFromU8(
    exportCsv(
      ["Candidate", "Notes"],
      [
        ["Ahmed علی", '=HYPERLINK("bad")'],
        ["Sara", " +1+1"],
      ],
    ),
  );
  expect(csv).toContain("Ahmed علی");
  expect(csv).toContain("'=HYPERLINK");
  expect(csv).toContain("' +1+1");
  const zip = unzipSync(
    exportXlsx(
      ["Candidate", "Notes"],
      [
        ["Ahmed علی", "=1+1"],
        ["A & B", "<script>"],
      ],
    ),
  );
  const sheet = strFromU8(zip["xl/worksheets/sheet1.xml"]);
  expect(sheet).toContain('t="inlineStr"');
  expect(sheet).not.toContain("<f>");
  expect(sheet).toContain("Ahmed علی");
  expect(sheet).toContain("A &amp; B");
  expect(sheet).toContain("&lt;script&gt;");
});
test("notifications identify the application and keep the admin link in the configured origin", () => {
  const payload = {
    kind: "candidate_receipt" as const,
    applicationId: "550e8400-e29b-41d4-a716-446655440000",
    reference: "APP-00125",
    candidateName: "Test candidate",
    candidateEmail: "candidate@example.com",
    jobTitle: "Light Vehicle Driver",
  };
  expect(
    notificationMessage(payload, "https://sankhala.ae", "admin@sankhala.ae")
      .text,
  ).toContain("Application reference: APP-00125");
  const hr = notificationMessage(
    { ...payload, kind: "hr_new_application" },
    "https://sankhala.ae",
    "admin@sankhala.ae",
  );
  expect(hr.to).toBe("admin@sankhala.ae");
  expect(hr.text).toContain("https://sankhala.ae/admin/applications/");
  expect(() =>
    notificationMessage(payload, "http://evil.example", "admin@sankhala.ae"),
  ).toThrow();
  expect(() =>
    notificationMessage(payload, "ftp://localhost", "admin@sankhala.ae"),
  ).toThrow();
});
