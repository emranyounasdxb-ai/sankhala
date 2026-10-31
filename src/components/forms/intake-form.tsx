"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState, useSyncExternalStore } from "react";

type IntakeFormProps = {
  kind: "employer" | "candidate";
  contact: {
    email: string;
    emailHref: string;
    phoneHref: string;
    whatsappHref: string;
  };
};

const emirates = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];
const fileTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const subscribeToClient = () => () => {};

function checkFile(file: File | null): string | undefined {
  if (!file || file.size === 0) return "Choose your CV as a PDF or DOCX file.";
  if (
    !/\.(pdf|docx)$/i.test(file.name) ||
    (file.type && !fileTypes.has(file.type))
  )
    return "Choose a PDF or DOCX file.";
  if (file.size > 5 * 1024 * 1024) return "Choose a file smaller than 5 MB.";
  return undefined;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function IntakeForm({ kind, contact }: IntakeFormProps) {
  const candidate = kind === "candidate";
  const interactive = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const required = candidate
      ? ["fullName", "email", "phone", "location", "role"]
      : [
          "role",
          "headcount",
          "emirate",
          "location",
          "company",
          "fullName",
          "email",
          "phone",
        ];
    for (const field of required)
      if (!String(data.get(field) ?? "").trim())
        nextErrors[field] = "Please complete this field.";
    const phone = String(data.get("phone") ?? "").trim();
    if (!/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 6)
      nextErrors.phone = "Enter a contact number, including your country code.";
    if (!candidate) {
      const count = Number(data.get("headcount"));
      if (!Number.isInteger(count) || count < 1)
        nextErrors.headcount = "Enter a whole number of at least 1.";
    }
    if (candidate) {
      const file = data.get("cv");
      const error = checkFile(file instanceof File ? file : null);
      if (error) nextErrors.cv = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus(
        "Please check the highlighted fields. Your details have not been sent.",
      );
      const first = form.elements.namedItem(Object.keys(nextErrors)[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setStatus(
      "Your details have not been sent. Online submissions are not open yet. Please email or call our team using the links below.",
    );
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  function fieldError(name: string) {
    return errors[name] ? (
      <p id={`${kind}-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;
  }

  function fieldState(name: string) {
    return {
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${kind}-${name}-error` : undefined,
    };
  }

  function removeFile() {
    if (!fileRef.current) return;
    fileRef.current.value = "";
    fileRef.current.setCustomValidity("");
    setFileDetails(null);
    setErrors((previous) => ({ ...previous, cv: "" }));
    setStatus("");
    fileRef.current.focus();
  }

  const contactFields = (
    <>
      {!candidate && (
        <div className="form-field form-field-wide">
          <label htmlFor={`${kind}-company`}>Company name</label>
          <input
            id={`${kind}-company`}
            name="company"
            autoComplete="organization"
            required
            maxLength={160}
            {...fieldState("company")}
          />
          {fieldError("company")}
        </div>
      )}
      <div className="form-field">
        <label htmlFor={`${kind}-name`}>
          {candidate ? "Full name" : "Contact person"}
        </label>
        <input
          id={`${kind}-name`}
          name="fullName"
          autoComplete="name"
          required
          maxLength={120}
          {...fieldState("fullName")}
        />
        {fieldError("fullName")}
      </div>
      <div className="form-field">
        <label htmlFor={`${kind}-email`}>
          {candidate ? "Email address" : "Work email"}
        </label>
        <input
          id={`${kind}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          {...fieldState("email")}
        />
        {fieldError("email")}
      </div>
      <div className="form-field">
        <label htmlFor={`${kind}-phone`}>Phone number</label>
        <input
          id={`${kind}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+971"
          required
          maxLength={30}
          {...fieldState("phone")}
        />
        {fieldError("phone")}
      </div>
      {candidate && (
        <div className="form-field">
          <label htmlFor={`${kind}-location`}>Current city and country</label>
          <input
            id={`${kind}-location`}
            name="location"
            autoComplete="address-level2"
            required
            maxLength={200}
            {...fieldState("location")}
          />
          {fieldError("location")}
        </div>
      )}
    </>
  );

  const roleFields = (
    <>
      <div className={`form-field${candidate ? " form-field-wide" : ""}`}>
        <label htmlFor={`${kind}-role`}>
          {candidate ? "Preferred role" : "Role you are hiring for"}
        </label>
        <input
          id={`${kind}-role`}
          name="role"
          required
          maxLength={160}
          {...fieldState("role")}
        />
        {fieldError("role")}
      </div>
      {!candidate && (
        <>
          <div className="form-field">
            <label htmlFor={`${kind}-headcount`}>Number of people</label>
            <input
              id={`${kind}-headcount`}
              name="headcount"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              {...fieldState("headcount")}
            />
            {fieldError("headcount")}
          </div>
          <div className="form-field">
            <label htmlFor={`${kind}-emirate`}>Work emirate</label>
            <select
              id={`${kind}-emirate`}
              name="emirate"
              defaultValue=""
              required
              {...fieldState("emirate")}
            >
              <option value="" disabled>
                Select an emirate
              </option>
              {emirates.map((emirate) => (
                <option key={emirate} value={emirate}>
                  {emirate}
                </option>
              ))}
            </select>
            {fieldError("emirate")}
          </div>
          <div className="form-field">
            <label htmlFor={`${kind}-location`}>Work location or area</label>
            <input
              id={`${kind}-location`}
              name="location"
              autoComplete="off"
              required
              maxLength={200}
              {...fieldState("location")}
            />
            {fieldError("location")}
          </div>
        </>
      )}
      {candidate && (
        <div className="form-field form-field-wide">
          <label htmlFor="candidate-cv">CV document</label>
          <div className={`cv-picker${errors.cv ? " cv-picker-invalid" : ""}`}>
            <span className="cv-picker-title" aria-hidden="true">
              {fileDetails ? "Replace file" : "Choose your CV"}
            </span>
            <span className="cv-picker-format" aria-hidden="true">
              PDF or DOCX · Up to 5 MB
            </span>
            <input
              ref={fileRef}
              id="candidate-cv"
              name="cv"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              aria-describedby={
                errors.cv ? "candidate-cv-error cv-hint" : "cv-hint"
              }
              aria-invalid={!!errors.cv}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                setFileDetails(
                  file ? { name: file.name, size: file.size } : null,
                );
                const error = file ? checkFile(file) : undefined;
                event.currentTarget.setCustomValidity(error ?? "");
                setErrors((previous) => ({ ...previous, cv: error ?? "" }));
              }}
            />
          </div>
          {fileDetails && (
            <div className="cv-file-summary">
              <div className="cv-file-details">
                <p className="cv-file-name">Selected: {fileDetails.name}</p>
                <p className="field-hint">
                  {formatFileSize(fileDetails.size)} · On your device
                </p>
              </div>
              <button type="button" className="cv-remove" onClick={removeFile}>
                Remove file
              </button>
            </div>
          )}
          <p id="cv-hint" className="field-hint">
            Selecting a file does not upload it. The file stays on your device.
          </p>
          {fieldError("cv")}
        </div>
      )}
      <div className="form-field form-field-wide">
        <label htmlFor={`${kind}-message`}>
          {candidate
            ? "Anything else you would like to share?"
            : "Additional requirements"}{" "}
          <span className="field-hint">(optional)</span>
        </label>
        <textarea
          id={`${kind}-message`}
          name="message"
          rows={3}
          maxLength={2000}
        />
      </div>
    </>
  );

  return (
    <form
      className="content-panel stack intake-form intake-form-polished"
      onSubmit={handleSubmit}
      onChange={(event) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement ||
          target instanceof HTMLTextAreaElement
        ) {
          if (target.name !== "cv")
            setErrors((previous) => ({ ...previous, [target.name]: "" }));
          setStatus("");
        }
      }}
      onInvalid={(event) => {
        const target = event.target;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement
        )
          setErrors((previous) => ({
            ...previous,
            [target.name]: target.validationMessage,
          }));
      }}
    >
      <div className="intake-form-heading">
        <h2>
          {candidate ? "Your candidate profile" : "Your staffing requirement"}
        </h2>
        <p className="field-hint">
          All fields are required unless marked optional.
        </p>
      </div>
      <div className="form-notice" role="note">
        <strong>Online submissions are not open yet.</strong>
        <p>
          Explore this form without sending or saving details. For now,{" "}
          <a href={contact.emailHref}>email our team</a> or{" "}
          <a href={contact.phoneHref}>give us a call</a>.
        </p>
      </div>
      <fieldset className="intake-group" disabled={!interactive}>
        <legend>
          <span className="intake-group-number" aria-hidden="true">
            01
          </span>
          {candidate ? "Your details" : "Staff needed"}
        </legend>
        <div className="form-grid">
          {candidate ? contactFields : roleFields}
        </div>
      </fieldset>
      <fieldset className="intake-group" disabled={!interactive}>
        <legend>
          <span className="intake-group-number" aria-hidden="true">
            02
          </span>
          {candidate ? "Role and CV" : "Company and contact"}
        </legend>
        <div className="form-grid">
          {candidate ? roleFields : contactFields}
        </div>
      </fieldset>
      <div className="intake-form-end">
        <p className="field-hint">
          Please do not include identity documents or bank details.{" "}
          <Link href="/privacy">Read the privacy information.</Link>
        </p>
        <button
          type="submit"
          className="button button-primary"
          disabled={!interactive}
        >
          Check my details
        </button>
        <p className="field-hint">
          This checks your details on this page only.
        </p>
      </div>
      <div
        ref={statusRef}
        className="form-status"
        role="status"
        tabIndex={-1}
        aria-live="polite"
        hidden={!status}
      >
        {status}
      </div>
      <div className="intake-contact-options">
        <a href={contact.emailHref} className="inline-link">
          {contact.email}
        </a>
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-link"
        >
          Contact on WhatsApp
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <noscript>
        <p className="form-notice">
          This preview does not accept submissions. Please use the email or
          phone links to contact the team.
        </p>
      </noscript>
    </form>
  );
}
