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
        <h1 className="page-title">Let’s make the next move.</h1>
        <p className="lead">
          Hiring for your team or considering your next opportunity? Start a
          conversation with Sankhala.
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
              <strong>{site.contact.phone}</strong>
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
          <span className="section-label">Our reach</span>
          <h2 className="section-heading">Dubai. And every emirate.</h2>
          <p>
            We work with staffing requirements and candidates across the UAE.
            Include your location when you get in touch so we can understand
            your next step.
          </p>
          <p className="field-hint">
            For hiring inquiries, share the role and number of people needed.
            For career inquiries, include your preferred role.
          </p>
        </aside>
      </div>

      <div className="content-grid">
        <Link href="/hire-talent" className="content-panel stack inline-link">
          <span className="section-label">I represent a company</span>
          <span>Share a staffing requirement</span>
          <ArrowUpRightIcon size={24} aria-hidden="true" />
        </Link>
        <Link href="/jobs" className="content-panel stack inline-link">
          <span className="section-label">I’m looking for work</span>
          <span>Explore career opportunities</span>
          <ArrowUpRightIcon size={24} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
