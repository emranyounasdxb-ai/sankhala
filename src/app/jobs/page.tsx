import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileArrowUpIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";

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
    </main>
  );
}
