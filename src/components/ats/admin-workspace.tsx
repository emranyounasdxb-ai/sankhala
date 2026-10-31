"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  applicationStages,
  availabilityTypes,
  emirates,
} from "@/lib/ats/domain";
import { jobCategories } from "@/lib/job-categories";
import {
  type AdminOptions,
  type AdminUser,
  type AppSummary,
  adminApi,
  dateTime,
} from "./admin-api";
import { type AdminJob, JobEditor } from "./job-editor";
export function useAdminResource<T>(path: string, revision = 0) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    void revision;
    let active = true;
    setLoading(true);
    setError("");
    adminApi<T>(path)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((error) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load recruitment records.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return { data, error, loading };
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ats-admin-panel ats-empty">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Feedback({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  return message ? (
    <div
      className="ats-feedback"
      data-error={error}
      role={error ? "alert" : "status"}
    >
      {message}
    </div>
  ) : null;
}
export function AdminWorkspace({ tab, query }: { tab: string; query: string }) {
  const [revision, setRevision] = useState(0),
    [message, setMessage] = useState("");
  const {
    data: options,
    error,
    loading,
  } = useAdminResource<AdminOptions>("options", revision);
  const refresh = () => setRevision((value) => value + 1);
  const title =
    (
      {
        overview: "Recruitment overview",
        applications: "Applications",
        candidates: "Candidate database",
        jobs: "Vacancies",
        clients: "Client companies",
        team: "Team access",
        activity: "Activity history",
        retention: "Data retention",
        account: "My account",
      } as Record<string, string>
    )[tab] ?? "Applications";
  return (
    <div className="stack">
      <header className="ats-admin-heading">
        <div>
          <p className="eyebrow">Private workspace</p>
          <h1>{title}</h1>
          <p>
            Manage your recruitment work across Sankhala and client vacancies.
          </p>
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={refresh}
          disabled={loading}
        >
          Refresh
        </button>
      </header>
      <Feedback message={error} error />
      <Feedback message={message} />
      {!options ? (
        <div
          className="ats-loading"
          role="status"
          aria-label="Loading recruitment workspace"
          aria-busy="true"
        />
      ) : tab === "overview" ? (
        <Overview revision={revision} />
      ) : tab === "jobs" ? (
        <Jobs
          options={options}
          revision={revision}
          onSaved={() => {
            setMessage("Vacancy saved.");
            refresh();
          }}
        />
      ) : tab === "clients" ? (
        <Clients
          options={options}
          onSaved={() => {
            setMessage("Client company added.");
            refresh();
          }}
        />
      ) : tab === "team" ? (
        <Team
          options={options}
          onSaved={() => {
            setMessage(
              "Team access saved. Existing sessions for this user have been ended.",
            );
            refresh();
          }}
        />
      ) : tab === "candidates" ? (
        <Candidates revision={revision} />
      ) : tab === "activity" ? (
        <Activity revision={revision} />
      ) : tab === "retention" ? (
        <Retention
          revision={revision}
          onSaved={() => {
            setMessage("Retention review saved.");
            refresh();
          }}
        />
      ) : tab === "account" ? (
        <Account />
      ) : (
        <Applications options={options} query={query} revision={revision} />
      )}
    </div>
  );
}
function Overview({ revision }: { revision: number }) {
  const { data, error, loading } = useAdminResource<{
    counts: { total: number; unread: number; hired: number };
    stages: { stage: string; count: number }[];
    jobs: { job_id: string | null; title: string; count: number }[];
    operational: {
      emails_pending: number;
      scans_pending: number;
      duplicates: number;
      retention_pending: number;
    } | null;
  }>("stats", revision);
  return (
    <>
      <Feedback message={error} error />
      {loading && !data ? (
        <div className="ats-loading" aria-busy="true" />
      ) : (
        data && (
          <>
            <div className="ats-stats">
              {[
                ["Total applications", data.counts.total],
                ["New / unread", data.counts.unread],
                ["Hired", data.counts.hired],
              ].map(([label, count]) => (
                <div className="ats-admin-panel ats-stat" key={label}>
                  <span>{label}</span>
                  <strong>{Number(count)}</strong>
                </div>
              ))}
            </div>
            <div className="ats-split">
              <section className="ats-admin-panel stack">
                <h2>Applications by stage</h2>
                {data.stages.length ? (
                  data.stages.map((value) => (
                    <p key={value.stage}>
                      <span className="ats-pill" data-stage={value.stage}>
                        {value.stage}
                      </span>{" "}
                      <strong>{value.count}</strong>
                    </p>
                  ))
                ) : (
                  <p>No applications have been received yet.</p>
                )}
              </section>
              <section className="ats-admin-panel stack">
                <h2>Applicants by role</h2>
                {data.jobs.length ? (
                  data.jobs.map((value) => (
                    <p key={`${value.job_id}:${value.title}`}>
                      <Link
                        className="inline-link"
                        href={`/admin?tab=applications${value.job_id ? `&job=${value.job_id}` : ""}`}
                      >
                        {value.title}
                      </Link>{" "}
                      — {value.count}
                    </p>
                  ))
                ) : (
                  <p>
                    Confirmed vacancies and received applications will appear
                    here.
                  </p>
                )}
              </section>
            </div>
            {data.operational && (
              <section className="ats-admin-panel stack">
                <h2>Needs attention</h2>
                <p>
                  {data.operational.emails_pending} email notifications awaiting
                  delivery.
                </p>
                <p>
                  {data.operational.scans_pending} documents awaiting a
                  successful security check.
                </p>
                <p>
                  {data.operational.duplicates} possible duplicate profiles to
                  review.
                </p>
                <p>
                  {data.operational.retention_pending} retention requests
                  awaiting completion.
                </p>
              </section>
            )}
          </>
        )
      )}
    </>
  );
}
function Applications({
  options,
  query,
  revision,
}: {
  options: AdminOptions;
  query: string;
  revision: number;
}) {
  const router = useRouter();
  const { data, error, loading } = useAdminResource<{
    records: AppSummary[];
    total: number;
    page: number;
    limit: number;
  }>(`applications?${query}`, revision);
  const [selected, setSelected] = useState<string[]>([]),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  const initial = new URLSearchParams(query);
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget),
      params = new URLSearchParams({ tab: "applications" });
    for (const [key, value] of values)
      if (typeof value === "string" && value) params.set(key, value);
    router.push(`/admin?${params}`);
  }
  const select = (
    name: string,
    label: string,
    values: { value: string; label: string }[],
  ) => (
    <div key={name}>
      <label htmlFor={`filter-${name}`}>{label}</label>
      <select
        name={name}
        id={`filter-${name}`}
        defaultValue={initial.get(name) ?? ""}
      >
        <option value="">All</option>
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
    </div>
  );
  async function download(format: "csv" | "xlsx") {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch("/api/ats/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, format }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Export failed.");
      }
      const blob = await response.blob(),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `sankhala-applications.${format}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="stack">
      <form
        onSubmit={filter}
        className="ats-admin-panel stack"
        aria-label="Filter applications"
      >
        <div className="ats-filter-grid">
          <div>
            <label htmlFor="filter-q">
              Search name, email, phone or reference
            </label>
            <input
              id="filter-q"
              name="q"
              defaultValue={initial.get("q") ?? ""}
              maxLength={160}
            />
          </div>
          {select(
            "stage",
            "Application stage",
            applicationStages.map((value) => ({ value, label: value })),
          )}
          {select(
            "job",
            "Applied job",
            options.jobs.map((job) => ({ value: job.id, label: job.title })),
          )}
          {select(
            "category",
            "Job category",
            jobCategories.map((category) => ({
              value: category.name,
              label: category.name,
            })),
          )}
          {select(
            "client",
            "Client company",
            options.clients.map((client) => ({
              value: client.id,
              label: client.name,
            })),
          )}
          {select(
            "emirate",
            "Current emirate",
            emirates.map((value) => ({ value, label: value })),
          )}
          <div>
            <label htmlFor="filter-country">Current country</label>
            <input
              id="filter-country"
              name="country"
              defaultValue={initial.get("country") ?? ""}
              maxLength={100}
            />
          </div>
          {select("experience", "Total experience", [
            { value: "fresher", label: "Fresher" },
            { value: "1-2", label: "Up to 2 years" },
            { value: "3-5", label: "More than 2, up to 5 years" },
            { value: "5+", label: "More than 5 years" },
          ])}
          {select(
            "availability",
            "Availability",
            availabilityTypes.map((value) => ({ value, label: value })),
          )}
          {select(
            "recruiter",
            "Assigned recruiter",
            options.users
              .filter((user) => user.active && user.role !== "hiring_manager")
              .map((user) => ({ value: user.id, label: user.name })),
          )}
          {(["from", "to"] as const).map((name) => (
            <div key={name}>
              <label htmlFor={`filter-${name}`}>
                {name === "from" ? "Applied from" : "Applied through"}
              </label>
              <input
                id={`filter-${name}`}
                name={name}
                type="date"
                defaultValue={initial.get(name) ?? ""}
              />
            </div>
          ))}
        </div>
        <div className="ats-actions">
          <label className="ats-check-label">
            <input
              name="unread"
              type="checkbox"
              value="true"
              defaultChecked={initial.get("unread") === "true"}
            />
            Unread only
          </label>
          <label className="ats-check-label">
            <input
              name="pool"
              type="checkbox"
              value="true"
              defaultChecked={initial.get("pool") === "true"}
            />
            Talent Pool only
          </label>
          <button type="submit" className="button button-primary">
            Apply filters
          </button>
          <Link
            href="/admin?tab=applications"
            className="button button-secondary"
          >
            Clear filters
          </Link>
        </div>
      </form>
      <Feedback message={error || exportError} error />
      {data && (
        <>
          <div className="ats-actions">
            <p>
              <strong>{data.total}</strong> applications · {selected.length}{" "}
              selected
            </p>
            {options.staff.role !== "hiring_manager" && (
              <>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={!selected.length || exporting}
                  onClick={() => download("xlsx")}
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={!selected.length || exporting}
                  onClick={() => download("csv")}
                >
                  Export CSV
                </button>
              </>
            )}
          </div>
          {!data.records.length ? (
            <Empty title="No matching applications">
              Received applications will appear here. Try broadening the
              filters.
            </Empty>
          ) : (
            <section
              className="ats-table-wrap"
              /* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll a wide data table. */
              tabIndex={0}
              aria-label="Applications table"
            >
              <table className="ats-table" aria-busy={loading}>
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        type="checkbox"
                        aria-label="Select this page"
                        checked={data.records.every((row) =>
                          selected.includes(row.id),
                        )}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? data.records.map((row) => row.id)
                              : [],
                          )
                        }
                      />
                    </th>
                    {[
                      "Candidate",
                      "Applied role",
                      "Location",
                      "Experience",
                      "Availability",
                      "Stage",
                      "Applied",
                    ].map((value) => (
                      <th key={value} scope="col">
                        {value}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((row) => (
                    <tr
                      key={row.id}
                      className={row.read_at ? undefined : "ats-unread"}
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select application ${row.reference}`}
                          checked={selected.includes(row.id)}
                          onChange={(event) =>
                            setSelected((values) =>
                              event.target.checked
                                ? [...values, row.id]
                                : values.filter((id) => id !== row.id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <Link href={`/admin/applications/${row.id}`}>
                          {row.full_name}
                        </Link>
                        <p>{row.reference}</p>
                      </td>
                      <td>
                        {row.applied_role}
                        <p>
                          {row.client_name ??
                            (row.job_id ? "Sankhala" : "General CV")}
                        </p>
                      </td>
                      <td>{row.emirate ?? row.country}</td>
                      <td>{Number(row.experience)} years</td>
                      <td>{row.availability}</td>
                      <td>
                        <span className="ats-pill" data-stage={row.stage}>
                          {row.stage}
                        </span>
                      </td>
                      <td>{dateTime(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
          <div className="ats-actions">
            <span>
              Page {data.page} of{" "}
              {Math.max(1, Math.ceil(data.total / data.limit))}
            </span>
            {data.page > 1 && (
              <Link
                className="button button-secondary"
                href={`/admin?tab=applications&${new URLSearchParams({ ...Object.fromEntries(initial), page: String(data.page - 1) })}`}
              >
                Previous page
              </Link>
            )}
            {data.page * data.limit < data.total && (
              <Link
                className="button button-secondary"
                href={`/admin?tab=applications&${new URLSearchParams({ ...Object.fromEntries(initial), page: String(data.page + 1) })}`}
              >
                Next page
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
function Jobs({
  options,
  revision,
  onSaved,
}: {
  options: AdminOptions;
  revision: number;
  onSaved: () => void;
}) {
  const { data, error } = useAdminResource<{ records: AdminJob[] }>(
    "jobs",
    revision,
  );
  const [editing, setEditing] = useState<AdminJob | null | undefined>(
    undefined,
  );
  return (
    <div className="stack">
      <Feedback message={error} error />
      <div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setEditing(null)}
        >
          Create vacancy
        </button>
      </div>
      {editing !== undefined && (
        <JobEditor
          key={editing?.id ?? "new"}
          record={editing ?? undefined}
          options={options}
          onSaved={() => {
            setEditing(undefined);
            onSaved();
          }}
          onCancel={() => setEditing(undefined)}
        />
      )}
      <p>
        Drafts and closed jobs do not appear on the public Careers page.
        Publication requires employer confirmation and a valid closing date.
      </p>
      {data && !data.records.length ? (
        <Empty title="No vacancies created">
          Add only real employer-confirmed vacancies. Keep incomplete or
          unconfirmed roles unpublished.
        </Empty>
      ) : (
        data && (
          <div className="ats-table-wrap">
            <table className="ats-table">
              <thead>
                <tr>
                  {["Vacancy", "Status", "Applicants", "Actions"].map(
                    (value) => (
                      <th key={value} scope="col">
                        {value}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      {record.title}
                      <p>{record.reference}</p>
                    </td>
                    <td>{record.status}</td>
                    <td>
                      <Link href={`/admin?tab=applications&job=${record.id}`}>
                        {record.applicant_count}
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => setEditing(record)}
                      >
                        Edit vacancy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
function Clients({
  options,
  onSaved,
}: {
  options: AdminOptions;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      await adminApi("clients", { name: new FormData(form).get("name") });
      form.reset();
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Client could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ats-split">
      <section className="ats-admin-panel stack">
        <h2>Hiring clients</h2>
        {options.clients.length ? (
          options.clients.map((client) => <p key={client.id}>{client.name}</p>)
        ) : (
          <p>No client companies have been added.</p>
        )}
      </section>
      <form onSubmit={save} className="ats-admin-panel stack">
        <h2>Add a client company</h2>
        <label htmlFor="client-name">
          Company name
          <input id="client-name" name="name" required maxLength={160} />
        </label>
        <Feedback message={error} error />
        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add client"}
        </button>
      </form>
    </div>
  );
}
function Candidates({ revision }: { revision: number }) {
  const { data, error } = useAdminResource<{
    records: {
      id: string;
      reference: string;
      full_name: string;
      email: string;
      phone: string;
      talent_pool: number;
      application_count: number;
    }[];
  }>("candidates", revision);
  return (
    <div className="stack">
      <Feedback message={error} error />
      {data && !data.records.length ? (
        <Empty title="No candidate profiles yet">
          A profile is created when a candidate sends an application.
        </Empty>
      ) : (
        data && (
          <div className="ats-table-wrap">
            <table className="ats-table">
              <thead>
                <tr>
                  {["Candidate", "Contact", "Applications", "Talent Pool"].map(
                    (value) => (
                      <th key={value} scope="col">
                        {value}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.records.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <Link
                        href={`/admin?tab=applications&candidate=${person.id}`}
                      >
                        {person.full_name}
                      </Link>
                      <p>{person.reference}</p>
                    </td>
                    <td>
                      {person.email}
                      <p>{person.phone}</p>
                    </td>
                    <td>{person.application_count}</td>
                    <td>{person.talent_pool ? "Included" : "Not included"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
function Team({
  options,
  onSaved,
}: {
  options: AdminOptions;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<AdminUser | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      await adminApi("staff", {
        ...(editing ? { id: editing.id } : {}),
        name: values.name,
        email: values.email,
        role: values.role,
        active: values.active === "on",
        ...(values.password ? { password: values.password } : {}),
      });
      setEditing(null);
      formRef.current?.reset();
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Team access could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <div className="ats-table-wrap">
        <table className="ats-table">
          <thead>
            <tr>
              {["Name", "Email", "Role", "Access", "Action"].map((value) => (
                <th key={value} scope="col">
                  {value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {options.users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role.replace("_", " ")}</td>
                <td>{user.active ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setEditing(user)}
                  >
                    Edit access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        key={editing?.id ?? "new"}
        ref={formRef}
        className="ats-admin-panel stack"
        onSubmit={save}
      >
        <h2>{editing ? "Update team access" : "Create staff access"}</h2>
        <p>
          Recruiters and hiring managers see only assigned records. Hiring
          managers cannot export applications or change hiring stages.
        </p>
        <div className="ats-edit-grid">
          <label htmlFor="team-name">
            Name
            <input
              id="team-name"
              name="name"
              defaultValue={editing?.name}
              required
              maxLength={160}
            />
          </label>
          <label htmlFor="team-email">
            Work email
            <input
              id="team-email"
              name="email"
              type="email"
              defaultValue={editing?.email}
              required
              maxLength={254}
            />
          </label>
          <label htmlFor="team-role">
            Role
            <select
              id="team-role"
              name="role"
              defaultValue={editing?.role ?? "recruiter"}
            >
              <option value="admin">Administrator</option>
              <option value="recruiter">Recruiter</option>
              <option value="hiring_manager">Hiring manager</option>
            </select>
          </label>
          <label htmlFor="team-password">
            {editing ? "New password (optional)" : "Initial password"}
            <input
              id="team-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={14}
              maxLength={128}
              required={!editing}
            />
          </label>
          <label className="ats-check-label" htmlFor="team-active">
            <input
              id="team-active"
              name="active"
              type="checkbox"
              defaultChecked={editing ? !!editing.active : true}
            />
            Active staff access
          </label>
        </div>
        <Feedback message={error} error />
        <div className="ats-actions">
          <button
            className="button button-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving access…" : "Save team access"}
          </button>
          {editing && (
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
function Account() {
  const [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  async function change(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      values = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.get("currentPassword"),
          newPassword: values.get("newPassword"),
          revokeOtherSessions: true,
        }),
      });
      if (!response.ok)
        throw new Error(
          "Password could not be changed. Check your current password and try again.",
        );
      setError(false);
      setMessage("Password changed. Other sessions have been ended.");
      form.reset();
    } catch (error) {
      setError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Password could not be changed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="ats-admin-panel stack ats-password" onSubmit={change}>
      <h2>Change your password</h2>
      <p>
        Use a unique password of at least 14 characters. Your other sessions
        will end after this change.
      </p>
      <label htmlFor="account-current">
        Current password
        <input
          id="account-current"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </label>
      <label htmlFor="account-new">
        New password
        <input
          id="account-new"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={14}
          maxLength={128}
        />
      </label>
      <Feedback message={message} error={error} />
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? "Changing password…" : "Change password"}
      </button>
    </form>
  );
}
function Activity({ revision }: { revision: number }) {
  const { data, error } = useAdminResource<{
    records: {
      id: string;
      action: string;
      actor_name: string | null;
      record_id: string | null;
      created_at: string;
    }[];
  }>("activity", revision);
  return (
    <div className="stack">
      <Feedback message={error} error />
      <p>
        Latest 200 recorded views, downloads, exports and changes. Times are
        shown in Dubai time.
      </p>
      {data && (
        <div className="ats-table-wrap">
          <table className="ats-table">
            <thead>
              <tr>
                {["Time", "Staff", "Action", "Record"].map((value) => (
                  <th key={value} scope="col">
                    {value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((row) => (
                <tr key={row.id}>
                  <td>{dateTime(row.created_at)}</td>
                  <td>{row.actor_name ?? "Public submission"}</td>
                  <td>{row.action.replaceAll("_", " ")}</td>
                  <td>{row.record_id ?? "Multiple records"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function Retention({
  revision,
  onSaved,
}: {
  revision: number;
  onSaved: () => void;
}) {
  const { data, error } = useAdminResource<{
    records: {
      id: string;
      reference: string;
      full_name: string;
      reason: string;
      status: string;
      hold_reason: string | null;
    }[];
    due: {
      id: string;
      reference: string;
      full_name: string;
      review_after: string;
    }[];
  }>("retention", revision);
  const people = useAdminResource<{
    records: { id: string; reference: string; full_name: string }[];
  }>("candidates", revision);
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      values = new FormData(form);
    setBusy(true);
    try {
      await adminApi("retention", {
        candidateId: values.get("candidateId"),
        reason: values.get("reason"),
        verified: values.get("verified") === "on",
        holdReason: values.get("holdReason"),
      });
      form.reset();
      onSaved();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Review could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <Feedback message={error || message} error />
      <section className="ats-admin-panel stack">
        <h2>Profiles due for review</h2>
        {data?.due.length ? (
          data.due.map((person) => (
            <p key={person.id}>
              {person.full_name} · {person.reference}
            </p>
          ))
        ) : (
          <p>No profiles are currently due for review.</p>
        )}
      </section>
      <form onSubmit={save} className="ats-admin-panel stack">
        <h2>Review a deletion request</h2>
        <p>
          Verify the request and check any hold before authorizing deletion.
          Approved requests remove private files and anonymize recruitment
          records when processed.
        </p>
        <label htmlFor="retention-person">
          Candidate
          <select id="retention-person" name="candidateId" required>
            <option value="">Choose a candidate</option>
            {people.data?.records.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name} · {person.reference}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="retention-reason">
          Reason
          <textarea
            id="retention-reason"
            name="reason"
            required
            minLength={5}
            maxLength={500}
          />
        </label>
        <label htmlFor="retention-hold">
          Hold reason (optional)
          <input id="retention-hold" name="holdReason" maxLength={500} />
        </label>
        <label className="ats-check-label">
          <input name="verified" type="checkbox" />I verified this request and
          authorize deletion if there is no hold.
        </label>
        <button className="button button-primary" type="submit" disabled={busy}>
          Save retention review
        </button>
      </form>
      <section className="ats-admin-panel stack">
        <h2>Retention requests</h2>
        {data?.records.length ? (
          data.records.map((row) => (
            <div key={row.id} className="ats-record-item">
              <p>
                <strong>{row.full_name}</strong> · {row.reference}
              </p>
              <p>{row.reason}</p>
              <p>
                {row.status}
                {row.hold_reason ? ` · Hold: ${row.hold_reason}` : ""}
              </p>
            </div>
          ))
        ) : (
          <p>No deletion reviews have been created.</p>
        )}
      </section>
    </div>
  );
}
