import Link from "next/link";
import { StateGallery } from "@/components/careers/state-gallery";
import { previewMetadata } from "@/lib/career-preview";
export const metadata = previewMetadata(
  "Component states",
  "/design/careers/states",
);
export default function CareerStates() {
  return (
    <main id="main" tabIndex={-1} className="page-shell career-shell">
      <header className="page-intro">
        <p className="eyebrow">Careers design system / 04</p>
        <h1 className="page-title">Clear at every step.</h1>
        <p className="lead">
          A reusable library of role cards, filters, application fields and
          feedback. These controls illustrate loading, empty, error and closed
          states.
        </p>
      </header>
      <div className="career-foundations">
        <section className="career-card">
          <h2>Typography</h2>
          <p>
            Barlow Condensed 600 for headings. Inter 400–600 for body, forms and
            navigation.
          </p>
        </section>
        <section className="career-card">
          <h2>Brand and themes</h2>
          <div className="career-swatches" aria-hidden="true">
            <span className="career-swatch-charcoal" />
            <span className="career-swatch-red" />
            <span className="career-swatch-surface" />
          </div>
          <p>
            Charcoal #2E2E2E, action red #D92323, and semantic light/dark
            surfaces.
          </p>
        </section>
        <section className="career-card">
          <h2>Layout and controls</h2>
          <p>
            24/32px layout gaps, 16px cards, 8px controls and visible keyboard
            focus. Motion respects reduced-motion preferences.
          </p>
        </section>
      </div>
      <StateGallery />
      <section className="career-notice">
        <h2>Validation and review</h2>
        <p>
          The application preview includes linked field errors, local file
          checks, editable details and a final review.
        </p>
        <Link
          className="button button-secondary"
          href="/design/careers/sample-sales-associate/apply"
        >
          Try application validation
        </Link>
      </section>
    </main>
  );
}
