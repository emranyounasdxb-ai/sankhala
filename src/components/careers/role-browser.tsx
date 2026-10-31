"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  futureCVHref,
  jobCategories,
  priorityRoles,
} from "@/lib/job-categories";
import { browseHref, browseState, categoryId } from "@/lib/role-navigation";

const eventName = "sankhala-role-navigation";
function subscribe(notify: () => void) {
  window.addEventListener("popstate", notify);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(eventName, notify);
  };
}
const snapshot = () => window.location.search;
const clientSubscribe = () => () => {};

export function RoleBrowser({ initialSearch }: { initialSearch: string }) {
  const ready = useSyncExternalStore(
    clientSubscribe,
    () => true,
    () => false,
  );
  const search = useSyncExternalStore(subscribe, snapshot, () => initialSearch);
  const { q, open } = browseState(search);
  const query = q.trim().toLowerCase();
  const categories = jobCategories
    .map((category) => ({
      ...category,
      id: categoryId(category.name),
      roles: category.name.toLowerCase().includes(query)
        ? category.roles
        : category.roles.filter((role) => role.toLowerCase().includes(query)),
    }))
    .filter((category) => category.roles.length);
  const [feedback, setFeedback] = useState("");
  const [fallback, setFallback] = useState("");
  const fallbackInput = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (fallback) {
      fallbackInput.current?.focus();
      fallbackInput.current?.select();
    }
  }, [fallback]);

  function update(nextQuery: string, nextOpen: string[], anchor = "") {
    window.history.replaceState(
      null,
      "",
      browseHref(nextQuery, nextOpen, anchor),
    );
    window.dispatchEvent(new Event(eventName));
    setFeedback("");
    setFallback("");
  }
  async function copyCategory(id: string) {
    const href = new URL(
      browseHref(q, [...open, id], id),
      window.location.origin,
    ).href;
    try {
      await navigator.clipboard.writeText(href);
      setFeedback("Category link copied. It includes your current search.");
      setFallback("");
    } catch {
      setFallback(href);
      setFeedback(
        "Automatic copying is unavailable. Select and copy the link below.",
      );
    }
  }
  const clear = () => {
    update("", []);
    requestAnimationFrame(() => results.current?.focus());
  };
  return (
    <section className="job-role-section" aria-labelledby="category-heading">
      <p className="eyebrow">Explore role categories</p>
      <h2 id="category-heading" className="section-heading">
        Find your area of work.
      </h2>
      <p>
        Search role types and categories for future opportunities. Current
        employer-confirmed vacancies will be listed in the sections above.
      </p>
      <form
        className="job-role-search"
        action="/jobs"
        onSubmit={(event) => {
          event.preventDefault();
          results.current?.focus();
        }}
      >
        <label htmlFor="role-category-search">Search a role or category</label>
        <div>
          <input
            id="role-category-search"
            name="q"
            type="search"
            maxLength={80}
            value={q}
            disabled={!ready}
            onChange={(event) => update(event.currentTarget.value, open)}
            placeholder="For example Cleaner, Driver or Electrician"
          />
          <input type="hidden" name="open" value={open.join(",")} />
          <button
            className="button button-primary"
            type="submit"
            disabled={!ready}
          >
            Search roles
          </button>
        </div>
      </form>
      <noscript>
        <form action="/jobs" className="job-role-search native-role-search">
          <label htmlFor="native-role-search">Role or category</label>
          <div>
            <input
              id="native-role-search"
              name="q"
              type="search"
              defaultValue={q}
              maxLength={80}
            />
            <input type="hidden" name="open" value={open.join(",")} />
            <button className="button button-primary" type="submit">
              Search roles
            </button>
          </div>
        </form>
        <p>
          <Link href="/jobs">Clear search and browse all categories</Link>.
        </p>
      </noscript>
      {!query && (
        <section
          className="job-priority-section"
          aria-labelledby="priority-roles"
        >
          <p className="eyebrow">Future opportunities</p>
          <h2 id="priority-roles" className="section-heading">
            Tell us your preferred role.
          </h2>
          <p>
            Select one of these priority role interests to prepare a general CV
            introduction for future opportunities.
          </p>
          <ul className="job-priority-roles">
            {priorityRoles.map((role) => (
              <li key={role}>
                <Link
                  prefetch={false}
                  href={futureCVHref(role, browseHref(q, open))}
                >
                  {role}
                  <span className="sr-only">
                    : submit CV for future opportunities
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="job-results-bar">
        <h3 ref={results} tabIndex={-1}>
          Role types for future opportunities
        </h3>
        <button
          className="inline-link"
          type="button"
          onClick={clear}
          disabled={!ready}
        >
          Clear search
        </button>
      </div>
      <p role="status" className="field-hint">
        {categories.reduce(
          (total, category) => total + category.roles.length,
          0,
        )}{" "}
        role types in {categories.length} categories
        {query ? ` matching “${q.trim()}”` : ""}. These are not vacancy counts.
      </p>
      {categories.length ? (
        <div className="job-category-grid">
          {categories.map((category) => (
            <details
              className="job-category"
              id={`category-${category.id}`}
              key={category.id}
              open={query ? true : open.includes(category.id)}
              onToggle={(event) => {
                if (query) return;
                const expanded = event.currentTarget.open;
                if (expanded === open.includes(category.id)) return;
                update(
                  q,
                  expanded
                    ? [...open, category.id]
                    : open.filter((id) => id !== category.id),
                );
              }}
            >
              <summary>
                {category.name}
                <span>{category.roles.length} role types</span>
              </summary>
              {category.note && (
                <p className="job-category-note">{category.note}</p>
              )}
              <p className="field-hint">
                Choose a role to submit your CV for future opportunities.
              </p>
              <ul>
                {category.roles.map((role) => (
                  <li key={role}>
                    <Link
                      prefetch={false}
                      href={futureCVHref(
                        role,
                        browseHref(q, [...open, category.id], category.id),
                      )}
                    >
                      {role}
                      <ArrowRightIcon size={18} aria-hidden="true" />
                      <span className="sr-only">
                        : submit CV for future opportunities
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="job-category-share">
                <Link
                  prefetch={false}
                  href={browseHref(q, [...open, category.id], category.id)}
                >
                  Direct category link
                </Link>
                <button
                  type="button"
                  className="inline-link"
                  onClick={() => copyCategory(category.id)}
                  disabled={!ready}
                >
                  Copy link
                  <span className="sr-only"> to {category.name}</span>
                </button>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="job-no-results">
          <h3>No role types match your search.</h3>
          <p>Try a broader role name or a category such as Logistics.</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={clear}
            disabled={!ready}
          >
            Show all role types
          </button>
        </div>
      )}
      <p className="field-hint" role="status">
        {feedback}
      </p>
      {fallback && (
        <div className="form-field">
          <label htmlFor="category-link-copy">Copy this category link</label>
          <input
            id="category-link-copy"
            ref={fallbackInput}
            readOnly
            value={fallback}
          />
        </div>
      )}
    </section>
  );
}
