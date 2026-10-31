# Careers design system and preview

The owner subsequently supplied the [public category and publication policy](careers-content-policy.md). The public Careers page now exposes future-interest categories while vacancy sections remain empty. Preview details reserve all 11 required employment fields; unknown terms are marked awaiting confirmation. Fixture origins distinguish fictional internal and client roles.

31 October 2026. This is a reusable frontend design system for the four approved Careers steps. It uses the locked Sankhala brand and existing stack. Sample roles are fictional fixtures, not vacancies, clients or confirmed recruitment specialisms.

## Foundations

- Barlow Condensed 600 headings; Inter 400/500/600 body, controls and labels. Form text is 16px; supporting metadata is 14px. Headings use the existing responsive page scale.
- Charcoal `#2E2E2E`, accent red `#FF3131`, action red `#D92323`; existing semantic surface, text, link, border and focus tokens provide both themes.
- Main layout gaps 24/32px; cards use 16px corners, controls 8px. Controls retain visible keyboard focus and generous touch targets. Filter/detail grids collapse on mobile; review values and filenames wrap.
- Loading uses static skeleton shapes. No layout or background animations were added; the preview works with reduced-motion preferences.

## Routes and components

| Step | Review route | Components and behavior |
| --- | --- | --- |
| Listing | `/design/careers` | `JobCard`, `JobFacts`, keyword/emirate/type filters using GET query URLs; reload and browser navigation preserve the selected query. All seven emirates are selectable. |
| Role detail | `/design/careers/sample-sales-associate` | Responsibilities, requirements, metadata, breadcrumbs and application CTA; unknown roles return 404. |
| Application | `/design/careers/sample-sales-associate/apply` | `ApplicationPreview`: details/CV, linked errors, final review, edit/back, retained local file selection and explicit preview completion. |
| State library | `/design/careers/states` | Foundations, `JobSkeleton`, no-match reset, illustrated error/retry, closed role, and a link to exercise validation. |

The closed fixture `/design/careers/sample-warehouse-assistant` has a disabled apply action. Its direct `/apply` route also blocks the form. Real Next.js loading and error boundaries reuse the same state language; the gallery allows deliberate inspection without provoking runtime failures.

## Application contract

The preview collects sample name, email, phone, current location, optional notes and a local PDF/DOCX selection up to 5 MB. Empty, invalid-type and oversized files are rejected. Invalid submissions focus a linked summary; review and edit restore focus. Returning to edit retains inputs and the selected file. Finishing clears the form and displays “Design preview complete” with an explicit nothing-sent message. No email, network write, upload, database, profile storage or analytics was added. With JavaScript disabled, application controls remain disabled and the notice explains the limitation; sample listings and detail links remain readable.

## Public content and integration

`/jobs` retains its honest empty state. Preview routes have permanent noindex/nofollow metadata, are excluded from the explicit public sitemap, and emit no JobPosting schema. A visible preview notice appears across the route family. This is not authentication or private hosting: anyone with a preview URL can open it.

`PreviewJob` and local fixtures provide a UI contract. Later backend integration should supply genuine published roles, verify availability on submission, validate on the server, store CVs privately and show success only after durable persistence. The mock fixtures must not be connected to the live job feed.

## Verification

Build, TypeScript and Biome passed. Fifty-five distinct Careers scenarios were verified across Chromium desktop, Pixel emulation, Firefox desktop, WebKit desktop and iPhone emulation: 40 passed in the initial run and the final focused run passed the remaining 15. Coverage includes query persistence/reset, no-match filters, detail/closed routes, CV format/size validation, retained inputs/file selection, edit/review/completion, no network writes, noindex metadata, absence of JobPosting markup, sitemap exclusion and preservation of the public empty state.

Forty independent route/theme axe audits passed with zero violations, including 320px dark layouts. The detail page application sidebar has its own accessible landmark name. A test selector was scoped to the illustrated error panel so Next.js's route announcer could not match it. Desktop listing and mobile dark detail/application layouts were inspected. Mobile checks are emulation; physical Safari/iPhone/Android hardware remains unverified.

Focused final command:

```powershell
.\scripts\npm.ps1 run test:e2e '--' tests/career-preview.spec.ts --grep 'illustrated|career accessibility (light|dark): /design/careers/sample-sales-associate$'
```
