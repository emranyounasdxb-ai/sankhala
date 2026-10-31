"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { StaffIdentity } from "@/lib/ats/permissions";
export function AdminShell({
  staff,
  current,
  children,
}: {
  staff: StaffIdentity;
  current: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const links = [
    ["overview", "Overview"],
    ["applications", "Applications"],
    ["candidates", "Candidates"],
    ...(staff.role === "admin"
      ? [
          ["jobs", "Jobs"],
          ["clients", "Clients"],
          ["team", "Team access"],
          ["activity", "Activity"],
          ["retention", "Retention"],
        ]
      : []),
    ["account", "My account"],
  ];
  async function signOut() {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (response.ok) {
      router.replace("/admin/login");
      router.refresh();
    }
  }
  return (
    <main id="main" tabIndex={-1} className="ats-admin-shell">
      <aside className="ats-sidebar">
        <Link
          href="/admin?tab=overview"
          aria-label="Sankhala recruitment overview"
        >
          <BrandLogo />
        </Link>
        <p className="eyebrow">Recruitment workspace</p>
        <nav aria-label="Recruitment navigation">
          {links.map(([id, title]) => (
            <Link
              key={id}
              href={`/admin?tab=${id}`}
              aria-current={current === id ? "page" : undefined}
            >
              {title}
            </Link>
          ))}
        </nav>
        <div className="ats-sidebar-bottom">
          <ThemeToggle />
          <Link href="/">Public website</Link>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
          <small>{staff.role.replace("_", " ")}</small>
        </div>
      </aside>
      <section className="ats-admin-content">{children}</section>
    </main>
  );
}
