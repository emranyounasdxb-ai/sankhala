import {
  ArrowRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Recruitment services",
  "Staffing requirements, candidate applications and a recruitment process guided by the Sankhala team across the UAE.",
  "/services",
);

const services = [
  {
    id: "employers",
    Icon: BriefcaseIcon,
    label: "For employers",
    title: "Your requirement. Our starting point.",
    description:
      "Tell us the role, number of people and location. Our team discusses the requirement, reviews potential candidates and coordinates the next steps.",
    items: [
      "Staffing requirement review",
      "Candidate shortlisting",
      "Interview coordination and hiring follow-up",
    ],
    href: "/hire-talent",
    action: "Share your staffing needs",
  },
  {
    id: "candidates",
    Icon: FileTextIcon,
    label: "For candidates",
    title: "Make your next move.",
    description:
      "Explore published vacancies and apply for a suitable role. If the right opportunity is not listed, you can share a general CV with the team.",
    items: [
      "Public vacancy information",
      "Applications linked to the right role",
      "General CV consideration",
    ],
    href: "/submit-cv",
    action: "Explore the CV route",
  },
];

export default function ServicesPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">What we do</p>
        <h1 className="page-title">Recruitment, guided by people.</h1>
        <p className="lead">
          Clear routes for companies and candidates. A team that brings the two
          together through a considered hiring process.
        </p>
      </header>

      <div className="content-grid">
        {services.map(
          ({ id, Icon, label, title, description, items, href, action }) => (
            <section id={id} key={id} className="content-panel stack">
              <Icon size={40} weight="light" aria-hidden="true" />
              <span className="section-label">{label}</span>
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
          ),
        )}
      </div>

      <section className="content-panel content-panel-dark stack">
        <UsersThreeIcon size={40} weight="light" aria-hidden="true" />
        <span className="section-label">Across the UAE</span>
        <h2 className="section-heading">
          Start with the role, not a category.
        </h2>
        <p>
          Have a specific position or location in mind? Share the details with
          us. We will discuss your requirement directly rather than ask you to
          fit it into a predefined industry list.
        </p>
        <Link href="/contact" className="button button-secondary">
          Discuss a requirement <ArrowRightIcon size={20} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
