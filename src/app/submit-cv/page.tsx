import { ArrowRightIcon, FileTextIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ApplicationForm } from "@/components/ats/application-form";
import { IntakeForm } from "@/components/forms/intake-form";
import { atsEnabled } from "@/lib/ats/db";
import { allRoleTitles } from "@/lib/job-categories";
import { createPageMetadata } from "@/lib/page-metadata";
import { safeJobsReturn } from "@/lib/role-navigation";
import { site } from "@/lib/site";

export const metadata = createPageMetadata(
  "Submit your CV",
  "Explore the general CV route with Sankhala when no suitable vacancy is listed, or contact the recruitment team directly.",
  "/submit-cv",
);

export default async function SubmitCVPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[]; from?: string | string[] }>;
}) {
  const { role, from } = await searchParams;
  const online = atsEnabled();
  const backHref = safeJobsReturn(from);
  const initialRole =
    typeof role === "string" && allRoleTitles.includes(role) ? role : "";
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">For candidates</p>
        <h1 className="page-title">Share your experience.</h1>
        <p className="lead">
          Introduce your skills and the role you are looking for, even when no
          suitable vacancy is listed.{" "}
          {online
            ? "Complete your recruitment profile and send your CV securely."
            : "You can contact our team directly by email."}
        </p>
      </header>
      <div className="content-grid intake-layout">
        <div className="cv-intake-main">
          <Link className="inline-link cv-role-back" href={backHref}>
            Back to role categories
          </Link>
          {online ? (
            <ApplicationForm initialRole={initialRole} />
          ) : (
            <IntakeForm
              key={initialRole}
              kind="candidate"
              contact={site.contact}
              initialRole={initialRole}
            />
          )}
        </div>
        <aside className="page-aside stack intake-aside">
          <div className="content-panel content-panel-dark stack">
            <FileTextIcon size={40} weight="light" aria-hidden="true" />
            <h2 className="section-heading">A clear introduction.</h2>
            <p>
              Keep your CV focused on your experience, skills and the role you
              want. Include current contact details so the team can reach you.
            </p>
            <a
              href={site.contact.emailHref}
              className="button button-secondary"
            >
              Email our team <ArrowRightIcon size={20} aria-hidden="true" />
            </a>
          </div>
          <div className="content-panel stack">
            <span className="section-label">What happens next</span>
            <ol className="info-list">
              <li>Share your CV and preferred role with our team.</li>
              <li>Our team reviews your experience.</li>
              <li>
                We discuss suitable opportunities and coordinate introductions.
              </li>
            </ol>
            <span className="section-label">Looking for a specific role?</span>
            <p>
              When a vacancy is published, its job page will show the role
              details and application route.
            </p>
            <Link href="/jobs" className="inline-link">
              View opportunities <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
      <section className="content-panel stack" aria-labelledby="cv-questions">
        <span className="section-label">Before you contact us</span>
        <h2 id="cv-questions" className="section-heading">
          Your CV, your next step.
        </h2>
        <div className="stack">
          <div>
            <h3>Does selecting a CV send it to the team?</h3>
            <p>
              {online
                ? "Selecting a file does not send it. Review your details, then choose Send application. A reference appears only after your application has been saved."
                : "No. Select a file to check its format and size, then review your introduction. Attach the CV yourself when you send the email."}
            </p>
          </div>
          <div>
            <h3>Can I introduce myself without a listed vacancy?</h3>
            <p>
              Yes.{" "}
              {online
                ? "Send a general CV with your preferred role and location."
                : "Email a general CV with your preferred role and location."}
              Published vacancies will appear on the jobs page when available.
            </p>
          </div>
          <div>
            <h3>Does sharing my CV guarantee an interview?</h3>
            <p>
              An introduction does not guarantee an interview or a job. Our team
              reviews your experience against suitable requirements.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
