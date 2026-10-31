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
        <h1 className="page-title">Make room for what’s next.</h1>
        <p className="lead">
          No suitable vacancy listed? The general CV route is a place to
          introduce your experience and preferred role.
        </p>
      </header>
      <div className="content-grid intake-layout">
        <IntakeForm kind="candidate" contact={site.contact} />
        <aside className="page-aside stack">
          <div className="content-panel content-panel-dark stack">
            <FileTextIcon size={40} weight="light" aria-hidden="true" />
            <h2 className="section-heading">Let your experience speak.</h2>
            <p>
              Keep your CV focused on your experience, skills and the role you
              want. Include up-to-date contact details so the team can reach
              you.
            </p>
            <a
              href={site.contact.emailHref}
              className="button button-secondary"
            >
              Email our team <ArrowRightIcon size={20} aria-hidden="true" />
            </a>
          </div>
          <div className="content-panel stack">
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
