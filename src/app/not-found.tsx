import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="foundation">
      <div className="foundation-copy">
        <h1>This page could not be found.</h1>
        <p>Return to Sankhala Employment.</p>
      </div>
      <Link href="/" className="home-link">
        Back to home
      </Link>
    </main>
  );
}
