# Saved project progress

## Current ATS work — 31 October 2026

The owner requested backend/ATS implementation and finalized **Node.js / Next.js on existing InMotion cPanel**, superseding the earlier frontend-only deferral and interim PHP request. Initial admin and HR notification recipient: **admin@sankhala.ae**. The isolated production database/private directories are provisioned; production credentials, application release and automatic deployment are being configured.

Implemented the local ATS: database transactions and idempotency, separate candidate/job/application records, immutable application snapshots, duplicate review/linking, private documents with quarantine, authenticated scoped staff access, jobs/client/team management, filters, notes, interviews, status history, Talent Pool, CSV/XLSX and a notification outbox. The public candidate form supports review and durable submission. Local integration and 20 desktop/mobile theme accessibility audits passed. Six candidate/HR emails reached an isolated STARTTLS mail sink, and encrypted SQL plus three documents were restored into a separate scratch database; corrupt backup authentication failed as expected. Employer intake retains its email-draft handoff. Local records labeled `[TEST]` are not seeded on production.

The historical frontend progress below describes earlier milestones; earlier references to a pending admin email or deferred backend are superseded by this update.

Latest navigation pass: public Careers now searches role/category names, keeps keyword/open-category state in shareable URLs and restores it from the CV page or browser back. Empty vacancy messaging is compact and selected CV roles are visible above the form. [Navigation details](careers-navigation.md).

Navigation verification: build/type/lint passed; 31 supported checks passed across five browser projects (four duplicate server cases skipped). Final layout follow-up passed seven desktop/iPhone checks with one duplicate skip. Physical-device testing remains unverified.

Latest Careers content: added the owner's 12 categories, supplied role titles, 12 priority role interests and separate Sankhala/client vacancy sections. Both vacancy sections remain empty until real employer-confirmed roles are supplied. Future-interest links prefill the editable general CV role. Preview job details reserve all 11 required employment fields without inventing terms. [Publication policy](careers-content-policy.md).

This business-content pass passed build/type/lint, 35 service-content checks and 20 Careers-category checks across three desktop browser engines plus Pixel/iPhone emulation. The local production preview remains on port 3001.

Latest business-content update: the owner confirmed six services, four sectors and four worker categories. Home, Services, About, Contact and Hire Talent now reflect this broader scope, with HR/PRO and payroll inquiries directed to Contact. [Confirmed company services](company-services.md) supersedes earlier industry-pending notes. Office timings, company photos/history and live vacancies remain pending.

Careers follow-up: implemented the four approved frontend steps under `/design/careers`, including sample filters, role details, local application/review, and a foundations/state gallery. Public `/jobs` remains empty; fictional fixtures have no JobPosting markup, sitemap entry or indexing permission. [Design system and integration contract](careers-design-system.md).

Careers validation: build, type and lint passed, and 55 distinct focused browser scenarios were verified across five projects, including 40 route/theme axe audits. Physical devices remain unverified; no backend or live jobs were added.

Latest follow-up: forms now provide a reviewable email message, clipboard copying with manual fallback and an encoded email-draft link after validation. Editing fields or changing the CV clears stale drafts; candidates attach files manually. Services briefing guidance, candidate FAQs, visit guidance and privacy wording are updated. Build/type/lint passed, as did 20 focused cross-browser checks and four final mobile checks. [Details, local lab report and pending business facts](verification/email-handoff.md).

Updated on 31 October 2026 after the five approved frontend improvements and office/contact updates. The user explicitly deferred backend, real jobs and CRM/database work.

## Completed

