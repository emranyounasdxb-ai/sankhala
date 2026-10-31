import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationPreview } from "@/components/careers/application-preview";
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
  return previewMetadata("Application", `/design/careers/${slug}/apply`);
}

export default async function ApplyPreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = getPreviewJob(slug);
  if (!job) notFound();
  return (
    <main id="main" tabIndex={-1} className="page-shell career-shell">
      <nav className="career-breadcrumb" aria-label="Breadcrumb">
        <Link href="/design/careers">Sample roles</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/design/careers/${slug}`}>{job.title}</Link>
      </nav>
      <header className="page-intro">
        <p className="eyebrow">Application interface / 03</p>
        <h1 className="page-title">Introduce yourself.</h1>
        <JobFacts job={job} />
        <p className="lead">
          Preview an application for {job.title}. Use sample details; nothing is
          uploaded or submitted.
        </p>
      </header>
      {job.closed ? <ClosedRole /> : <ApplicationPreview job={job} />}
    </main>
  );
}
