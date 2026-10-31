import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata(
  "Privacy information",
  "Information about the current Sankhala website preview, local form inputs and contacting the team.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <header className="page-intro">
        <p className="eyebrow">Privacy information</p>
        <h1 className="page-title">Your information matters.</h1>
        <p className="lead">
          Here is what the current website preview does with the information you
          enter.
        </p>
      </header>
      <article className="content-panel stack">
        <h2 className="section-heading">Online submissions are not open.</h2>
        <p>
          The hiring and CV forms currently demonstrate the intended experience.
          Their fields are checked in your browser. They do not send or save
          your details to Sankhala, and choosing a CV does not upload the file.
        </p>
        <h2 className="section-heading">Contacting us directly</h2>
        <p>
          Email, call and WhatsApp links open the relevant service on your
          device. Information you choose to send through those services is
          handled outside this preview. Do not send identity documents, bank
          details or unrelated sensitive information with an initial inquiry.
        </p>
        <h2 className="section-heading">Google Maps</h2>
        <p>
          The Contact page includes a Google Maps embed. When it loads, your
          browser connects to Google to display the location. Google handles
          those requests under its{" "}
          <a href="https://policies.google.com/privacy" className="inline-link">
            privacy policy
          </a>
          .
        </p>
        <h2 className="section-heading">Your display preference</h2>
        <p>
          If you choose a light or dark theme, the website remembers that
          preference in this browser. This preference is not an application or a
          candidate profile.
        </p>
        <h2 className="section-heading">Before online applications launch</h2>
        <p>
          A complete notice describing application storage, authorized access
          and retention will be made available before online CV submissions
          open.
        </p>
        <p>
          For questions, contact{" "}
          <a href={site.contact.emailHref} className="inline-link">
            {site.contact.email}
          </a>
          .
        </p>
      </article>
    </main>
  );
}
