import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileTextIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import {
  recruitmentProcess,
  staffingOptions,
  workforceSupport,
} from "@/lib/company-content";
import { createPageMetadata } from "@/lib/page-metadata";
import {
  recruitmentServices,
  supportedSectors,
  workforceCategories,
} from "@/lib/services";

export const metadata = createPageMetadata(
  "Recruitment & workforce services",
  "Recruitment, permanent and temporary staffing, payroll, PRO, staff accommodation, transport and workforce support across the UAE.",
  "/services",
);

const icons = [
  BriefcaseIcon,
  BriefcaseIcon,
  BriefcaseIcon,
  FileTextIcon,
  FileTextIcon,
  BriefcaseIcon,
];

export default function ServicesPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">What we do</p>
        <h1 className="page-title">People, hiring and workforce support.</h1>
        <p className="lead">
          Sankhala helps businesses recruit candidates, arrange workers and
          manage workforce requirements across Dubai and all UAE emirates. Our
          support extends to HR formalities, payroll and employee records.
        </p>
      </header>

      <div className="content-grid">
        {recruitmentServices.map(
          (
            { id, category, title, description, items, href, action },
            index,
          ) => {
            const Icon = icons[index];
            return (
              <section id={id} key={id} className="content-panel stack">
                <Icon size={40} weight="light" aria-hidden="true" />
                <span className="section-label">{category}</span>
                <h2 className="section-heading">{title}</h2>
                <p>{description}</p>
                <ul className="info-list">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={href} className="inline-link">
                  {action} <ArrowRightIcon size={20} aria-hidden="true" />
                </Link>
              </section>
            );
          },
        )}
      </div>

      <div className="content-grid">
        <section className="content-panel stack">
          <span className="section-label">Sectors we support</span>
          <h2 className="section-heading">Workers for your operations.</h2>
          <ul className="info-list">
            {supportedSectors.map((sector) => (
              <li key={sector}>{sector}</li>
            ))}
          </ul>
          <p>
            Tell us the type of work, headcount and location so our team can
            discuss your requirement.
          </p>
        </section>
        <section className="content-panel stack">
          <span className="section-label">Workforce categories</span>
          <h2 className="section-heading">The people your team needs.</h2>
          <ul className="info-list">
            {workforceCategories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
          <p>
            For example, a company may need 20 cleaners, 10 drivers or
            construction workers. Sankhala supports candidate arrangements,
            hiring and staff management around that requirement.
          </p>
        </section>
      </div>

      <section
        id="staffing-options"
        className="company-section"
        aria-labelledby="staffing-options-heading"
      >
        <div className="company-section-heading">
          <div>
            <p className="eyebrow">Staffing options</p>
            <h2 id="staffing-options-heading">
              A role, a project or a whole team.
            </h2>
          </div>
          <p className="company-section-copy">
            Start with the type of work and the duration. We can discuss a
            staffing arrangement that fits the requirement.
          </p>
        </div>
        <ul className="company-option-grid">
          {staffingOptions.map(({ title, description }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="workforce-support"
        className="company-section"
        aria-labelledby="workforce-support-heading"
      >
        <div className="company-section-heading">
          <div>
            <p className="eyebrow">Beyond recruitment</p>
            <h2 id="workforce-support-heading">Support for the working day.</h2>
          </div>
          <p className="company-section-copy">
            Our accommodation, transport, catering and workplace HR operations
            support the practical needs of a workforce. Scope and arrangements
            are agreed for each requirement.
          </p>
        </div>
        <ul className="company-option-grid">
          {workforceSupport.map(({ id, title, description }) => (
            <li id={id} key={id}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
        <Link href="/contact" className="inline-link">
          Discuss workforce support{" "}
          <ArrowRightIcon size={20} aria-hidden="true" />
        </Link>
      </section>

      <section
        id="recruitment-process"
        className="company-section"
        aria-labelledby="recruitment-process-heading"
      >
        <div className="company-section-heading">
          <div>
            <p className="eyebrow">Our recruitment process</p>
            <h2 id="recruitment-process-heading">
              From the first brief to joining.
            </h2>
          </div>
          <p className="company-section-copy">
            A clear sequence for your team and the candidate, with support after
            joining based on the services you agree with us.
          </p>
        </div>
        <ol className="company-step-grid">
          {recruitmentProcess.map(({ title, description }, index) => (
            <li key={title}>
              <span className="company-step-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="content-panel content-panel-dark stack company-section"
        aria-labelledby="brief-heading"
      >
        <span className="section-label">A useful starting point</span>
        <h2 id="brief-heading" className="section-heading">
          Help us understand the role.
        </h2>
        <div className="content-grid">
          <div className="stack">
            <h3>For your hiring brief</h3>
            <p>
              Include the main responsibilities, essential experience, number of
              people and work location. Add any language or shift requirements
              relevant to the role.
            </p>
            <Link href="/hire-talent" className="inline-link">
              Prepare your requirement{" "}
              <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className="stack">
            <h3>For your candidate introduction</h3>
            <p>
              Include your recent experience, relevant skills, preferred role
              and current location. Use the CV form to review your details and
              choose your document. If you contact us by email, attach your CV
              to the message.
            </p>
            <Link href="/submit-cv" className="inline-link">
              Prepare your introduction{" "}
              <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
