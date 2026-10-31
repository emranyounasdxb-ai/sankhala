"use client";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { applicationStages, type CandidateSubmission } from "@/lib/ats/domain";
import { type AdminOptions, adminApi, dateTime } from "./admin-api";
import { Feedback, useAdminResource } from "./admin-workspace";

type Detail = {
  record: {
    id: string;
    reference: string;
    candidate_id: string;
    applied_role: string;
    stage: string;
    version: number;
    assigned_recruiter_id: string | null;
    candidate_snapshot: CandidateSubmission;
    consent_at: string;
    created_at: string;
  };
  candidate: {
    id: string;
    reference: string;
    full_name: string;
    email: string;
    phone: string;
    talent_pool: number;
  };
  history: {
    id: string;
    reference: string;
    applied_role: string;
    stage: string;
    created_at: string;
  }[];
  documents: {
    id: string;
    original_name: string;
    mime: string;
    size_bytes: number;
    kind: string;
    scan_status: string;
  }[];
  stages: {
    id: string;
    old_stage: string | null;
    new_stage: string;
    created_at: string;
    actor_name: string | null;
  }[];
  notes: { id: string; body: string; actor_name: string; created_at: string }[];
  interviews: {
    id: string;
    starts_at: string;
    ends_at: string;
    timezone: string;
    location: string;
    notes: string;
    status: string;
    staff_name: string;
  }[];
  duplicates: {
    id: string;
    reference: string;
    full_name: string;
    email: string;
    phone: string;
    evidence: string;
  }[];
};
const fieldNames: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  phone: "Mobile / WhatsApp",
  country: "Current country",
  emirate: "Current emirate",
  preferredLocation: "Preferred work location",
  totalExperienceYears: "Total experience in years",
  uaeExperienceYears: "UAE experience in years",
  lastJobTitle: "Current or last job title",
  skills: "Skills",
  languages: "Languages",
  qualifications: "Qualifications",
  availability: "Joining availability",
  availabilityNotes: "Availability details",
  expectedMonthlySalaryAed: "Expected monthly salary in AED",
  visaType: "UAE visa type",
  visaExpiry: "Visa expiry",
  visaNotes: "Visa details",
  licenceCategory: "Driving licence category",
  tradeCertification: "Trade or role certification",
  preferredRole: "Preferred role",
};
export function ApplicationDetail({ id }: { id: string }) {
  const [revision, setRevision] = useState(0),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState<string | null>(null);
  const resource = useAdminResource<Detail>(`applications/${id}`, revision),
    options = useAdminResource<AdminOptions>("options", revision);
  const data = resource.data;
  async function change(input: unknown, path = `applications/${id}`) {
    setBusy(true);
    setMessage("");
    try {
      await adminApi(path, input);
      setError(false);
      setMessage("Recruitment record saved.");
      setRevision((value) => value + 1);
      return true;
    } catch (error) {
      setError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "This change could not be saved.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function note(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await change({ action: "note", body: new FormData(form).get("body") }))
      form.reset();
  }
  async function interview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      values = new FormData(form);
    if (
      await change({
        action: "interview",
        staffId: values.get("staffId"),
        startsAt: new Date(String(values.get("startsAt"))).toISOString(),
        endsAt: new Date(String(values.get("endsAt"))).toISOString(),
        timezone: "Asia/Dubai",
        location: values.get("location"),
        notes: values.get("notes"),
      })
    )
      form.reset();
  }
  if (!data || !options.data)
    return (
      <div className="stack">
        <Feedback message={resource.error || options.error} error />
        <div
          className="ats-loading"
          role="status"
          aria-label="Loading application"
          aria-busy="true"
        />
      </div>
    );
  const staff = options.data.staff,
    users = options.data.users.filter((user) => user.active);
  return (
    <div className="stack">
      <header className="ats-admin-heading">
        <div>
          <Link href="/admin?tab=applications" className="inline-link">
            Back to applications
          </Link>
          <p className="eyebrow">{data.record.reference}</p>
          <h1>{data.candidate.full_name}</h1>
          <p>
            {data.record.applied_role} · Received{" "}
            {dateTime(data.record.created_at)}
          </p>
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setRevision((value) => value + 1)}
          disabled={busy}
        >
          Refresh record
        </button>
      </header>
      <Feedback message={resource.error || options.error} error />
      <Feedback message={message} error={error} />
      <div className="ats-detail-grid">
        <div className="stack">
          <section className="ats-admin-panel stack">
            <h2>Details submitted with this application</h2>
            <p>
              Candidate reference: <strong>{data.candidate.reference}</strong>.
              Application and candidate IDs remain separate.
            </p>
            <dl>
              {Object.entries(data.record.candidate_snapshot)
                .filter(
                  ([key, value]) =>
                    key in fieldNames &&
                    value !== "" &&
                    value !== null &&
                    value !== undefined,
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{fieldNames[key]}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
            </dl>
            <p className="field-hint">
              Recruitment consent recorded {dateTime(data.record.consent_at)}.
            </p>
          </section>
          <section className="ats-admin-panel stack">
            <h2>Private documents</h2>
            <p>
              Only files that pass security checks can be opened or downloaded.
            </p>
            {data.documents.map((document) => (
              <div key={document.id} className="ats-record-item stack">
                <p>
                  <strong>
                    {document.original_name || "Deleted document"}
                  </strong>{" "}
                  · {document.kind} · {Math.ceil(document.size_bytes / 1024)} KB
                </p>
                <p>Security check: {document.scan_status}</p>
                {document.scan_status === "clean" && (
                  <div className="ats-actions">
                    {document.mime === "application/pdf" && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() =>
                          setPreview(
                            preview === document.id ? null : document.id,
                          )
                        }
                      >
                        {preview === document.id
                          ? "Close CV preview"
                          : "Preview PDF"}
                      </button>
                    )}
                    <a
                      className="button button-secondary"
                      href={`/api/ats/admin/documents/${document.id}`}
                    >
                      Download document
                    </a>
                  </div>
                )}
              </div>
            ))}
            {preview && (
              <iframe
                src={`/api/ats/admin/documents/${preview}?preview=true`}
                title="Private recruitment document preview"
              />
            )}
          </section>
          <section className="ats-admin-panel stack">
            <h2>Recruiter notes</h2>
            {data.notes.length ? (
              data.notes.map((note) => (
                <article key={note.id} className="ats-record-item">
                  <p>{note.body}</p>
                  <p className="field-hint">
                    {note.actor_name} · {dateTime(note.created_at)}
                  </p>
                </article>
              ))
            ) : (
              <p>No notes yet.</p>
            )}
            <form onSubmit={note} className="stack">
              <label htmlFor="application-note">
                Add a recruitment note
                <textarea
                  id="application-note"
                  name="body"
                  required
                  maxLength={5000}
                />
              </label>
              <button
                type="submit"
                className="button button-primary"
                disabled={busy}
              >
                Save note
              </button>
            </form>
          </section>
          <section className="ats-admin-panel stack">
            <h2>Interviews</h2>
            {data.interviews.map((interview) => (
              <div key={interview.id} className="ats-record-item">
                <p>
                  <strong>
                    {dateTime(interview.starts_at)} –{" "}
                    {dateTime(interview.ends_at)} (Dubai time)
                  </strong>
                </p>
                <p>
                  {interview.staff_name} · {interview.status}
                </p>
                <p>{interview.location}</p>
                <p>{interview.notes}</p>
              </div>
            ))}
            <form onSubmit={interview} className="stack">
              <div className="ats-edit-grid">
                <label htmlFor="interview-staff">
                  Interview with
                  <select id="interview-staff" name="staffId" required>
                    <option value="">Choose assigned staff</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor="interview-start">
                  Start (your device timezone)
                  <input
                    id="interview-start"
                    name="startsAt"
                    type="datetime-local"
                    required
                  />
                </label>
                <label htmlFor="interview-end">
                  End (your device timezone)
                  <input
                    id="interview-end"
                    name="endsAt"
                    type="datetime-local"
                    required
                  />
                </label>
                <label className="wide" htmlFor="interview-location">
                  Location or meeting link
                  <input
                    id="interview-location"
                    name="location"
                    required
                    maxLength={500}
                  />
                </label>
                <label className="wide" htmlFor="interview-notes">
                  Interview notes (optional)
                  <textarea
                    id="interview-notes"
                    name="notes"
                    maxLength={3000}
                  />
                </label>
              </div>
              <p className="field-hint">
                The calendar uses your device timezone. Saved interview times
                are shown in Dubai time.
              </p>
              <button
                type="submit"
                className="button button-primary"
                disabled={busy}
              >
                Schedule interview
              </button>
            </form>
          </section>
        </div>
        <aside className="stack">
          <section className="ats-admin-panel stack">
            <h2>Application stage</h2>
            {staff.role === "hiring_manager" ? (
              <p className="ats-pill">{data.record.stage}</p>
            ) : (
              <form
                key={data.record.version}
                className="stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  change({
                    action: "stage",
                    stage: new FormData(event.currentTarget).get("stage"),
                    version: data.record.version,
                  });
                }}
              >
                <label htmlFor="application-stage">
                  Current stage
                  <select
                    id="application-stage"
                    name="stage"
                    defaultValue={data.record.stage}
                  >
                    {applicationStages.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={busy}
                >
                  Update stage
                </button>
              </form>
            )}
            {staff.role === "admin" && (
              <form
                key={`assign-${data.record.version}`}
                className="stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  change({
                    action: "assign",
                    recruiterId:
                      new FormData(event.currentTarget).get("recruiter") ||
                      null,
                    version: data.record.version,
                  });
                }}
              >
                <label htmlFor="application-recruiter">
                  Assigned recruiter
                  <select
                    id="application-recruiter"
                    name="recruiter"
                    defaultValue={data.record.assigned_recruiter_id ?? ""}
                  >
                    <option value="">Unassigned</option>
                    {users
                      .filter((user) => user.role !== "hiring_manager")
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="button button-secondary"
                  disabled={busy}
                >
                  Save assignment
                </button>
              </form>
            )}
            {staff.role !== "hiring_manager" && (
              <button
                type="button"
                className="button button-secondary"
                disabled={busy}
                onClick={() =>
                  change({
                    action: "pool",
                    enabled: !data.candidate.talent_pool,
                  })
                }
              >
                {data.candidate.talent_pool
                  ? "Remove from Talent Pool"
                  : "Add to Talent Pool"}
              </button>
            )}
          </section>
          <section className="ats-admin-panel stack">
            <h2>Hiring history</h2>
            {data.history.map((application) => (
              <article key={application.id} className="ats-record-item">
                <Link
                  href={`/admin/applications/${application.id}`}
                  className="inline-link"
                >
                  {application.applied_role}
                </Link>
                <p>
                  {application.reference} · {application.stage}
                </p>
                <p className="field-hint">{dateTime(application.created_at)}</p>
              </article>
            ))}
          </section>
          <section className="ats-admin-panel stack">
            <h2>Status history</h2>
            <ol className="ats-timeline">
              {data.stages.map((stage) => (
                <li key={stage.id}>
                  <p>
                    {stage.old_stage ? `${stage.old_stage} → ` : ""}
                    <strong>{stage.new_stage}</strong>
                  </p>
                  <time dateTime={stage.created_at}>
                    {dateTime(stage.created_at)}
                  </time>
                  <p>{stage.actor_name ?? "Application received"}</p>
                </li>
              ))}
            </ol>
          </section>
          {data.duplicates.length > 0 && (
            <section className="ats-admin-panel stack">
              <h2>Possible duplicate profiles</h2>
              <p>
                A matching email or phone does not prove identity. Verify the
                candidate before linking records. Submission details are
                preserved.
              </p>
              {data.duplicates.map((match) => (
                <form
                  key={match.id}
                  className="ats-record-item stack"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const values = new FormData(event.currentTarget);
                    change(
                      {
                        matchId: match.id,
                        resolution: values.get("resolution"),
                        verified: values.get("verified") === "on",
                      },
                      "duplicates",
                    );
                  }}
                >
                  <p>
                    <strong>{match.full_name}</strong> · {match.reference}
                  </p>
                  <p>
                    {match.email}
                    <br />
                    {match.phone}
                  </p>
                  <p>Matching: {match.evidence}</p>
                  <label htmlFor={`duplicate-${match.id}`}>
                    Review result
                    <select id={`duplicate-${match.id}`} name="resolution">
                      <option value="different">
                        These are different people
                      </option>
                      <option value="link">
                        Link to this existing candidate
                      </option>
                    </select>
                  </label>
                  <label className="ats-check-label">
                    <input name="verified" type="checkbox" required />I verified
                    the records and this decision.
                  </label>
                  <button
                    className="button button-secondary"
                    type="submit"
                    disabled={busy}
                  >
                    Save duplicate review
                  </button>
                </form>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
