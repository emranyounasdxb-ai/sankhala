"use client";

import { useRef, useState } from "react";

export type EmailDraft = { subject: string; body: string };

export function EmailHandoff({
  draft,
  emailHref,
  candidate,
}: {
  draft: EmailDraft;
  emailHref: string;
  candidate: boolean;
}) {
  const text = useRef<HTMLTextAreaElement>(null);
  const [feedback, setFeedback] = useState("");

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      setFeedback("Details copied. You can paste them into an email.");
    } catch {
      text.current?.focus();
      text.current?.select();
      setFeedback(
        "Automatic copying is unavailable. Select and copy the message below.",
      );
    }
  }

  return (
    <section className="email-handoff" aria-labelledby="email-handoff-title">
      <h3 id="email-handoff-title">Review your message</h3>
      <p>
        Your details have not been sent. Review this message, then copy it or
        open a draft in your email app.
      </p>
      <label htmlFor="email-handoff-message">Email message</label>
      <textarea
        ref={text}
        id="email-handoff-message"
        readOnly
        value={`${draft.subject}\n\n${draft.body}`}
        rows={10}
      />
      {candidate && (
        <p className="handoff-reminder">
          <strong>Attach your CV in your email app.</strong> The selected file
          is still on your device and is not attached automatically.
        </p>
      )}
      <div className="handoff-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={copyDetails}
        >
          Copy details
        </button>
        <a
          className="button button-primary"
          href={`${emailHref}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
        >
          Prepare email draft
        </a>
      </div>
      <p className="field-hint">
        You choose when to send. If your email app does not open or the full
        message is missing, use Copy details.
      </p>
      <p role="status" aria-live="polite">
        {feedback}
      </p>
    </section>
  );
}
