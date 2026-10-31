# Sankhala ATS requirements

Confirmed 31 October 2026. The user has now authorized backend/ATS implementation, superseding the earlier frontend-only deferral. Production must use the user's existing InMotion cPanel hosting for `sankhala.ae`. PHP 8.5.12, Node.js 24.22.2 and MariaDB are available; an isolated empty `sankhala_ats` database and private directories have been created. [Verified hosting setup and pending architecture choice](hosting-cpanel.md). Initial administrator: **admin@sankhala.ae**, also the initial HR notification recipient unless separately changed. “AMAFH internal” in the example is treated as Sankhala's internal hiring group; no AMAFH database is authorized for this project.

## Identity and application history

Candidate, Job and Application have separate unique IDs. Every application holds an immutable snapshot of the candidate details, selected job/client/category, documents and consent at submission time. Multiple applications can link to one canonical candidate. Email/phone matches flag possible duplicates; unverified matches must never automatically overwrite or merge someone else's profile. HR confirms duplicate resolution, and reassignment/merge preserves every application snapshot and records an audit event.

## Form and job-derived fields

Personal details; current country and UAE emirate; server-selected applied job and preferred work location; total/UAE experience and last title; skills/languages/qualifications; notice/joining availability; expected monthly AED salary; applicable visa type/expiry; role-specific driving licence or trade/certification; CV and optional relevant certificates; explicit recruitment processing consent.

Job category and client are always derived from the stored job record, never trusted from candidate-supplied fields. Jobs must be genuinely available and employer-confirmed and contain all previously required vacancy fields. Internal jobs and client jobs remain distinct. General CV submissions have no fabricated job association.

## HR workflow

Stages: New → Screening → Shortlisted → Interview → Offered → Hired, with Rejected available. Stage, recruiter assignment and every change are application-specific. Dashboard: totals/new-unread, counts per job, candidate profile, private documents, multiple filters, interview schedule, notes/history, selected CSV/XLSX exports and Talent Pool. Filters include category, job, client, location, experience band, availability, status, recruiter and date range.

## Delivery and operations

The database commit creates the application reference and an email outbox entry atomically. On-screen receipt follows durable persistence. Candidate and HR notifications are retried independently; delivery failure must never erase or disguise a saved application. All CVs/certificates are private, checked server-side and released only to authorized staff. Roles: admin, recruiter and hiring manager, with explicit record scope. Track views, downloads, exports and changes. Include abuse controls, retention/deletion workflows, backup scheduling and tested restoration of both records and documents.

Production integrations must target only this identified Sankhala hosting/account and the isolated ATS database. The connected AMAFH profile and other local project containers are unrelated and must remain untouched. No unrelated database has been accessed or modified.
