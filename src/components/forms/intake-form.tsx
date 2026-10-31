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

export function IntakeForm({ kind, contact }: IntakeFormProps) {
  const candidate = kind === "candidate";
  const interactive = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const required = candidate
      ? ["fullName", "email", "phone", "location", "role"]
      : [
          "company",
          "fullName",
          "email",
          "phone",
          "role",
          "headcount",
          "emirate",
          "location",
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

  return (
    <form
      className="content-panel stack intake-form"
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
      <h2 className="section-heading">
        {candidate ? "Your candidate profile" : "Your staffing requirement"}
      </h2>
      <div className="form-notice" role="note">
        <strong>Online submissions are not open yet.</strong>
        <p>
          You can explore this form, but details are not sent or saved.{" "}
          {candidate ? "A selected CV stays on your device. " : ""}For now,{" "}
          <a href={contact.emailHref} className="inline-link">
            email our team
          </a>{" "}
          or{" "}
          <a href={contact.phoneHref} className="inline-link">
            give us a call
          </a>
          .
        </p>
      </div>
      <p className="field-hint">
        All fields are required unless marked optional.
      </p>
      <fieldset className="form-grid" disabled={!interactive}>
        <legend className="sr-only">
          {candidate ? "Candidate details" : "Company staffing details"}
        </legend>
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
        <div className="form-field">
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
          </>
        )}
        <div className="form-field form-field-wide">
          <label htmlFor={`${kind}-location`}>
            {candidate ? "Current city and country" : "Work location or area"}
          </label>
          <input
            id={`${kind}-location`}
            name="location"
            autoComplete={candidate ? "address-level2" : "off"}
            required
            maxLength={200}
            {...fieldState("location")}
          />
          {fieldError("location")}
        </div>
        {candidate && (
          <div className="form-field form-field-wide">
            <label htmlFor="candidate-cv">CV document</label>
            <input
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
                setFileName(file?.name ?? "");
                const error = file ? checkFile(file) : undefined;
                event.currentTarget.setCustomValidity(error ?? "");
                setErrors((previous) => ({ ...previous, cv: error ?? "" }));
              }}
            />
            <p id="cv-hint" className="field-hint">
              PDF or DOCX, up to 5 MB. Selecting a file does not upload it.
            </p>
            {fileName && <p className="field-hint">Selected: {fileName}</p>}
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
            rows={4}
            maxLength={2000}
          />
        </div>
      </fieldset>
      <p className="field-hint">
        Please do not include identity documents or bank details.{" "}
        <Link href="/privacy" className="inline-link">
          Read the privacy information.
        </Link>
      </p>
      <button
        type="submit"
        className="button button-primary"
        disabled={!interactive}
      >
        Check my details
      </button>
      <div
        ref={statusRef}
        className={status ? "form-status" : undefined}
        role="status"
        tabIndex={-1}
        aria-live="polite"
      >
        {status}
      </div>
      <div className="button-row">
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
