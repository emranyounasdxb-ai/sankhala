import {
  ArrowUpRightIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" aria-label="Sankhala Employment home">
            <BrandLogo inverse />
          </Link>
          <p className="footer-tagline">People. Possibilities. Progress.</p>
          <p className="footer-area">Dubai and all UAE emirates.</p>
        </div>
        <div className="footer-links">
          <h2>Company</h2>
          <Link href="/about">About Sankhala</Link>
          <Link href="/services">Our services</Link>
          <Link href="/contact">Get in touch</Link>
        </div>
        <div className="footer-links">
          <h2>Your next step</h2>
          <Link href="/hire-talent">Hire Talent</Link>
          <Link href="/jobs">Find a Job</Link>
          <Link href="/submit-cv">Submit CV</Link>
        </div>
        <div className="footer-contact">
          <h2>Let’s talk</h2>
          <a href={site.contact.emailHref}>
            <EnvelopeSimpleIcon size={18} aria-hidden="true" />
            {site.contact.email}
          </a>
          <a href={site.contact.phoneHref}>
            <PhoneIcon size={18} aria-hidden="true" />
            {site.contact.phone}
          </a>
          <a
            href={site.contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogoIcon size={18} aria-hidden="true" />
            WhatsApp <ArrowUpRightIcon size={16} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Sankhala Employment. All rights reserved.</p>
        <Link href="/privacy">Privacy</Link>
        <span>Made for your next chapter.</span>
      </div>
    </footer>
  );
}
