import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileArrowUpIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { RoleBrowser } from "@/components/careers/role-browser";
import { createPageMetadata } from "@/lib/page-metadata";
import { browseHref, browseState } from "@/lib/role-navigation";
import "./jobs.css";

export const metadata = createPageMetadata(
  "Find a job",
  "Explore role categories and introduce your experience for future opportunities with Sankhala and its clients across the UAE.",
  "/jobs",
);

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; open?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (typeof params.q === "string") query.set("q", params.q);
  if (typeof params.open === "string") query.set("open", params.open);
  const state = browseState(query.toString());
  const initialSearch = browseHref(state.q, state.open).replace(/^\/jobs/, "");
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">For job seekers</p>
        <h1 className="page-title">Job opportunities across the UAE.</h1>
        <p className="lead">
          Explore role categories and introduce your experience for future
          opportunities with Sankhala and its clients.
        </p>
      </header>
      <section
        className="jobs-availability"
        aria-labelledby="jobs-empty-heading"
      >
        <BriefcaseIcon size={28} weight="light" aria-hidden="true" />
        <div>
          <h2 id="jobs-empty-heading">No vacancies are published yet.</h2>
          <p>
            Only genuinely available, employer-confirmed vacancies will appear
            here. You can prepare a general CV introduction for future
            opportunities.
          </p>
        </div>
        <Link href="/submit-cv" className="button button-primary">
          Submit CV <FileArrowUpIcon size={20} aria-hidden="true" />
        </Link>
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
          <Link href="/submit-cv" className="inline-link">
            Register interest in our team{" "}
            <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>
        <section className="content-panel stack" aria-labelledby="client-jobs">
          <span className="section-label">Client staffing requirements</span>
          <h2 id="client-jobs" className="section-heading">
            Jobs with Our Clients
          </h2>
          <Link href="/submit-cv" className="inline-link">
            Register interest in client roles{" "}
            <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>
      </div>
      <RoleBrowser initialSearch={initialSearch} />
    </main>
  );
}
