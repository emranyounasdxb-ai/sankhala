"use client";

import { useState } from "react";
import { previewJobs } from "@/lib/career-preview";
import { ClosedRole, JobCard, JobSkeleton } from "./career-components";

const states = [
  "Loading",
  "No matches",
  "Load error",
  "Closed vacancy",
] as const;
export function StateGallery() {
  const [state, setState] = useState<string>("Loading");
  return (
    <>
      <fieldset
        className="career-state-tabs"
        aria-label="Preview a component state"
      >
        {states.map((label) => (
          <button
            className="button button-secondary"
            type="button"
            key={label}
            aria-pressed={state === label}
            onClick={() => setState(label)}
          >
            {label}
          </button>
        ))}
      </fieldset>
      <section
        className="career-state-stage"
        aria-label="Selected component state"
      >
        <p className="section-label">Illustrated state: {state}</p>
        {state === "Loading" ? (
          <JobSkeleton />
        ) : state === "No matches" ? (
          <div className="career-notice">
            <h2>No roles match these filters.</h2>
            <p>Clear your filters to explore the sample cards again.</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setState("Sample result")}
            >
              Clear filters
            </button>
          </div>
        ) : state === "Load error" ? (
          <div className="career-notice" role="alert">
            <h2>We could not load the roles.</h2>
            <p>
              This is an illustrated error state. In the live service, your
              filters would stay in place while you retry.
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setState("Sample result")}
            >
              Retry preview
            </button>
          </div>
        ) : state === "Closed vacancy" ? (
          <ClosedRole />
        ) : (
          <JobCard job={previewJobs[0]} />
        )}
      </section>
    </>
  );
}
