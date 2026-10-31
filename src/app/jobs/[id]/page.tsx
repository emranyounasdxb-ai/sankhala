import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedJob } from "@/lib/ats/jobs";
import { createPageMetadata } from "@/lib/page-metadata";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const value = await publishedJob(id);
  return value
    ? createPageMetadata(
        value.job.title,
        `${value.job.title} in ${value.job.location}. Review the confirmed role details and apply through Sankhala.`,
        `/jobs/${id}`,
      )
    : { title: "Vacancy unavailable", robots: { index: false, follow: false } };
}
export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const value = await publishedJob(id);
  if (!value) notFound();
  const { job } = value;
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <Link href="/jobs" className="inline-link">
          Back to opportunities
        </Link>
        <p className="eyebrow">
          {job.employerKind === "sankhala"
            ? "Jobs at Sankhala"
            : "Jobs with our clients"}{" "}
          · {value.reference}
        </p>
        <h1 className="page-title">{job.title}</h1>
        <p className="lead">
          {job.location}
          {job.emirate ? `, ${job.emirate}` : ""} · {job.country}
        </p>
        <Link href={`/jobs/${id}/apply`} className="button button-primary">
          Apply for this role
        </Link>
      </header>
      <section className="content-panel stack" aria-labelledby="role-terms">
        <h2 id="role-terms" className="section-heading">
          Role details
        </h2>
        <dl className="ats-job-terms">
          {[
            [
              "Hiring company",
              job.employerKind === "sankhala"
                ? "Sankhala Employment"
                : "Sankhala client",
            ],
            ["Category", job.category],
            ["Vacancies", String(job.vacancies)],
            [
              "Monthly salary",
              `AED ${job.salaryMinAed.toLocaleString()}–${job.salaryMaxAed.toLocaleString()}`,
            ],
            ["Duty hours", job.dutyHours],
            ["Weekly off", job.weeklyOff],
            ["Experience", job.experience],
            ["Licence or certification", job.requiredCertification],
            ["Benefits", job.benefits],
            ["Closing date", job.closingDate],
          ].map(([label, text]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <h2 className="section-heading">About the role</h2>
        <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>
        <Link href={`/jobs/${id}/apply`} className="button button-primary">
          Apply for this role
        </Link>
      </section>
    </main>
  );
}
