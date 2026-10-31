import {
  ChatsCircleIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { IntakeForm } from "@/components/forms/intake-form";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
import "./hire-contact.css";

export const metadata = createPageMetadata(
  "Hire talent",
  "Discuss your staffing requirements with Sankhala. Share the role, number of people and work location across Dubai and the UAE.",
  "/hire-talent",
);

export default function HireTalentPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">For employers</p>
        <h1 className="page-title">Build your next team.</h1>
        <p className="lead">
          Tell us the role, how many people you need and where they will work.
          Our team helps you plan the next step across Dubai and the UAE.
        </p>
        <nav
          className="hire-contact-shortcuts"
          aria-label="Contact our recruitment team"
        >
          <a href={site.contact.phoneHref} className="button button-secondary">
            <PhoneIcon size={20} aria-hidden="true" /> Call us
          </a>
          <a
            href={site.contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary"
          >
            <WhatsappLogoIcon size={20} aria-hidden="true" /> WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      </header>
      <div className="content-grid intake-layout">
        <IntakeForm kind="employer" contact={site.contact} />
        <aside className="page-aside stack intake-aside">
          <div className="content-panel content-panel-dark stack">
            <ChatsCircleIcon size={40} weight="light" aria-hidden="true" />
            <h2 className="section-heading">Prefer a conversation?</h2>
            <p>
              Call us to discuss your staffing needs while online submissions
              are being prepared.
            </p>
            <a
              href={site.contact.phoneHref}
              className="button button-secondary"
            >
              <PhoneIcon size={20} aria-hidden="true" /> {site.contact.phone}
            </a>
          </div>
          <div className="content-panel stack">
            <span className="section-label">How we work</span>
            <ol className="info-list">
              <li>
                <strong>Your requirement.</strong> We discuss the role,
                headcount and location.
              </li>
              <li>
                <strong>A suitable shortlist.</strong> Our team reviews
                potential candidates.
              </li>
              <li>
                <strong>The hiring conversation.</strong> We coordinate
                interviews and follow the hire.
              </li>
            </ol>
            <p className="field-hint">
              Our coverage includes Dubai and all UAE emirates.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
