import {
  ArrowRightIcon,
  ChatsCircleIcon,
  HandshakeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "About Sankhala",
  "Learn how Sankhala connects company staffing requirements with candidate applications through a team led recruitment process across the UAE.",
  "/about",
);

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">About Sankhala</p>
        <h1 className="page-title">Connecting companies and candidates.</h1>
        <p className="lead">
          Sankhala Employment supports businesses looking for staff and people
          looking for work across Dubai and all UAE emirates.
        </p>
      </header>

      <div className="content-grid">
        <section className="content-panel stack">
          <span className="section-label">Our role</span>
          <h2 className="section-heading">A team behind the hiring process.</h2>
          <p>
            Companies share the roles they need to fill. Candidates share their
            experience and the work they are looking for. Our team reviews both
            to identify suitable introductions.
          </p>
          <p>
            From understanding the requirement to shortlisting candidates and
            coordinating interviews, recruitment is handled through direct
            conversations with our team.
          </p>
          <Link href="/services" className="inline-link">
            View recruitment services{" "}
            <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>

        <section className="content-panel content-panel-dark stack">
          <ChatsCircleIcon size={40} weight="light" aria-hidden="true" />
          <h2 className="section-heading">Start with the role and location.</h2>
          <p>
            Tell us who your business needs to hire, or which role you would
            like to find. Include your work location so we can understand your
            requirements from the start.
          </p>
          <Link href="/contact" className="button button-secondary">
            Talk to our team <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="content-panel stack">
        <HandshakeIcon size={40} weight="light" aria-hidden="true" />
        <span className="section-label">Choose your starting point</span>
        <h2 className="section-heading">Hiring staff or looking for work?</h2>
        <div className="content-grid">
          <div className="stack">
            <h3>For companies</h3>
            <p>
              Share the job role, number of staff and work location. Our team
              discusses the requirement before reviewing potential candidates.
            </p>
            <Link href="/hire-talent" className="inline-link">
              Hire Talent <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className="stack">
            <h3>For candidates</h3>
            <p>
              Check published vacancies or introduce yourself with a general CV.
              Tell us about your experience and preferred type of work.
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
