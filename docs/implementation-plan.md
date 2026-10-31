# MVP implementation structure

Planning baseline: [confirmed product requirements](product-requirements.md), [current design direction](design-direction.md), the relevant parts of the [saved original design specification](../design.md), and [locked frontend stack](stack.md).

The existing Next.js foundation remains in place. This plan does not provision a cloud service, connect an unrelated database, create an admin account or imply that submissions can already be received.

## Data relationships

| Record | Purpose and relationships |
| --- | --- |
| Job | Public vacancy content, stable slug, publication state and closing information |
| Staff requirement | Company's role, headcount, location, contact details and team follow-up |
| Candidate submission | Applicant contact snapshot, current location, optional preferred role and notes, pipeline stage, optional job reference |
| Private document | CV storage key and validated file metadata, linked to a submission |
| Team member | Approved authenticated user and active access permission |
| Status history | Previous/new stage, actor, timestamp and related submission |

A candidate may submit to multiple jobs. Do not automatically merge records by name or email in a way that exposes or overwrites another submission. General CVs have no vacancy reference. A submitted application retains its original association, CV version and contact snapshot when a vacancy is edited later. A private employer requirement may be linked to an approved public job, but submission alone must not publish it.

## Backend requirements

Choose a production backend that supplies durable relational records, authenticated team sessions and private document storage. Apply server-side authorization to each operation and storage access path. Database, authentication provider, storage provider and email delivery are not yet selected or installed; their setup follows the confirmed workflow and available project infrastructure.

The first release needs a working private inbox in the admin panel. Notifications are optional enhancements, not the only place records are stored. Public forms must not return success until persistence is complete.

## Build order

1. Establish the application data model, private storage and team authentication. Add migrations and fixtures isolated from live data; verify anonymous access is denied.
2. Build shared header/footer, complete light/dark themes with a persistent accessible control, and public pages using confirmed copy, UAE coverage and the two audience routes. Use genuine empty states until actual vacancies and industries are supplied.
3. Implement the employer form, job application flow and general CV submission, including server validation, upload consistency, abuse controls and failure recovery.
4. Implement vacancy management, company requirement review, candidate submission review, authorized CV access and status history in the private admin panel.
5. Verify complete public-to-admin workflows, permissions, closed-job races, file handling, keyboard and mobile behavior, reduced motion and SEO. Configure the real domain and indexing only for a ready launch.

## Public versus private rendering

Marketing pages and published job details should produce meaningful server-rendered HTML. Keep GSAP behavior in focused client components. Do not send private applicant data into public page props, static output, metadata, sitemap files or client bundles.

Admin pages, application records and CV downloads require authentication and appropriate private/no-store response behavior. Public job data can be cached with invalidation when jobs change or close. The application submission handler must recheck whether the job is still accepting applications.

## Content readiness

- The two primary actions and manual recruitment process are confirmed.
- Service area wording can cover Dubai and all UAE emirates without inventing offices or branches.
- The official domain is `https://sankhala.ae`, public email is `info@sankhala.ae`, calling number is `+971 4 611 3100`, and WhatsApp remains `+971 56 524 3800`. The confirmed office is Office 218, Business Village B, Deira, Dubai; the supplied Google map is included on Contact. Contact and office values are centralized in `src/lib/site.ts`; the admin identity remains to be designated.
- Industry sections, detailed About copy, real vacancies and privacy content need actual business information.
- Both reference images are saved. Follow [the latest clarification](design-direction.md): use them as inspiration for a more modern layout, with both light and dark themes, rather than copying the first concept exactly. Exclude the first image's bottom Design System strip. Separate approved photography remains unavailable.

## Verification plan

Retain the existing build, type, lint and browser checks. As features are implemented, add checks for meaningful risks: private access, persistent submission delivery, file validation, job closure, status history, and clear failure behavior. Automated accessibility checks supplement actual keyboard and rendered desktop/mobile inspection.

This plan records the next work. No full public form or private admin implementation is claimed by this planning update.
