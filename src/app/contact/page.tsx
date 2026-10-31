import {
  ArrowUpRightIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
import "./contact.css";

export const metadata = createPageMetadata(
  "Contact Sankhala",
  "Call, WhatsApp or email Sankhala to discuss staffing requirements and career opportunities across Dubai and the UAE.",
  "/contact",
);

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">Contact us</p>
        <h1 className="page-title">Talk to our recruitment team.</h1>
        <p className="lead">
          Call, message or email Sankhala about a staffing requirement or your
          job search. Choose the way that works for you.
        </p>
      </header>

      <div className="content-grid">
        <div className="contact-options">
          <a href={site.contact.phoneHref} className="contact-option">
            <PhoneIcon size={28} weight="light" aria-hidden="true" />
            <span>
              <span className="section-label">Call our team</span>
              <strong>{site.contact.phone}</strong>
            </span>
            <ArrowUpRightIcon size={22} aria-hidden="true" />
          </a>
          <a
            href={site.contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-option"
          >
            <WhatsappLogoIcon size={28} weight="light" aria-hidden="true" />
            <span>
              <span className="section-label">Message on WhatsApp</span>
              <strong>{site.contact.whatsapp}</strong>
              <span className="sr-only">Opens in a new tab</span>
            </span>
            <ArrowUpRightIcon size={22} aria-hidden="true" />
          </a>
          <a href={site.contact.emailHref} className="contact-option">
            <EnvelopeSimpleIcon size={28} weight="light" aria-hidden="true" />
            <span>
              <span className="section-label">Email us</span>
              <strong>{site.contact.email}</strong>
            </span>
            <ArrowUpRightIcon size={22} aria-hidden="true" />
          </a>
        </div>

        <aside className="content-panel content-panel-dark stack">
          <MapPinIcon size={40} weight="light" aria-hidden="true" />
          <span className="section-label">Service area</span>
          <h2 className="section-heading">Dubai and all UAE emirates.</h2>
          <p>
            We welcome inquiries from Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al
            Khaimah, Fujairah and Umm Al Quwain.
          </p>
          <p className="field-hint">
            Include the role and location in your message. If you are hiring,
            let us know how many people you need. If you are looking for work,
            tell us about your experience.
          </p>
        </aside>
      </div>

      <section className="contact-office" aria-labelledby="office-heading">
        <div className="contact-office-details">
          <p className="eyebrow">Our office</p>
          <h2 id="office-heading" className="section-heading">
            Visit us in Deira.
          </h2>
          <address>{site.office.address}</address>
          <p>
            Call our team before travelling to confirm availability and arrange
            your visit.
          </p>
          <a
            href={site.office.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary"
          >
            Get directions <ArrowUpRightIcon size={20} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <iframe
          src={site.office.mapEmbedUrl}
          title="Google Maps location reference for Business Village, Deira"
          width="600"
          height="450"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>

      <div className="content-grid">
        <Link href="/hire-talent" className="content-panel stack inline-link">
          <span className="section-label">I represent a company</span>
          <span>Prepare your staffing requirement</span>
          <ArrowUpRightIcon size={24} aria-hidden="true" />
        </Link>
        <Link href="/jobs" className="content-panel stack inline-link">
          <span className="section-label">I’m looking for work</span>
          <span>View job opportunities</span>
          <ArrowUpRightIcon size={24} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
