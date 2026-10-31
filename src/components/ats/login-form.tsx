"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
export function LoginForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.get("email"),
          password: values.get("password"),
          rememberMe: false,
        }),
      });
      if (!response.ok)
        throw new Error(
          "Sign in failed. Check your email and password, or try again later.",
        );
      const staff = await fetch("/api/ats/admin/options", {
        cache: "no-store",
      });
      if (!staff.ok)
        throw new Error(
          "This account does not have active staff access. Contact your administrator.",
        );
      router.replace("/admin?tab=overview");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" tabIndex={-1} className="ats-admin-shell ats-login-shell">
      <div className="content-panel stack ats-login-panel">
        <BrandLogo />
        <p className="eyebrow">Sankhala recruitment</p>
        <h1>Staff sign in</h1>
        <p>
          Access applications, candidates and your assigned recruitment work.
        </p>
        {!enabled && (
          <p role="status">
            Staff access is not configured in this environment.
          </p>
        )}
        <form onSubmit={signIn} className="stack">
          <div className="form-field">
            <label htmlFor="staff-email">Work email</label>
            <input
              id="staff-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </div>
          <div className="form-field">
            <label htmlFor="staff-password">Password</label>
            <input
              id="staff-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </div>
          {error && (
            <p
              ref={errorRef}
              tabIndex={-1}
              className="field-error"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={busy || !enabled}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="field-hint">
          Staff access is created by your administrator. Contact your
          administrator if you need access or a password reset.
        </p>
        <ThemeToggle />
      </div>
    </main>
  );
}
