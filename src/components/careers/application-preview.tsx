"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState, useSyncExternalStore } from "react";
import type { PreviewJob } from "@/lib/career-preview";

const subscribe = () => () => {};
const labels: Record<string, string> = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  location: "Current city and country",
  cv: "CV document",
};

export function ApplicationPreview({ job }: { job: PreviewJob }) {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [filename, setFilename] = useState("");
  const [complete, setComplete] = useState(false);
  const summary = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function fileError(cv: File | undefined) {
    if (!cv?.size) return "Choose a PDF or DOCX file.";
    if (
      !/\.(pdf|docx)$/i.test(cv.name) ||
      (cv.type &&
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(cv.type))
    )
      return "Choose a PDF or DOCX file.";
    if (cv.size > 5 * 1024 * 1024) return "Choose a file no larger than 5 MB.";
    return "";
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const next: Record<string, string> = {};
    for (const name of ["name", "email", "phone", "location"]) {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      if (!input.value.trim()) next[name] = "Complete this field.";
      else if (!input.validity.valid)
        next[name] =
          name === "email"
            ? "Enter a valid email address."
            : input.validationMessage;
      else if (
        name === "phone" &&
        (!/^[+\d\s().-]+$/.test(input.value) ||
          input.value.replace(/\D/g, "").length < 6)
      )
        next[name] = "Include a valid phone number and country code.";
    }
    const cvError = fileError(file.current?.files?.[0]);
    if (cvError) next.cv = cvError;
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    const data = new FormData(form);
    setDetails(
      Object.fromEntries(
        ["name", "email", "phone", "location", "notes"].map((name) => [
          name,
          String(data.get(name) ?? "").trim(),
        ]),
      ),
    );
    setStep(2);
    requestAnimationFrame(() => heading.current?.focus());
  }

  const fieldState = (name: string) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `apply-${name}-error` : undefined,
  });
  const error = (name: string) =>
    errors[name] ? (
      <p className="field-error" id={`apply-${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  if (complete)
    return (
      <section
        className="career-notice"
        role="status"
        id="preview-complete"
        tabIndex={-1}
      >
        <h2>Design preview complete.</h2>
        <p>
          No application was sent or saved. Your CV was not uploaded. This was a
          fictional role used to review the application design.
        </p>
        <Link href="/design/careers" className="button button-primary">
          Back to sample roles
        </Link>
        <Link href="/submit-cv" className="inline-link">
          Visit the general CV page
        </Link>
      </section>
    );

  return (
    <div className="career-application">
      <ol className="career-steps" aria-label="Application progress">
        <li aria-current={step === 1 ? "step" : undefined}>
          <span>01</span> Your details and CV
        </li>
        <li aria-current={step === 2 ? "step" : undefined}>
          <span>02</span> Review application
        </li>
      </ol>
      <form
        ref={formRef}
        onSubmit={review}
        noValidate
        className="career-card"
        onChange={(event) => {
          const target = event.target;
          if (
            (target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement) &&
            target.name !== "cv"
          )
            setErrors((previous) => {
              const next = { ...previous };
              delete next[target.name];
              return next;
            });
        }}
      >
        <div hidden={step !== 1}>
          <h2>Application details</h2>
          <p className="career-footnote">
            All fields are required unless marked optional. Use sample
            information for this preview.
          </p>
          <section
            ref={summary}
            tabIndex={-1}
            className="form-error-summary"
            aria-labelledby="apply-errors"
            hidden={!Object.keys(errors).length}
          >
            <h3 id="apply-errors">Check your application details</h3>
            <ul>
              {Object.entries(errors).map(([name, message]) => (
                <li key={name}>
                  <a
                    href={`#apply-${name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(`apply-${name}`)?.focus();
                    }}
                  >
                    {labels[name]}: {message}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <fieldset disabled={!ready} className="career-fields">
            <legend className="sr-only">Candidate information</legend>
            {[
              ["name", "Full name", "text", "name"],
              ["email", "Email address", "email", "email"],
              ["phone", "Phone number", "tel", "tel"],
              [
                "location",
                "Current city and country",
                "text",
                "address-level2",
              ],
            ].map(([name, label, type, autocomplete]) => (
              <div className="form-field" key={name}>
                <label htmlFor={`apply-${name}`}>{label}</label>
                <input
                  id={`apply-${name}`}
                  name={name}
                  type={type}
                  autoComplete={autocomplete}
                  maxLength={name === "email" ? 254 : 160}
                  required
                  {...fieldState(name)}
                />
                {error(name)}
              </div>
            ))}
            <div className="form-field career-field-wide">
              <label htmlFor="apply-cv">CV document</label>
              <input
                ref={file}
                id="apply-cv"
                type="file"
                name="cv"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                {...fieldState("cv")}
                aria-describedby={`apply-cv-hint${errors.cv ? " apply-cv-error" : ""}`}
                onChange={(event) => {
                  const selected = event.currentTarget.files?.[0];
                  setFilename(
                    selected
                      ? `${selected.name} · ${Math.max(1, Math.ceil(selected.size / 1024))} KB`
                      : "",
                  );
                  const message = fileError(selected);
                  setErrors((previous) => {
                    const next = { ...previous };
                    if (message) next.cv = message;
                    else delete next.cv;
                    return next;
                  });
                }}
              />
              <p className="field-hint" id="apply-cv-hint">
                PDF or DOCX, up to 5 MB. The file stays on your device.
              </p>
              {filename && (
                <div className="career-file">
                  <span>{filename}</span>
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => {
                      if (file.current) file.current.value = "";
                      setFilename("");
                      setErrors((previous) => ({
                        ...previous,
                        cv: "Choose a PDF or DOCX file.",
                      }));
                      file.current?.focus();
                    }}
                  >
                    Remove file
                  </button>
                </div>
              )}
              {error("cv")}
            </div>
            <div className="form-field career-field-wide">
              <label htmlFor="apply-notes">
                Additional information (optional)
              </label>
              <textarea
                name="notes"
                id="apply-notes"
                rows={3}
                maxLength={1500}
              />
            </div>
          </fieldset>
          <p className="field-hint">
            Please use sample details and avoid identity or bank documents.
          </p>
          <button
            type="submit"
            className="button button-primary"
            disabled={!ready}
          >
            Review application
          </button>
        </div>
        <section hidden={step !== 2} aria-labelledby="application-review">
          <h2 ref={heading} id="application-review" tabIndex={-1}>
            Review your application
          </h2>
          <p>
            This is a design preview for <strong>{job.title}</strong> (
            {job.reference}). Nothing will be sent.
          </p>
          <dl className="career-review">
            {Object.entries(labels).map(([name, label]) => (
              <div key={name}>
                <dt>{label}</dt>
                <dd>{name === "cv" ? filename : details[name]}</dd>
              </div>
            ))}
            {details.notes && (
              <div>
                <dt>Additional information</dt>
                <dd>{details.notes}</dd>
              </div>
            )}
          </dl>
          <div className="career-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setStep(1);
                requestAnimationFrame(() =>
                  document.getElementById("apply-name")?.focus(),
                );
              }}
            >
              Edit details
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                formRef.current?.reset();
                setDetails({});
                setFilename("");
                setComplete(true);
                requestAnimationFrame(() =>
                  document.getElementById("preview-complete")?.focus(),
                );
              }}
            >
              Finish design preview
            </button>
          </div>
        </section>
      </form>
      <noscript>
        <p className="career-notice">
          JavaScript is needed to try the application preview. You can still
          read the sample role and use the public contact links.
        </p>
      </noscript>
    </div>
  );
}