- Connected the local Sankhala folder to `https://github.com/emranyounasdxb-ai/sankhala` with `main` tracking `origin/main`.
- Preserved both supplied transparent logo PNGs unchanged in `brand/originals/`.
- Created 43 image exports covering light and dark website logos, compact S marks, favicons, app and touch icons, social previews, avatars, covers, and an email logo.
- Saved measured logo colors, usage documentation, integration examples, a preview sheet, and reproducible export and verification scripts.
- Verified source fidelity, image dimensions, transparency, lossless exports, favicon contents, safe cropping of app icons, and integration asset paths.
- Saved the user's supplied `design.md` unchanged at the repository root. Source SHA-256: `74deee45b97f94982965c3185feaf4f1b87b84afa466e1efe3c0f6a98d1b3c3c`.
- Selected and documented the exact [website stack](stack.md): Next.js App Router, React, TypeScript, Tailwind CSS, GSAP ScrollTrigger/SplitText, Zod, Phosphor icons, local fonts, Biome, Playwright and axe.
- Added a pinned, project-local Node 26.13.0 LTS and npm 12.2.1 setup; dependency versions are exact and repeatable installs use lockfiles.
- Installed the locked dependencies and established local fonts, design color primitives, reusable motion components, native metadata, robots/sitemap routes, and browser checks. The earlier foundation stage passed its build, type, lint, browser and brand checks, and its dependency audit reported zero known vulnerabilities; that historical result is not a claim about the latest frontend revision.
- Saved the confirmed two-audience recruitment workflow in `docs/product-requirements.md` and its routes, data relationships and implementation order in `docs/implementation-plan.md`.
- Recorded Dubai and all UAE emirates as the service area; saved `https://sankhala.ae`, `info@sankhala.ae`, calling number `+971 4 611 3100` and separate WhatsApp number `+971 56 524 3800` in the shared site configuration. The user subsequently supplied Office 218, Business Village B, Deira, Dubai, with a Google Maps embed and directions link. Specific industries and initial admin email remain pending.
- Preserved the supplied homepage concept unchanged at `docs/reference/sankhala-homepage-concept.png` for visual comparison.
- Saved the second image at `docs/reference/modern-layout-reference.png` and recorded the latest direction in `docs/design-direction.md`: modernize the reference layout and provide complete light and dark themes. This supersedes the exact-copy language in the original brief.
- Replaced the holding page with a modern homepage: photographic hero, separate employer and candidate routes, service cards, UAE coverage, the recruitment process, an opportunity introduction, native FAQ disclosures and contact links.
- Implemented `/about`, `/services`, `/contact`, `/hire-talent`, `/jobs`, `/submit-cv` and `/privacy`, along with a branded not-found page. Public pages have route metadata and canonical URLs; prelaunch indexing remains disabled.
- Added shared navigation and footer, active navigation states, a full-height mobile menu, keyboard focus handling, a skip link and a theme control. The first visit follows the system theme; an explicit choice persists in this browser.
- Applied the locked Barlow Condensed and Inter fonts throughout the responsive light and dark layouts. GSAP enhancements support section entrances and text effects while keeping the underlying content server rendered and respecting reduced motion.
- Created a representative hero scene, preserved the PNG in `brand/photography/`, and saved its optimized WebP in `public/images/`. [Provenance and the exact prompt](reference/hero-image.md) document that it is generated imagery, not actual Sankhala staff or premises.
- Added employer and candidate form previews with field validation, file-type and size checks, explanatory notices and direct contact alternatives. The forms do not send or save details; selected CVs stay on the device. The jobs page contains no invented vacancies.
- Polished recruitment copy, separate employer/candidate journeys, FAQ content, compact mobile spacing, stable sticky navigation and restrained hover/menu effects. About, Services and Contact use confirmed facts; no industries, team photos or business proof were invented.
- Grouped the intake forms and added filename/size, replace/remove controls, accessible inline errors and keyboard focus restoration. Details and CVs remain local; backend integration is deferred.
- Deferred optional GSAP downloads until sections approach the viewport, retained plain content for reduced motion, removed an unused font preload and corrected responsive logo/hero sizing. Approved font families and colors are unchanged.
- The earlier polish pass passed its production build, TypeScript and Biome checks and 17 Chromium browser checks; three duplicate viewport scenarios were intentionally skipped. Coverage included route metadata, responsive layouts at 320/390/768/1440px, both themes, keyboard navigation, sticky-header geometry, accessibility, no-JavaScript content, actual scroll-text activation and local form behavior. Desktop, tablet and mobile screenshots were inspected.
- Recorded a repeatable local production comparison: initial JavaScript 194,045 → 147,707 bytes (23.9% lower), resource transfer 348,613 → 268,127 bytes (23.1% lower), median LCP 1,688 → 1,600ms, observed CLS 0. These are simulated local samples, not field performance guarantees. [Conditions and raw reports](verification/frontend-polish.md).
- Added persistent field examples and a focusable, linked validation summary on both forms; corrected fields update their feedback without losing entries or moving focus.
- Replaced Hire Talent's header/menu self-link with WhatsApp and added mobile call/WhatsApp shortcuts before the form.
- Added the confirmed office address, responsive Google map and directions to Contact; separated the new landline calling number from the existing WhatsApp number throughout public contacts and SEO data. The supplied map pin reads ALIYAS Real Estate; its use is recorded as a location reference.
- Added homepage Organization JSON-LD from confirmed data and a brief Google Maps disclosure in the current privacy information.
- Installed Firefox and WebKit browser binaries and expanded automated coverage to three desktop engines plus Pixel/iPhone emulation. Fixed a system-theme change missed before hydration and added a deterministic regression check. [Latest verification scope](verification/frontend-final-pass.md).
- The current revision passed build, TypeScript and Biome checks. Across the full run and focused final rerun, all 101 supported scenarios passed, including 30 independent route/theme axe audits with zero violations. Four native Tab scenarios are explicitly unsupported in Windows WebKit; ten duplicate server/no-JavaScript scenarios are skipped. Physical phone testing remains unavailable. The final focused rerun was 46 passed, four skipped; [verification details and limitations](verification/frontend-final-pass.md).

