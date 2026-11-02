import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ClientPortfolio } from "@/components/client-portfolio";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Our clients",
  "Explore Sankhala's client portfolio and discuss recruitment, staffing and workforce support for your business across the UAE.",
  "/clients",
);

export default function ClientsPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">Sankhala client portfolio</p>
        <h1 className="page-title">
          Different businesses. People at the centre.
        </h1>
        <p className="lead">
          Every company brings a different staffing requirement. Our work starts
          with understanding the roles, the people and the day to day needs of
          the business.
        </p>
      </header>
      <ClientPortfolio />
      <section className="content-panel content-panel-dark stack company-section">
        <span className="section-label">For your business</span>
        <h2 className="section-heading">
          Tell us about your next requirement.
        </h2>
        <p>
          Share the roles, headcount and location. We can discuss recruitment,
          project staffing and the workforce support your operation needs.
        </p>
        <Link href="/hire-talent" className="button button-secondary">
          Hire Talent <ArrowRightIcon size={20} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
