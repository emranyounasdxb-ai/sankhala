import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileArrowUpIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Find a job",
  "Explore published opportunities with Sankhala across Dubai and the UAE, or learn how to share a general CV.",
  "/jobs",
);

export default function JobsPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">For job seekers</p>
        <h1 className="page-title">Your next chapter starts here.</h1>
        <p className="lead">
          Explore opportunities across the UAE. Find a role that fits where you
          want to go next.
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
          New openings will appear here when they are available. In the
          meantime, you can explore the general CV route or contact our team
          about your preferred role.
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
