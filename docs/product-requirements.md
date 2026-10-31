# Sankhala recruitment MVP

Confirmed from the user's business brief on 31 October 2026. This document records product requirements; it does not claim the features below are implemented.

## Purpose and coverage

Sankhala collects staffing requirements from companies and CVs/applications from job seekers. The recruitment team manually reviews submissions, matches candidates, arranges interviews and follows hiring progress.

Confirmed coverage: **Dubai and all UAE emirates**. This establishes the service area, not a verified street address, licence, office network or branch list.

| Official detail | Confirmed value |
| --- | --- |
| Website domain | `https://sankhala.ae` |
| Public email | `info@sankhala.ae` |
| Calls and WhatsApp | `+971 56 524 3800` |
| Phone link | `tel:+971565243800` |
| WhatsApp link | `https://wa.me/971565243800` |

Specific industries and the initial authorized administrator's email remain pending. The public contact email must not be treated as an authorized admin identity without a separate designation.

## First release

### Public homepage

- Introduce the company using confirmed business information.
- Show two clear entry points: **Hire Talent** for companies and **Find a Job** for candidates.
- Explain services, confirmed recruitment industries and the hiring process.
- Follow the [updated design direction](design-direction.md), original branding and locked technical stack. The user clarified that the first concept is a reference, not a strict copy; deliver a more modern design with complete light and dark themes. Retain the relevant typography and token guidance from `design.md`.
- Use restrained scroll and text effects with reduced-motion support and readable server-rendered content.
- Treat the homepage as a two-audience entry page. Both requested actions are intentional; do not remove one to enforce a single-action landing-page template.

### Companies: Hire Talent

Collect the required role, number of staff, work location and company contact details. The team receives each successful requirement in the private admin panel, contacts the company, shortlists candidates, arranges interviews and follows the hire.

Proposed form fields derived from that workflow:

| Field | Requirement |
| --- | --- |
| Company name | Required |
| Contact person | Required |
| Work email | Required |
| Contact phone | Required; accept international formatting |
| Required job role | Required |
| Number of staff | Required positive whole number |
| Emirate and work location | Required |
| Additional requirements | Optional |

Form success means the record was durably stored and can be retrieved by the authorized team. Submitting a private requirement must not automatically publish it as a public vacancy or disclose the company's contact information. Email notifications, if added later, are an additional delivery channel rather than the sole copy of a submission.

### Candidates: Find a Job and Submit CV

- Candidates can browse open vacancies and read each job's details without creating an account.
- Each open job has an application form with CV upload.
- **Submit CV** accepts a general application when there is no suitable vacancy.
- Job applications retain their associated vacancy. General CV submissions remain distinguishable from applications to a specific job.
- Keep each submission's CV version. A later upload must not silently replace a document attached to an earlier application.
- Proposed minimum applicant fields: full name, email, phone, current location and CV. A preferred role is included for general submissions; additional notes are optional.
- Do not ask for passports, national ID, bank details or unrelated personal information in the initial application.
- If no jobs are published, show a genuine empty state with a working Submit CV route. Never publish sample jobs as real vacancies.
- Closing a job prevents new applications on the server, including submissions from a page opened before the job was closed. Existing applications remain available to the team.

### Private team admin

The authorized team can:

1. Add, edit, publish and close vacancies.
2. View companies' staffing requirements.
3. View candidate submissions and job applications.
4. Access the CV associated with each submission.
5. Update the candidate/application pipeline: **New → Reviewed → Shortlisted → Interview → Hired**.

Track pipeline status per submission/application, rather than globally changing every application by the same person. Record who changed a status and when. Company requirement follow-up is a separate workflow; its detailed status labels are not yet finalized.

Admin accounts are limited to authorized team members. No public admin registration is part of the MVP. Authorization must protect every admin page, data operation and CV download, not just the visible navigation.

### Company information pages

About, Services and Contact present real company information. Direct call, WhatsApp and email actions use the confirmed contact details above. Do not invent social accounts, industry expertise, customer logos, reviews, metrics or legal statements.

