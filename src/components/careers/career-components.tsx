import {
  ArrowRightIcon,
  BriefcaseIcon,
  MapPinIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { PreviewJob } from "@/lib/career-preview";

export function JobFacts({ job }: { job: PreviewJob }) {
  return (
    <ul className="career-facts" aria-label="Role overview">
      <li>
        <MapPinIcon size={18} aria-hidden="true" />
        {job.emirate}
      </li>
      <li>
        <BriefcaseIcon size={18} aria-hidden="true" />
        {job.type}
      </li>
      <li>{job.reference}</li>
      <li>
        {job.origin === "sankhala"
          ? "Sankhala role preview"
          : "Client role preview"}
      </li>
    </ul>
  );
}

export function JobCard({ job }: { job: PreviewJob }) {
  return (
    <article className="career-card">
      <div className="career-card-top">
        <span className="section-label">{job.department}</span>
        <span
          className={`career-badge${job.closed ? " career-badge-muted" : ""}`}
        >
          {job.closed ? "Closed sample" : "Sample role"}
        </span>
      </div>
      <h2>
        <Link href={`/design/careers/${job.slug}`}>{job.title}</Link>
      </h2>
      <JobFacts job={job} />
      <p>{job.summary}</p>
      <Link className="inline-link" href={`/design/careers/${job.slug}`}>
        View sample role <ArrowRightIcon size={20} aria-hidden="true" />
        <span className="sr-only">: {job.title}</span>
      </Link>
    </article>
  );
}

export function JobSkeleton() {
  return (
    <div role="status" className="career-skeleton-group">
      <span className="sr-only">Loading role previews</span>
      {[0, 1, 2].map((item) => (
        <div
          className="career-card career-skeleton"
          key={item}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function ClosedRole() {
  return (
    <section className="career-notice" aria-labelledby="closed-role">
      <h2 id="closed-role">This sample vacancy is closed.</h2>
      <p>
        Applications are unavailable for this role. Browse another sample to
        explore the application design.
      </p>
      <button className="button button-secondary" disabled type="button">
        Applications closed
      </button>
      <Link href="/design/careers" className="inline-link">
        Browse sample roles <ArrowRightIcon size={20} aria-hidden="true" />
      </Link>
    </section>
  );
}
