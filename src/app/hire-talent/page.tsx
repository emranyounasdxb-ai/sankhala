import { ChatsCircleIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { IntakeForm } from "@/components/forms/intake-form";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";

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
          The right conversation starts with your needs. Tell us about the role,
          the people and the place.
        </p>
      </header>
      <div className="content-grid intake-layout">
        <IntakeForm kind="employer" contact={site.contact} />
        <aside className="page-aside stack">
          <div className="content-panel content-panel-dark stack">
            <ChatsCircleIcon size={40} weight="light" aria-hidden="true" />
            <h2 className="section-heading">Prefer a conversation?</h2>
            <p>
              Speak with our team about the positions you need to fill and the
              location of your work.
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
              <li>Understand your staffing requirement.</li>
              <li>Review and shortlist potential candidates.</li>
              <li>Coordinate interviews and follow the hire.</li>
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
