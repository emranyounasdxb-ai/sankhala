"use client";
import Link from "next/link";
export default function CareersError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main id="main" tabIndex={-1} className="page-shell career-shell">
      <div className="career-notice" role="alert">
        <h1 className="section-heading">The preview could not load.</h1>
        <p>Try loading it again or return to the public Careers page.</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => retry()}
        >
          Try again
        </button>
        <Link href="/jobs" className="inline-link">
          Public Careers page
        </Link>
      </div>
    </main>
  );
}
