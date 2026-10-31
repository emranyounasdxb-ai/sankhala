import { atsEnabled } from "@/lib/ats/db";
import { createPageMetadata } from "@/lib/page-metadata";
import { site } from "@/lib/site";
export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Privacy information",
  "Information about the current Sankhala website preview, local form inputs and contacting the team.",
  "/privacy",
);

export default function PrivacyPage() {
  if (atsEnabled())
    return (
      <main id="main" tabIndex={-1} className="page-shell">
        <header className="page-intro">
          <p className="eyebrow">Recruitment privacy</p>
          <h1 className="page-title">Your information matters.</h1>
          <p className="lead">
            How Sankhala uses the information you choose to send through this
            website.
          </p>
        </header>
        <article className="content-panel stack">
          <h2 className="section-heading">Applications and general CVs</h2>
          <p>
            When you send an application, we save your contact information,
            location, experience, qualifications, skills, role preferences,
            availability and expected salary. We also save applicable UAE visa
            information, licence or certification details, your CV, optional
            certificates and your recruitment consent.
          </p>
          <p>
            We use these details to review your suitability, contact you,
            coordinate recruitment and consider suitable future opportunities.
            An application for a published job is linked to that vacancy. A
            general CV is recorded as an interest in future opportunities.
          </p>
          <h2 className="section-heading">
            Private storage and authorized access
          </h2>
          <p>
            Applications are stored in our recruitment database. Documents are
            held in private storage and are not available through public file
            links. Authorized administrators and assigned recruitment staff can
            review records and checked documents according to their access.
            Hiring managers have access only to their assigned recruitment work.
          </p>
          <p>
            Our team may share relevant application information with a hiring
            company as part of the recruitment process for a role. The public
            website does not expose candidate profiles or CVs. Website hosting
            and email services support storage and recruitment communications.
          </p>
          <h2 className="section-heading">
            Confirmations and recruitment history
          </h2>
          <p>
            After your application is saved, the website shows an application
            reference and queues confirmation emails. Email delivery can take
            time or fail independently of the saved application. Keep your
            reference if you contact us.
          </p>
          <p>
            Each application retains the details and job terms submitted at that
            time. Possible duplicate profiles are reviewed by staff; matching
            contact information does not automatically replace an existing
            profile. Staff views, downloads, exports and recruitment changes are
            logged.
          </p>
          <h2 className="section-heading">Review and deletion requests</h2>
          <p>
            Candidate records are scheduled for retention review, normally after{" "}
            {Math.min(
              3650,
              Math.max(30, Number(process.env.ATS_RETENTION_DAYS) || 365),
            )}{" "}
            days. Review does not automatically delete a record. Contact us to
            request a correction, access review or deletion. The team verifies
            requests and reviews any applicable hold before deleting documents
            and anonymizing recruitment records.
          </p>
          <p>
            Encrypted backup copies follow a separate retention cycle. Copies
            already sent by email or shared with a hiring company are outside
            the website database and need to be considered when handling a
            request.
          </p>
          <h2 className="section-heading">What to include</h2>
          <p>
            Send only documents relevant to recruitment. Do not upload
            passports, Emirates IDs, bank details or unrelated sensitive
            information through this initial application form.
          </p>
          <h2 className="section-heading">Cookies and other services</h2>
          <p>
            The website stores your chosen display theme in this browser. Staff
            sign in uses session cookies. Public applicants do not need an
            account. Contact links open your email, phone or WhatsApp service;
            messages you send there are handled by that service.
          </p>
          <p>
            The Contact page includes Google Maps. Loading the map connects your
            browser to Google, which handles those requests under its{" "}
            <a
              className="inline-link"
              href="https://policies.google.com/privacy"
            >
              privacy policy
            </a>
            .
          </p>
          <h2 className="section-heading">Contact the team</h2>
          <p>
            For recruitment information or a data request, email{" "}
            <a className="inline-link" href={site.contact.emailHref}>
              {site.contact.email}
            </a>
            . Include your application reference if you have one.
          </p>
        </article>
      </main>
    );
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
          After checking your form, you can review a message, copy it to your
          clipboard or open an email draft. These actions happen only when you
          choose them. The website does not send the email or attach your CV;
          you review and send it in your email app.
        </p>
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