## Recorded design direction

The [supplied specification](../design.md) describes Barlow Condensed headings, Inter body text, a white and charcoal palette with red accents, and darker action red `#D92323`. The [latest user direction](design-direction.md) retains the branding but requires a more modern layout inspired by the two supplied references and full light/dark themes, rather than exact reproduction of the first concept.

Font loading, the homepage, public navigation, service cards, inquiry form previews and theme tokens are implemented. The reusable animation components enhance server-rendered text while preserving readable content without JavaScript or with reduced motion. The existing `public/brand/brand-colors.css` contains asset color primitives; application tokens and responsive layouts are in `src/app/globals.css`. The design-system strip in the supplied concept remains outside the public homepage.

The current local preview serves the optimized production build at `http://127.0.0.1:3001` using `npm run start -- --port 3001`. Development still uses `npm run dev` with hot reloading; use its printed port if 3000 is occupied. No public deployment has taken place.

## Work to resume later

- Connect the implemented public frontend to the confirmed recruitment MVP: company staff requirements, jobs, job applications, general CV submission and private team administration with manual matching. Candidate login, employer dashboards and automatic matching are deferred.
- Select and configure the production database, private file storage and team authentication. No application backend has been provisioned yet.
- Build authorized private administration for jobs, company requirements, candidates and the New → Reviewed → Shortlisted → Interview → Hired pipeline. CV access must be restricted to the authorized team.
- Review the generated representative hero or replace it with approved company photography if desired. It must not be described as actual team photography without confirmation.
- Obtain detailed company history, approved photography, office hours/visit policy, initial admin email, real vacancies and the data-retention/privacy information needed before launch. Services, sectors and worker categories are confirmed in the latest business-content update.
- Approve and publish complete privacy information before opening online applications, then verify backend access, storage, submissions and administration end to end.

The public frontend is implemented for local review. The recruitment MVP is not complete: public forms are explicitly labeled previews, and durable application storage, private CV storage, authentication and the admin panel remain pending. The canonical domain and official contact information are configured; keep `SEO_INDEXABLE=false` until the finished site and approved content are ready.
