import { ArrowRightIcon, FileTextIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { IntakeForm } from "@/components/forms/intake-form";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata(
  "Submit your CV",
  "Explore the general CV route with Sankhala when no suitable vacancy is listed, or contact the recruitment team directly.",
  "/submit-cv",
);

export default function SubmitCVPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">For candidates</p>
        <h1 className="page-title">Share your experience.</h1>
        <p className="lead">
          Introduce your skills and the role you are looking for, even when no
          suitable vacancy is listed. You can contact our team directly by
          email.
        </p>
      </header>
      <div className="content-grid intake-layout">
        <IntakeForm kind="candidate" contact={site.contact} />
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
    </main>
  );
}
