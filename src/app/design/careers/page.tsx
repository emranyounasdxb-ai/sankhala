import Link from "next/link";
import { JobCard } from "@/components/careers/career-components";
import {
  careerEmirates,
  previewJobs,
  previewMetadata,
} from "@/lib/career-preview";

export const metadata = previewMetadata("Careers", "/design/careers");

export default async function CareersPreview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const q = value("q").trim().slice(0, 100);
  const emirate = careerEmirates.includes(value("emirate"))
    ? value("emirate")
    : "";
  const type = ["Full time", "Contract"].includes(value("type"))
    ? value("type")
    : "";
  const jobs = previewJobs.filter(
    (job) =>
      `${job.title} ${job.department}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!emirate || job.emirate === emirate) &&
      (!type || job.type === type),
  );
  return (
    <main id="main" tabIndex={-1} className="page-shell career-shell">
      <header className="page-intro">
        <p className="eyebrow">Careers interface / 01</p>
        <h1 className="page-title">Find your next direction.</h1>
        <p className="lead">
          Explore the listing design with fictional roles. Search, choose a
          sample and review the application experience.
        </p>
      </header>
      <form
        action="/design/careers"
        className="career-filters"
        aria-label="Filter sample roles"
        key={`${q}-${emirate}-${type}`}
      >
        <div>
          <label htmlFor="role-search">Role or keyword</label>
          <input
            id="role-search"
            name="q"
            defaultValue={q}
            type="search"
            maxLength={100}
            placeholder="Search sample roles"
          />
        </div>
        <div>
          <label htmlFor="role-emirate">Emirate</label>
          <select id="role-emirate" name="emirate" defaultValue={emirate}>
            <option value="">All emirates</option>
            {careerEmirates.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role-type">Job type</label>
          <select id="role-type" name="type" defaultValue={type}>
            <option value="">All types</option>
            <option>Full time</option>
            <option>Contract</option>
          </select>
        </div>
        <button className="button button-primary" type="submit">
          Find sample roles
        </button>
      </form>
      <div className="career-results-heading">
        <h2>
          {jobs.length} sample {jobs.length === 1 ? "role" : "roles"}
        </h2>
        <Link href="/design/careers" className="inline-link">
          Clear filters
        </Link>
      </div>
      {jobs.length ? (
        <div className="career-list">
          {jobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      ) : (
        <section className="career-notice">
          <h2>No sample roles match your filters.</h2>
          <p>Try a broader keyword or choose another emirate or job type.</p>
          <Link className="button button-secondary" href="/design/careers">
            Reset filters
          </Link>
        </section>
      )}
      <p className="career-footnote">
        These examples do not indicate Sankhala vacancies, clients or confirmed
        industry specialisms.
      </p>
    </main>
  );
}
