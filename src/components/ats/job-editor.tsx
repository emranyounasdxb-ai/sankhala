"use client";
import { type FormEvent, useRef, useState } from "react";
import { emirates, type VacancyInput, vacancySchema } from "@/lib/ats/domain";
import { jobCategories } from "@/lib/job-categories";
import { type AdminOptions, adminApi } from "./admin-api";
export type AdminJob = {
  id: string;
  reference: string;
  title: string;
  status: string;
  version: number;
  applicant_count: number;
  data: VacancyInput;
  staffIds: string[];
};
export function JobEditor({
  record,
  options,
  onSaved,
  onCancel,
}: {
  record?: AdminJob;
  options: AdminOptions;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const job = record?.data;
  const [kind, setKind] = useState(job?.employerKind ?? "sankhala"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const field = (
    name: keyof VacancyInput,
    label: string,
    type = "text",
    wide = false,
  ) => (
    <div className={wide ? "wide" : ""} key={name}>
      <label htmlFor={`job-${name}`}>{label}</label>
      <input
        id={`job-${name}`}
        name={name}
        type={type}
        defaultValue={
          typeof job?.[name] === "string" || typeof job?.[name] === "number"
            ? String(job[name])
            : name === "country"
              ? "UAE"
              : name === "vacancies"
                ? 1
                : undefined
        }
        required
        min={type === "number" ? 0 : undefined}
        maxLength={200}
        step={type === "number" ? "1" : undefined}
      />
    </div>
  );
  const area = (name: keyof VacancyInput, label: string) => (
    <div className="wide" key={name}>
      <label htmlFor={`job-${name}`}>{label}</label>
      <textarea
        id={`job-${name}`}
        name={name}
        defaultValue={String(job?.[name] ?? "")}
        required
        maxLength={name === "description" ? 12000 : 1500}
      />
    </div>
  );
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget),
      value = Object.fromEntries(
        [...form.entries()].filter(([name]) => name !== "assignedStaff"),
      );
    const parsed = vacancySchema.safeParse({
      ...value,
      employerKind: kind,
      clientId: kind === "client" ? String(value.clientId) : null,
      emirate: value.emirate || null,
      vacancies: Number(value.vacancies),
      salaryMinAed: Number(value.salaryMinAed),
      salaryMaxAed: Number(value.salaryMaxAed),
      employerConfirmed: value.employerConfirmed === "on",
    });
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((issue) => `${issue.path.join(" ")}: ${issue.message}`)
          .join(" · "),
      );
      setBusy(false);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    try {
      await adminApi("jobs", {
        ...(record ? { id: record.id, version: record.version } : {}),
        job: parsed.data,
        staffIds: form.getAll("assignedStaff").map(String),
      });
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Job could not be saved.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="ats-admin-panel stack"
      aria-labelledby="job-editor-heading"
    >
      <h2 id="job-editor-heading">
        {record ? "Edit vacancy" : "Create a confirmed vacancy"}
      </h2>
      <p>
        Only publish roles that are available and confirmed by the hiring
        employer. Applications keep the job terms that applied when submitted.
      </p>
      <form onSubmit={save} className="stack">
        <div className="ats-edit-grid">
          {field("title", "Job title")}
          <div>
            <label htmlFor="job-category">Category</label>
            <select
              id="job-category"
              name="category"
              defaultValue={job?.category}
              required
            >
              <option value="">Choose a category</option>
              {jobCategories.map((category) => (
                <option key={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="job-employerKind">Hiring group</label>
            <select
              id="job-employerKind"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as "sankhala" | "client")
              }
            >
              <option value="sankhala">Jobs at Sankhala</option>
              <option value="client">Jobs with our clients</option>
            </select>
          </div>
          {kind === "client" && (
            <div>
              <label htmlFor="job-client">Client company</label>
              <select
                id="job-client"
                name="clientId"
                defaultValue={job?.clientId ?? ""}
                required
              >
                <option value="">Choose a client</option>
                {options.clients
                  .filter((client) => client.active !== 0)
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {field("country", "Country")}
          {field("location", "Work location")}
          <div>
            <label htmlFor="job-emirate">Emirate</label>
            <select
              id="job-emirate"
              name="emirate"
              defaultValue={job?.emirate ?? ""}
            >
              <option value="">Outside UAE / not applicable</option>
              {emirates.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          {field("vacancies", "Number of vacancies", "number")}
          {field("salaryMinAed", "Minimum monthly salary in AED", "number")}
          {field("salaryMaxAed", "Maximum monthly salary in AED", "number")}
          {field("closingDate", "Closing date", "date")}
          {field("dutyHours", "Duty hours")}
          {field("weeklyOff", "Weekly off")}
          {area("experience", "Experience requirements")}
          {area("requiredCertification", "Required licence or certification")}
          {area("benefits", "Confirmed benefits")}
          {area("description", "Role responsibilities and requirements")}
          <div>
            <label htmlFor="job-status">Publication status</label>
            <select
              id="job-status"
              name="status"
              defaultValue={job?.status ?? "draft"}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="wide">
            <label htmlFor="job-confirmed" className="ats-check-label">
              <input
                id="job-confirmed"
                name="employerConfirmed"
                type="checkbox"
                defaultChecked={job?.employerConfirmed}
              />
              The employer has confirmed the vacancy and these terms.
            </label>
          </div>
          <fieldset className="wide">
            <legend>Assigned recruitment team</legend>
            <div className="ats-actions">
              {options.users
                .filter((user) => user.active)
                .map((user) => (
                  <label className="ats-check-label" key={user.id}>
                    <input
                      type="checkbox"
                      name="assignedStaff"
                      value={user.id}
                      defaultChecked={record?.staffIds.includes(user.id)}
                    />
                    {user.name} ({user.role.replace("_", " ")})
                  </label>
                ))}
            </div>
          </fieldset>
        </div>
        {error && (
          <p className="field-error" role="alert" tabIndex={-1} ref={errorRef}>
            {error}
          </p>
        )}
        <div className="ats-actions">
          <button
            className="button button-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving vacancy…" : "Save vacancy"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
