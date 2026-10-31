# Saved project progress

Updated on 31 October 2026 while implementing the public website and local browser preview requested by the user.

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
- Recorded Dubai and all UAE emirates as the service area; saved `https://sankhala.ae`, `info@sankhala.ae`, and `+971 56 524 3800` for public calls and WhatsApp in the shared site configuration. Specific industries and initial admin email remain pending.
- Preserved the supplied homepage concept unchanged at `docs/reference/sankhala-homepage-concept.png` for visual comparison.
- Saved the second image at `docs/reference/modern-layout-reference.png` and recorded the latest direction in `docs/design-direction.md`: modernize the reference layout and provide complete light and dark themes. This supersedes the exact-copy language in the original brief.
- Replaced the holding page with a modern homepage: photographic hero, separate employer and candidate routes, service cards, UAE coverage, the recruitment process, an opportunity introduction, native FAQ disclosures and contact links.
- Implemented `/about`, `/services`, `/contact`, `/hire-talent`, `/jobs`, `/submit-cv` and `/privacy`, along with a branded not-found page. Public pages have route metadata and canonical URLs; prelaunch indexing remains disabled.
- Added shared navigation and footer, active navigation states, a full-height mobile menu, keyboard focus handling, a skip link and a theme control. The first visit follows the system theme; an explicit choice persists in this browser.
- Applied the locked Barlow Condensed and Inter fonts throughout the responsive light and dark layouts. GSAP enhancements support section entrances and text effects while keeping the underlying content server rendered and respecting reduced motion.
- Created a representative hero scene, preserved the PNG in `brand/photography/`, and saved its optimized WebP in `public/images/`. [Provenance and the exact prompt](reference/hero-image.md) document that it is generated imagery, not actual Sankhala staff or premises.
- Added employer and candidate form previews with field validation, file-type and size checks, explanatory notices and direct contact alternatives. The forms do not send or save details; selected CVs stay on the device. The jobs page contains no invented vacancies.
- Expanded the browser scenarios in `tests/foundation.spec.ts` to cover the public frontend. The final frontend run passed the production build, TypeScript check, Biome check, and 13 browser checks; three duplicate viewport scenarios are intentionally skipped. Browser coverage includes route metadata, responsive layouts at 320/390/768/1440px, both themes, keyboard navigation, accessibility, no-JavaScript content, scroll text and local form behavior. Desktop, tablet and mobile screenshots were also inspected.

## Recorded design direction

The [supplied specification](../design.md) describes Barlow Condensed headings, Inter body text, a white and charcoal palette with red accents, and darker action red `#D92323`. The [latest user direction](design-direction.md) retains the branding but requires a more modern layout inspired by the two supplied references and full light/dark themes, rather than exact reproduction of the first concept.

Font loading, the homepage, public navigation, service cards, inquiry form previews and theme tokens are implemented. The reusable animation components enhance server-rendered text while preserving readable content without JavaScript or with reduced motion. The existing `public/brand/brand-colors.css` contains asset color primitives; application tokens and responsive layouts are in `src/app/globals.css`. The design-system strip in the supplied concept remains outside the public homepage.

The current local preview uses `http://127.0.0.1:3001`. The development command normally starts on port 3000 and falls back to another available port when needed; use the URL printed by Next.js after a restart. No public deployment has taken place.

## Work to resume later

- Connect the implemented public frontend to the confirmed recruitment MVP: company staff requirements, jobs, job applications, general CV submission and private team administration with manual matching. Candidate login, employer dashboards and automatic matching are deferred.
- Select and configure the production database, private file storage and team authentication. No application backend has been provisioned yet.
- Build authorized private administration for jobs, company requirements, candidates and the New → Reviewed → Shortlisted → Interview → Hired pipeline. CV access must be restricted to the authorized team.
- Review the generated representative hero or replace it with approved company photography if desired. It must not be described as actual team photography without confirmation.
- Obtain specific industries, detailed company information, initial admin email, real vacancies and the data-retention/privacy information needed before launch.
- Approve and publish complete privacy information before opening online applications, then verify backend access, storage, submissions and administration end to end.

The public frontend is implemented for local review. The recruitment MVP is not complete: public forms are explicitly labeled previews, and durable application storage, private CV storage, authentication and the admin panel remain pending. The canonical domain and official contact information are configured; keep `SEO_INDEXABLE=false` until the finished site and approved content are ready.
