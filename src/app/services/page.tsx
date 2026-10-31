import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileTextIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";
import {
  recruitmentServices,
  supportedSectors,
  workforceCategories,
} from "@/lib/services";

export const metadata = createPageMetadata(
  "Recruitment & workforce services",
  "Recruitment, manpower supply, staff outsourcing, HR & PRO support, payroll and bulk hiring across Dubai and all UAE emirates.",
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
        className="content-panel content-panel-dark stack"
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
              and current location. Keep your contact details up to date and
              attach your CV when emailing the team.
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
