import {
  ArrowRightIcon,
  ChatsCircleIcon,
  HandshakeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { companyPrinciples } from "@/lib/company-content";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "About Sankhala",
  "Learn about Sankhala's recruitment, manpower supply, outsourcing, HR & PRO and payroll support across Dubai and the UAE.",
  "/about",
);

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">About Sankhala</p>
        <h1 className="page-title">Connecting companies and candidates.</h1>
        <p className="lead">
          Sankhala Employment provides recruitment, manpower supply and staff
          outsourcing across Dubai and all UAE emirates, alongside HR &amp; PRO,
          payroll and workforce management support.
        </p>
      </header>

      <div className="content-grid">
        <section className="content-panel stack">
          <span className="section-label">Our role</span>
          <h2 className="section-heading">
            Support from hiring to workforce management.
          </h2>
          <p>
            We help companies find candidates, shortlist CVs, coordinate
            interviews and make selections. We also arrange workers for
            construction, cleaning, security, logistics, hospitality, retail and
            corporate requirements, including larger project and company hiring
            needs.
          </p>
          <p>
            Beyond hiring, our support covers visa processing, labour contracts,
            joining documents, salary processing, attendance and employee
            records. Our own accommodation, transport and catering operations
            support the workforce beyond recruitment. Drivers, cleaners,
            helpers, construction workers and office staff are among the
            categories we support.
          </p>
          <Link href="/services" className="inline-link">
            Explore our services <ArrowRightIcon size={20} aria-hidden="true" />
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

      <section
        className="company-section company-purpose"
        aria-labelledby="purpose-heading"
      >
        <div className="company-section-heading">
          <div>
            <p className="eyebrow">Our purpose</p>
            <h2 id="purpose-heading">People and businesses moving forward.</h2>
          </div>
        </div>
        <div className="content-grid">
          <article className="content-panel stack">
            <span className="section-label">Our mission</span>
            <h3>Practical support. People first.</h3>
            <p>
              To help businesses build dependable teams and support candidates
              through their next career step, bringing recruitment and everyday
              workforce needs into one conversation.
            </p>
          </article>
          <article className="content-panel stack">
            <span className="section-label">Our vision</span>
            <h3>Trust built through the work.</h3>
            <p>
              To become a trusted employment services partner across the UAE
              through clear communication, responsible recruitment and
              consistent support for companies and candidates.
            </p>
          </article>
        </div>
      </section>

      <section className="company-section" aria-labelledby="approach-heading">
        <div className="company-section-heading">
          <div>
            <p className="eyebrow">Why Sankhala</p>
            <h2 id="approach-heading">A clear, personal way of working.</h2>
          </div>
        </div>
        <ul className="company-principles">
          {companyPrinciples.map(({ title, description }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
        <Link href="/clients" className="inline-link">
          Explore our client portfolio{" "}
          <ArrowRightIcon size={20} aria-hidden="true" />
        </Link>
      </section>

      <section className="content-panel stack company-section">
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
