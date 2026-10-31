import {
  ArrowRightIcon,
  ChatsCircleIcon,
  HandshakeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "About Sankhala",
  "Get to know Sankhala's people focused approach to recruitment for companies and candidates across Dubai and the UAE.",
  "/about",
);

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">About Sankhala</p>
        <h1 className="page-title">People make the difference.</h1>
        <p className="lead">
          Behind every staffing requirement is a business moving forward. Behind
          every CV is a person ready for what comes next.
        </p>
      </header>

      <div className="content-grid">
        <section className="content-panel stack">
          <span className="section-label">Our purpose</span>
          <h2 className="section-heading">
            Connecting ambition with opportunity.
          </h2>
          <p>
            Sankhala brings companies looking for staff and people looking for
            work into one recruitment process. We serve Dubai and all UAE
            emirates.
          </p>
          <p>
            Our team reviews requirements and applications, shortlists
            candidates, coordinates interviews and follows the hiring process.
            The matching happens through people and conversations.
          </p>
          <Link href="/services" className="inline-link">
            Explore our approach <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>

        <section className="content-panel content-panel-dark stack">
          <ChatsCircleIcon size={40} weight="light" aria-hidden="true" />
          <h2 className="section-heading">A conversation comes first.</h2>
          <p>
            Tell us what your business needs, or where you want your career to
            go. That gives our team a useful place to start.
          </p>
          <Link href="/contact" className="button button-secondary">
            Talk to our team <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="content-panel stack">
        <HandshakeIcon size={40} weight="light" aria-hidden="true" />
        <span className="section-label">Two paths, one approach</span>
        <h2 className="section-heading">The next step should be clear.</h2>
        <div className="content-grid">
          <div className="stack">
            <h3>For companies</h3>
            <p>
              Share the role, team size and work location. We discuss your needs
              before reviewing potential candidates.
            </p>
            <Link href="/hire-talent" className="inline-link">
              Hire Talent <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className="stack">
            <h3>For candidates</h3>
            <p>
              Look through published vacancies or share your CV for
              consideration when a suitable opportunity becomes available.
            </p>
            <Link href="/jobs" className="inline-link">
              Find a Job <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
