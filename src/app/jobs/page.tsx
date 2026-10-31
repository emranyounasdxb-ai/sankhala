import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileArrowUpIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  futureCVHref,
  jobCategories,
  priorityRoles,
} from "@/lib/job-categories";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
import "./jobs.css";

export const metadata = createPageMetadata(
  "Find a job",
  "Check for published vacancies with Sankhala across Dubai and the UAE, or contact our recruitment team with your CV and preferred role.",
  "/jobs",
);

export default function JobsPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">For job seekers</p>
        <h1 className="page-title">Job opportunities across the UAE.</h1>
        <p className="lead">
          Check for published vacancies or introduce yourself to our recruitment
          team with your experience, preferred role and location.
        </p>
      </header>

      <section
        className="empty-state content-panel stack"
        aria-labelledby="jobs-empty-heading"
      >
        <BriefcaseIcon size={48} weight="light" aria-hidden="true" />
        <span className="chip">Current opportunities</span>
        <h2 id="jobs-empty-heading" className="section-heading">
          No vacancies are published yet.
        </h2>
        <p>
          Open roles will appear here when they are published. You can still
          share a general CV for consideration when a suitable opportunity
          becomes available.
        </p>
        <p className="field-hint">
          Online applications are not open yet. To send your CV now, email{" "}
          <a href={site.contact.emailHref} className="inline-link">
            {site.contact.email}
          </a>{" "}
          and include your preferred role.
        </p>
        <div className="button-row">
          <Link href="/submit-cv" className="button button-primary">
            Submit CV <FileArrowUpIcon size={20} aria-hidden="true" />
          </Link>
          <Link href="/contact" className="button button-secondary">
            Talk to our team <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <div className="job-opportunities-grid">
        <section
          className="content-panel stack"
          aria-labelledby="sankhala-jobs"
        >
          <span className="section-label">Our own team</span>
          <h2 id="sankhala-jobs" className="section-heading">
            Jobs at Sankhala
          </h2>
          <p>No confirmed openings at Sankhala are published at the moment.</p>
          <Link href="/submit-cv" className="inline-link">
            Submit your CV for future opportunities{" "}
            <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>
        <section className="content-panel stack" aria-labelledby="client-jobs">
          <span className="section-label">Client staffing requirements</span>
          <h2 id="client-jobs" className="section-heading">
            Jobs with Our Clients
          </h2>
          <p>
            No employer-confirmed client vacancies are published at the moment.
            Available roles will appear here after confirmation.
          </p>
          <Link href="/submit-cv" className="inline-link">
            Submit your CV for future opportunities{" "}
            <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>
      </div>
      <section className="job-role-section" aria-labelledby="priority-roles">
        <p className="eyebrow">Future opportunities</p>
        <h2 id="priority-roles" className="section-heading">
          Tell us your preferred role.
        </h2>
        <p>
          These priority role interests help you introduce your experience. They
          are not a list of current vacancies. Select a role to prepare a
          general CV introduction.
        </p>
        <ul className="job-priority-roles">
          {priorityRoles.map((role) => (
            <li key={role}>
              <Link href={futureCVHref(role)}>
                {role}
                <span className="sr-only">
                  : submit CV for future opportunities
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="job-role-section" aria-labelledby="category-heading">
        <p className="eyebrow">Explore role categories</p>
        <h2 id="category-heading" className="section-heading">
          Find your area of work.
        </h2>
        <p>
          Browse the types of roles we may recruit for through recruitment,
          manpower supply and client staffing requirements. Only genuinely
          available, employer-confirmed vacancies will be published above.
        </p>
        <div className="job-category-grid">
          {jobCategories.map((category) => (
            <details className="job-category" key={category.name}>
              <summary>
                {category.name}
                <span>{category.roles.length} role types</span>
              </summary>
              {category.note && (
                <p className="job-category-note">{category.note}</p>
              )}
              <p className="field-hint">
                Choose a role to submit your CV for future opportunities.
              </p>
              <ul>
                {category.roles.map((role) => (
                  <li key={role}>
                    <Link href={futureCVHref(role)}>
                      {role}
                      <ArrowRightIcon size={18} aria-hidden="true" />
                      <span className="sr-only">
                        : submit CV for future opportunities
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
