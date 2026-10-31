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
    title: "Staff recruitment",
    description:
      "Share the roles you need to fill, how many people you need and where they will work. Our team supports the recruitment conversation from requirement to interview.",
    items: [
      "Discuss the role and required experience",
      "Review and shortlist potential candidates",
      "Coordinate interviews and follow hiring progress",
    ],
    href: "/hire-talent",
    action: "Share your staffing needs",
  },
  {
    id: "candidates",
    Icon: FileTextIcon,
    label: "For candidates",
    title: "Candidate applications",
    description:
      "Share your experience, preferred role and location with our team. A general CV gives us a starting point even when a suitable vacancy is not listed.",
    items: [
      "Introduce your experience and skills",
      "Discuss suitable published opportunities",
      "Share a general CV for future consideration",
    ],
    href: "/submit-cv",
    action: "Submit your CV",
  },
];

export default function ServicesPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">What we do</p>
        <h1 className="page-title">Recruitment support across the UAE.</h1>
        <p className="lead">
          Staff requirements for businesses. Applications and CVs from
          candidates. Our team brings the two together through review,
          shortlisting and interview coordination.
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
        <h2 className="section-heading">Tell us where you need people.</h2>
        <p>
          Our service area includes Dubai and all UAE emirates. Share your
          position, required experience and work location so our team can
          discuss the requirement with you.
        </p>
        <Link href="/contact" className="button button-secondary">
          Discuss a requirement <ArrowRightIcon size={20} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
