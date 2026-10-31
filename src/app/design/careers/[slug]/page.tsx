import Link from "next/link";
import { notFound } from "next/navigation";
import { ClosedRole, JobFacts } from "@/components/careers/career-components";
import {
  getPreviewJob,
  previewJobs,
  previewMetadata,
} from "@/lib/career-preview";

export const dynamicParams = false;
export function generateStaticParams() {
  return previewJobs.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return previewMetadata(
    getPreviewJob(slug)?.title ?? "Role unavailable",
    `/design/careers/${slug}`,
  );
}

export default async function RolePreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = getPreviewJob(slug);
  if (!job) notFound();
  return (
    <main id="main" tabIndex={-1} className="page-shell career-shell">
      <nav aria-label="Breadcrumb" className="career-breadcrumb">
        <Link href="/design/careers">Sample roles</Link>
        <span aria-hidden="true">/</span>
        <span>{job.title}</span>
      </nav>
      <header className="page-intro">
        <p className="eyebrow">Sample role / {job.reference}</p>
        <h1 className="page-title">{job.title}.</h1>
        <JobFacts job={job} />
        <p className="lead">
          {job.summary} This is fictional content for design review.
        </p>
      </header>
      <div className="career-detail-grid">
        <div className="career-card career-copy">
          <h2>About this sample role</h2>
          <p>{job.summary}</p>
          <h2>Responsibilities</h2>
          <ul>
            {job.responsibilities.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <h2>Requirements</h2>
          <ul>
            {job.requirements.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
        <aside
          className="career-card career-apply-aside"
          aria-label="Application options"
        >
          <span className="section-label">Your next step</span>
          <h2>{job.closed ? "Closed sample" : "Explore the application."}</h2>
          <p>
            Try the details, CV and review screens using sample information. No
            application will be sent or saved.
          </p>
          {job.closed ? (
            <ClosedRole />
          ) : (
            <Link
              href={`/design/careers/${slug}/apply`}
              className="button button-primary"
            >
              Preview application
            </Link>
          )}
          <Link href="/design/careers" className="inline-link">
            Back to sample roles
          </Link>
        </aside>
      </div>
    </main>
  );
}
