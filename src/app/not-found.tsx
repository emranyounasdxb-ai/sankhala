import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">404 / A different direction</p>
        <h1 className="page-title">This page could not be found.</h1>
        <p className="lead">Let’s get you back to your next opportunity.</p>
      </div>
      <Link href="/" className="button button-primary">
        Back to home
      </Link>
    </main>
  );
}
