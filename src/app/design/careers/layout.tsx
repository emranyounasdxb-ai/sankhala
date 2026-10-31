import Link from "next/link";
import type { ReactNode } from "react";
import "./careers.css";
export const metadata = { robots: { index: false, follow: false } };

export default function CareersPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <aside className="career-preview-bar">
        <div className="wrap">
          <strong>Design preview</strong>
          <span>
            Fictional sample roles. No live vacancies. Nothing is submitted.
          </span>
          <nav aria-label="Careers preview">
            <Link href="/design/careers">Sample roles</Link>
            <Link href="/design/careers/states">Component states</Link>
            <Link href="/jobs">Public Careers page</Link>
          </nav>
        </div>
      </aside>
      {children}
    </>
  );
}