## Planned routes

These routes are the implementation plan, not currently available pages.

| Route | Purpose |
| --- | --- |
| `/` | Introduction, two audience routes, services, industries and process |
| `/hire-talent` | Company staff requirement form |
| `/jobs` | Open vacancies and relevant filters |
| `/jobs/[slug]` | Job details and apply action |
| `/jobs/[slug]/apply` | Application to one open vacancy |
| `/submit-cv` | General candidate submission |
| `/about` | Confirmed company information |
| `/services` | Confirmed recruitment services |
| `/contact` | Real contact details and direct contact actions |
| `/admin/login` | Authorized team sign-in |
| `/admin` | Operational overview |
| `/admin/jobs` | Vacancy management |
| `/admin/requirements` | Employer requirements and follow-up |
| `/admin/applications` | Job applications and general CV submissions |

Privacy and other necessary information pages must reflect the actual business and data-handling process before collecting real CVs at launch. Their wording and retention period remain to be provided or agreed.

## Private documents and submission integrity

- CV files belong in private storage, never in `public/`, Git, public image assets or publicly readable storage buckets.
- Downloads require an authenticated, authorized team member. If temporary download links are used, create them only after the same permission check and give them a short expiry.
- Validate forms and uploads on the server, regardless of browser validation.
- Proposed upload defaults: PDF or DOCX, maximum 5 MB. Validate actual file content as well as extension/type, use generated storage keys and arrange malware screening before real-world use.
- Use durable storage, file/record consistency handling, and duplicate-submit protection. Do not show success if the record or upload failed.
- Add appropriate abuse controls for anonymous forms and uploads. Do not expose application records through public APIs, page HTML, analytics or logs.
- Keep contact-data and CV access out of search indexes. `noindex` is not a substitute for authentication or storage permissions.
- Preserve operational history when a job closes; closing a vacancy does not delete its applicants or their CVs.

## First-release boundaries

Included: public information pages, employer inquiries, public jobs, CV/application submission, private team administration and manual matching.

Deferred: candidate accounts, employer dashboards, automated matching, automated screening/ranking and candidate self-service tracking. No payment collection or candidate fees have been requested.

## Acceptance criteria

- Hire Talent and Find a Job lead to distinct, understandable routes on desktop and mobile.
- An employer submission is stored, visible to the team and shows the submitted role, headcount, location and contact information.
- An application contains the correct job association; a general CV is identified as a general submission.
- CV upload failures preserve useful form input and show specific errors without a false success message.
- Unauthenticated or unauthorized visitors cannot list submissions, view private records, modify jobs or download CVs.
- Team members can publish/close a job and update a submission through the specified pipeline.
- Closed jobs reject new applications while keeping existing records.
- No candidate login or employer account is required for the initial public forms.
- Public pages have semantic HTML, accessible forms, keyboard focus, mobile layouts, reduced-motion behavior and meaningful metadata.
- Light and dark themes cover the real pages and all controls, with an accessible persistent theme switcher and correct logo variants.
- Only real published vacancies enter job listings and any job-specific structured data. Closed vacancies lose their active apply action and active-job markup.

## Confirmed versus pending

Confirmed: two audiences, manual recruitment workflow, private CV access, candidate pipeline, initial account-free submissions, Dubai/all-UAE coverage, official domain, email and call/WhatsApp number.

The supplied [homepage concept](reference/sankhala-homepage-concept.png) and [modern layout reference](reference/modern-layout-reference.png) are preserved. The latest [design clarification](design-direction.md) supersedes the original brief's exact-copy instructions and requires both themes. The first image's bottom Design System strip is documentation only. Embedded workplace imagery is concept material, not proof of actual employees; a separate approved photography asset has not been supplied.

Pending: specific industries, detailed company/about information, initial admin email, real vacancies, separate approved photography, production backend/storage/authentication setup and retention/privacy decisions.
