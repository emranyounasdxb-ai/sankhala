import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/ats/application-form";
import { publishedJob } from "@/lib/ats/jobs";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Job application",
  robots: { index: false, follow: false },
};
export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const value = await publishedJob(id);
  if (!value) notFound();
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <Link href={`/jobs/${id}`} className="inline-link">
          Back to role details
        </Link>
        <p className="eyebrow">
          {value.reference} · {value.job.location}
        </p>
        <h1 className="page-title">Your next opportunity.</h1>
        <p className="lead">
          Apply for {value.job.title}. Your application will be linked to this
          vacancy automatically.
        </p>
      </header>
      <ApplicationForm jobId={id} jobTitle={value.job.title} />
    </main>
  );
}
