"use client";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  availabilityTypes,
  type CandidateSubmission,
  candidateSubmissionSchema,
  emirates,
  visaTypes,
} from "@/lib/ats/domain";

type Review = { details: CandidateSubmission; cv: File; certificates: File[] };
export function ApplicationForm({
  jobId,
  jobTitle,
  initialRole = "",
}: {
  jobId?: string;
  jobTitle?: string;
  initialRole?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null),
    summaryRef = useRef<HTMLDivElement>(null),
    receiptRef = useRef<HTMLDivElement>(null),
    keyRef = useRef<string | null>(null);
  const [country, setCountry] = useState("United Arab Emirates"),
    [visa, setVisa] = useState("Not applicable"),
    [availability, setAvailability] = useState("Immediate"),
    [role, setRole] = useState(initialRole);
  const [token, setToken] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState(""),
    [review, setReview] = useState<Review | null>(null),
    [busy, setBusy] = useState(false),
    [attempted, setAttempted] = useState(false),
    [receipt, setReceipt] = useState("");
  const inUae = ["AE", "UAE", "UNITED ARAB EMIRATES"].includes(
    country.trim().toUpperCase(),
  );
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ats/intake-token", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => setToken(data.token))
      .catch(() => {
        if (!controller.signal.aborted)
          setMessage(
            "Online applications could not be loaded. Reload this page or email info@sankhala.ae.",
          );
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (Object.keys(errors).length || message) summaryRef.current?.focus();
  }, [errors, message]);
  useEffect(() => {
    if (receipt) receiptRef.current?.focus();
  }, [receipt]);
  const fieldError = (name: string) =>
    errors[name] ? (
      <p className="field-error" id={`ats-${name}-error`}>
        {errors[name]}
      </p>
    ) : null;
  const input = (
    name: string,
    label: string,
    type = "text",
    options: {
      required?: boolean;
      defaultValue?: string | number;
      hint?: string;
      wide?: boolean;
      maxLength?: number;
    } = {},
  ) => (
    <div
      className={`form-field${options.wide ? " form-field-wide" : ""}`}
      key={name}
    >
      <label htmlFor={`ats-${name}`}>
        {label}
        {options.required === false ? " (optional)" : ""}
      </label>
      <input
        id={`ats-${name}`}
        name={name}
        type={type}
        defaultValue={options.defaultValue}
        required={options.required !== false}
        maxLength={options.maxLength ?? 160}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.5" : undefined}
        autoComplete={
          name === "fullName"
            ? "name"
            : name === "email"
              ? "email"
              : name === "phone"
                ? "tel"
                : undefined
        }
        aria-invalid={!!errors[name]}
        aria-describedby={
          errors[name]
            ? `ats-${name}-error`
            : options.hint
              ? `ats-${name}-hint`
              : undefined
        }
      />
      {options.hint && (
        <p className="field-hint" id={`ats-${name}-hint`}>
          {options.hint}
        </p>
      )}
      {fieldError(name)}
    </div>
  );
  const area = (name: string, label: string, maxLength: number) => (
    <div className="form-field form-field-wide">
      <label htmlFor={`ats-${name}`}>{label}</label>
      <textarea
        id={`ats-${name}`}
        name={name}
        rows={3}
        maxLength={maxLength}
        required
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `ats-${name}-error` : undefined}
      />
      {fieldError(name)}
    </div>
  );
  function reviewForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = Object.fromEntries(form.entries());
    const details = {
      fullName: String(value.fullName ?? ""),
      email: String(value.email ?? ""),
      phone: String(value.phone ?? ""),
      country,
      ...(inUae ? { emirate: String(value.emirate ?? "") } : {}),
      preferredLocation: String(value.preferredLocation ?? ""),
      totalExperienceYears: Number(value.totalExperienceYears),
      uaeExperienceYears: Number(value.uaeExperienceYears),
      lastJobTitle: String(value.lastJobTitle ?? ""),
      skills: String(value.skills ?? ""),
      languages: String(value.languages ?? ""),
      qualifications: String(value.qualifications ?? ""),
      availability,
      availabilityNotes: String(value.availabilityNotes ?? ""),
      expectedMonthlySalaryAed:
        value.expectedMonthlySalaryAed === ""
          ? Number.NaN
          : Number(value.expectedMonthlySalaryAed),
      visaType: visa,
      ...(value.visaExpiry ? { visaExpiry: String(value.visaExpiry) } : {}),
      visaNotes: String(value.visaNotes ?? ""),
      licenceCategory: String(value.licenceCategory ?? ""),
      tradeCertification: String(value.tradeCertification ?? ""),
      preferredRole: jobTitle ?? role,
      consent: value.consent === "on",
      consentVersion: "recruitment-v1",
    };
    const parsed = candidateSubmissionSchema.safeParse(details);
    const next: Record<string, string> = {};
    if (!parsed.success)
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
    const cv = form.get("cv"),
      certificates = form
        .getAll("certificates")
        .filter((file): file is File => file instanceof File && file.size > 0);
    if (!(cv instanceof File) || !cv.size || !/\.(pdf|docx)$/i.test(cv.name))
      next.cv = "Choose your CV as a PDF or DOCX.";
    else if (cv.size > 6 * 1024 * 1024)
      next.cv = "Choose a CV smaller than 6 MB.";
    if (
      certificates.length > 2 ||
      certificates.some(
        (file) =>
          file.size > 6 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(file.name),
      )
    )
      next.certificates =
        "Choose up to two PDF, PNG or JPG certificates, each under 6 MB.";
    if (
      cv instanceof File &&
      cv.size + certificates.reduce((size, file) => size + file.size, 0) >
        14 * 1024 * 1024
    )
      next.certificates = "Keep all documents under 14 MB in total.";
    setErrors(next);
    setMessage("");
    if (!Object.keys(next).length && parsed.success && cv instanceof File) {
      setReview({ details: parsed.data, cv, certificates });
      keyRef.current = crypto.randomUUID();
      setAttempted(false);
    }
  }
  async function send() {
    if (!review || !token) return;
    setBusy(true);
    setAttempted(true);
    setMessage("");
    const body = new FormData();
    body.set("details", JSON.stringify(review.details));
    body.set("idempotencyKey", keyRef.current ?? "");
    body.set("token", token);
    body.set(
      "website",
      String(new FormData(formRef.current ?? undefined).get("website") ?? ""),
    );
    if (jobId) body.set("jobId", jobId);
    body.set("cv", review.cv);
    for (const file of review.certificates) body.append("certificates", file);
    try {
      const response = await fetch("/api/ats/applications", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status < 500) setAttempted(false);
        setErrors(data.fields ?? {});
        throw new Error(
          data.error ??
            "We could not confirm this application. Retry the same details.",
        );
      }
      setReceipt(data.reference);
      setReview(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not confirm your application. Retry without changing your details to avoid a duplicate.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div
        className="content-panel stack"
        ref={receiptRef}
        tabIndex={-1}
        role="status"
      >
        <p className="eyebrow">Application received</p>
        <h2 className="section-heading">Thank you for your application.</h2>
        <p>Your application for {jobTitle ?? role} has been saved.</p>
        <p>
          <strong>Application reference: {receipt}</strong>
        </p>
        <p>
          Keep this reference for your records. A confirmation email is queued
          for delivery. Our team will review your application; this receipt does
          not guarantee an interview or offer.
        </p>
        <Link href="/jobs" className="button button-primary">
          Back to opportunities
        </Link>
      </div>
    );
  return (
    <form
      ref={formRef}
      onSubmit={reviewForm}
      className="content-panel stack intake-form intake-form-polished"
      noValidate
    >
      <div className="intake-form-heading">
        <h2 className="section-heading">
          {jobTitle ? `Apply for ${jobTitle}` : "Submit your CV"}
        </h2>
        <p className="field-hint">
          Complete your profile, review it, then send your application securely.
        </p>
      </div>
      {(message || Object.keys(errors).length > 0) && (
        <div
          ref={summaryRef}
          className="form-error-summary"
          tabIndex={-1}
          role="alert"
        >
          <h3>{message || "Check your application"}</h3>
          {Object.keys(errors).length > 0 && (
            <ul>
              {Object.entries(errors).map(([name, error]) => (
                <li key={name}>
                  <a
                    href={`#ats-${name}`}
                    onClick={() =>
                      document.getElementById(`ats-${name}`)?.focus()
                    }
                  >
                    {error}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="form-notice">
        <strong>
          {jobTitle
            ? "Applying for a confirmed vacancy"
            : "Future opportunities"}
        </strong>
        <p>
          {jobTitle
            ? "Your application will be linked to this vacancy automatically."
            : "This is a general CV submission. It is not an application for a currently available vacancy."}
        </p>
        <p>
          Documents are private and checked before authorized staff can open
          them.
        </p>
      </div>
      <div className="ats-honeypot" aria-hidden="true">
        <label htmlFor="ats-website">Website</label>
        <input
          id="ats-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div hidden={!!review}>
        <fieldset className="intake-group">
          <legend>01 — Personal details</legend>
          <div className="form-grid">
            {input("fullName", "Full name")}
            {input("email", "Email address", "email")}
            {input("phone", "Mobile / WhatsApp number", "tel", {
              hint: "Include the international country code, for example +971 50 123 4567.",
            })}
            <div className="form-field">
              <label htmlFor="ats-country">Current country</label>
              <input
                id="ats-country"
                name="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                maxLength={100}
                list="ats-country-options"
                required
                aria-invalid={!!errors.country}
              />
              <datalist id="ats-country-options">
                {[
                  "United Arab Emirates",
                  "India",
                  "Pakistan",
                  "Philippines",
                  "Nepal",
                  "Bangladesh",
                  "Sri Lanka",
                  "Other",
                ].map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
              <p className="field-hint">
                Enter your country name. If you are in the UAE, choose United
                Arab Emirates.
              </p>
              {fieldError("country")}
            </div>
            {inUae && (
              <div className="form-field">
                <label htmlFor="ats-emirate">Current emirate</label>
                <select
                  id="ats-emirate"
                  name="emirate"
                  required
                  aria-invalid={!!errors.emirate}
                >
                  <option value="">Choose an emirate</option>
                  {emirates.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                {fieldError("emirate")}
              </div>
            )}
          </div>
        </fieldset>
        <fieldset className="intake-group">
          <legend>02 — Role and experience</legend>
          <div className="form-grid">
            {!jobTitle && (
              <div className="form-field form-field-wide">
                <label htmlFor="ats-preferredRole">Preferred role</label>
                <input
                  id="ats-preferredRole"
                  name="preferredRole"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  maxLength={160}
                  required
                  aria-invalid={!!errors.preferredRole}
                />
                {fieldError("preferredRole")}
              </div>
            )}
            {input("preferredLocation", "Preferred work location", "text", {
              hint: "For example Dubai, Abu Dhabi or all UAE emirates.",
            })}
            {input(
              "totalExperienceYears",
              "Total experience in years",
              "number",
              { defaultValue: 0 },
            )}
            {input("uaeExperienceYears", "UAE experience in years", "number", {
              defaultValue: 0,
            })}
            {input("lastJobTitle", "Current or last job title", "text", {
              required: false,
              hint: "Required if you have previous work experience.",
            })}
            {area("skills", "Relevant skills", 2000)}
            {input("languages", "Languages")}
            {area("qualifications", "Qualifications", 1000)}
          </div>
        </fieldset>
        <fieldset className="intake-group">
          <legend>03 — Availability and UAE status</legend>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="ats-availability">Joining availability</label>
              <select
                id="ats-availability"
                name="availability"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
              >
                {availabilityTypes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            {availability === "Other" &&
              input(
                "availabilityNotes",
                "Joining availability details",
                "text",
                { maxLength: 300 },
              )}
            {input(
              "expectedMonthlySalaryAed",
              "Expected monthly salary in AED",
              "number",
            )}
            <div className="form-field">
              <label htmlFor="ats-visaType">UAE visa type</label>
              <select
                id="ats-visaType"
                name="visaType"
                value={visa}
                onChange={(event) => setVisa(event.target.value)}
              >
                {visaTypes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            {visa !== "Not applicable" &&
              input("visaExpiry", "Visa expiry date", "date")}
            {visa === "Other" &&
              input("visaNotes", "Visa details", "text", { maxLength: 300 })}
            {input("licenceCategory", "Driving licence category", "text", {
              required: false,
              hint: "For driving roles, include your licence category. Do not enter the licence number.",
              maxLength: 300,
            })}
            {input(
              "tradeCertification",
              "Trade or role certification",
              "text",
              {
                required: false,
                hint: "Include relevant trade or security certification, if applicable.",
                maxLength: 1000,
              },
            )}
          </div>
        </fieldset>
        <fieldset className="intake-group">
          <legend>04 — Documents and consent</legend>
          <div className="form-grid">
            <div className="form-field form-field-wide">
              <label htmlFor="ats-cv">Your CV</label>
              <input
                id="ats-cv"
                name="cv"
                type="file"
                accept=".pdf,.docx"
                required
                aria-invalid={!!errors.cv}
                aria-describedby="ats-cv-hint"
              />
              <p id="ats-cv-hint" className="field-hint">
                PDF or DOCX, up to 6 MB. Use a standard document without scripts
                or embedded files.
              </p>
              {fieldError("cv")}
            </div>
            <div className="form-field form-field-wide">
              <label htmlFor="ats-certificates">
                Relevant certificates (optional)
              </label>
              <input
                id="ats-certificates"
                name="certificates"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                aria-invalid={!!errors.certificates}
              />
              <p className="field-hint">
                Up to two files, each under 6 MB. Do not upload passports,
                Emirates IDs or bank details.
              </p>
              {fieldError("certificates")}
            </div>
            <div className="form-field form-field-wide">
              <label className="consent-label" htmlFor="ats-consent">
                <input
                  id="ats-consent"
                  name="consent"
                  type="checkbox"
                  required
                  aria-invalid={!!errors.consent}
                />
                I consent to Sankhala processing my details, CV and relevant
                certificates for recruitment and suitable future opportunities,
                as described in the{" "}
                <Link href="/privacy">privacy information</Link>.
              </label>
              {fieldError("consent")}
            </div>
          </div>
        </fieldset>
        <button
          type="submit"
          className="button button-primary"
          disabled={!token}
        >
          Review application
        </button>
      </div>
      {review && (
        <section
          className="stack ats-review"
          aria-label="Review your application"
        >
          <h3>Review your application</h3>
          <dl className="ats-review-grid">
            {[
              ["Name", review.details.fullName],
              ["Email", review.details.email],
              ["Phone", review.details.phone],
              ["Applied role", jobTitle ?? review.details.preferredRole],
              [
                "Current location",
                [review.details.emirate, review.details.country]
                  .filter(Boolean)
                  .join(", "),
              ],
              [
                "Experience",
                `${review.details.totalExperienceYears} years; ${review.details.uaeExperienceYears} in the UAE`,
              ],
              ["Availability", review.details.availability],
              [
                "Expected salary",
                `AED ${review.details.expectedMonthlySalaryAed} / month`,
              ],
              ["CV", review.cv.name],
              [
                "Certificates",
                review.certificates.map((file) => file.name).join(", ") ||
                  "None",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p>
            Your details and documents will be saved when you send this
            application.
          </p>
          <div className="ats-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={send}
              disabled={busy || !token}
            >
              {busy
                ? "Sending application…"
                : attempted
                  ? "Retry same application"
                  : "Send application"}
            </button>
            {!attempted && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setReview(null)}
              >
                Edit details
              </button>
            )}
          </div>
          {attempted && !busy && message && (
            <p className="field-hint">
              Keep these details unchanged while retrying. The same application
              reference will be returned if your previous request was saved.
            </p>
          )}
        </section>
      )}
    </form>
  );
}
