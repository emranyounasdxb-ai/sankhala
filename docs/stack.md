# Locked website stack

Selected on **31 October 2026** for Sankhala Employment Services. This records the website foundation and dependency decision; it does not represent a completed homepage or a public launch.

Use current stable releases and the latest production LTS runtime at the selection date. Direct dependencies use exact versions in `package.json`, with no caret or tilde ranges. `package-lock.json` records the resolved dependency tree; use `npm ci` for repeatable installs. “Locked” means deliberate upgrades with validation, not a ban on future security updates.

## Runtime and application

| Tool | Exact version | Role |
| --- | --- | --- |
| Node.js | 26.13.0 LTS | Project runtime, installed locally by the bootstrap script |
| npm | 12.2.1 | Package manager and lockfile installation |
| `next` | 16.4.3 | App Router, Server Components, prerendering, routing, metadata, image and font optimization |
| `react`, `react-dom` | 19.3.1 | Component and interaction layer |
| `typescript` | 7.0.2 | Strict typed application code |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | CSS utilities and integration with the design tokens |
| `postcss` | 8.5.32 | CSS processing |

Next.js was chosen to serve public content as HTML while supporting later careers listings and employer or applicant workflows. Keep marketing pages prerendered where their data allows it, with small interactive client boundaries. The framework choice is not a search-ranking guarantee. Astro would also suit a content-only site; a second framework is not part of this stack. See the official [Server and Client Components guide](https://nextjs.org/docs/app/getting-started/server-and-client-components).

The selected runtime is the newest LTS recorded in the [Node release index](https://nodejs.org/dist/index.json), rather than the Node 27 alpha line. See the [Node lifecycle policy](https://nodejs.org/en/about/previous-releases). Next's [installation requirements](https://nextjs.org/docs/app/getting-started/installation) and the packages' engine/peer metadata are the compatibility references; successful installation alone is not a substitute for the build and type checks.

## Visuals, animation, and validation

| Package | Exact version | Role |
| --- | --- | --- |
| `gsap` | 3.15.0 | Animation engine, including ScrollTrigger and SplitText |
| `@gsap/react` | 2.1.2 | React animation scoping and cleanup |
| `@phosphor-icons/react` | 2.1.10 | Consistent interface icons |
| `@fontsource/barlow-condensed` | 5.3.0 | Local heading font files from the supplied design specification |
| `@fontsource/inter` | 5.3.0 | Local body and interface font files from the supplied design specification |
| `sharp` | 0.35.5 | Image processing and optimization |
| `zod` | 4.6.7 | Runtime validation for configuration and future form inputs |

The supplied [design specification](../design.md) remains the visual reference. Load its Barlow Condensed and Inter WOFF2 files from the installed Fontsource packages through `next/font/local`; the browser should not depend on a font CDN. Load only required weights and subsets. [Next font documentation](https://nextjs.org/docs/app/api-reference/components/font#local-fonts)

GSAP is the single animation engine. Use ScrollTrigger for viewport and scroll-linked effects, SplitText for restrained word or line reveals, and `useGSAP` for scoped lifecycle cleanup. Keep native scrolling; no smooth-scroll replacement is selected. See [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/), and [GSAP with React](https://gsap.com/resources/React/).

Animation implementation rules:

- Render meaningful headings and text in the initial HTML. Animate the existing text after hydration; do not put essential content in canvas, images, or JavaScript-only markup.
- Content must remain readable when JavaScript fails or is disabled. Avoid a global CSS rule that permanently hides reveal targets before animation initializes.
- Respect `prefers-reduced-motion`. Leave text visible and use a plain opacity change only where useful; remove travel, scrub, and pin effects for reduced motion.
- Preserve a coherent accessible name when splitting text. Do not split interactive content in a way that hides links or buttons from assistive technology.
- Prefer transform and opacity, use restrained stagger timing, and clean up animation instances and split markup on unmount.
- Refresh measurements after fonts and relevant images settle. Do not animate layout dimensions or attach unthrottled custom scroll work.
- Keep the page itself a Server Component; use focused Client Components for browser-dependent animation and interaction.

## Quality tooling

| Package | Exact version | Role |
| --- | --- | --- |
| `@biomejs/biome` | 2.6.4 | Formatting, linting, and static checks |
| `@playwright/test` | 1.64.1 | Browser checks for responsive layout and interaction |
| `@axe-core/playwright` | 4.14.0 | Automated accessibility checks alongside manual keyboard review |
| `@types/node` | 26.6.6 | Node type declarations |
| `@types/react`, `@types/react-dom` | 19.3.0 | React type declarations |

Biome is the selected linter and formatter. Browser and accessibility checks complement production builds, type checking, and manual visual inspection.

Validation completed on 31 October 2026:

- Production build passed with Next.js 16.4.3 and TypeScript 7.0.2; the holding page, robots route and sitemap route are prerendered.
- Type checking and Biome's recommended lint preset passed.
- All 10 Playwright checks passed across desktop and mobile, including 320px and 768px layouts, reduced motion, scroll effects, keyboard focus, initial HTML metadata, and readable content without JavaScript.
- Automated axe checks reported no accessibility violations on the foundation page. Desktop and mobile screenshots were inspected.
- npm audit reported zero known vulnerabilities in the installed dependency tree at the time of verification.
- Existing verification passed for all 43 branding image exports with Sharp 0.35.5.

These results cover the current foundation, not the unimplemented full homepage, real inquiry flows, future content, or production deployment.

## SEO architecture and launch configuration

Use Next's native [Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [robots route](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots), and [sitemap route](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap). A separate SEO plugin or sitemap package is not selected.

- Provide unique titles and descriptions, a canonical URL, Open Graph metadata, and social images for real public pages.
- Use semantic HTML, a logical heading hierarchy, descriptive internal links, image alt text, and content that is available in the rendered HTML.
- Use `next/image` with correct dimensions and responsive sizes; prioritize the actual largest visible image and lazy-load appropriate lower content. [Image API](https://nextjs.org/docs/app/api-reference/components/image)
- Add Organization or JobPosting structured data only when its business and vacancy details are confirmed. Serialize JSON-LD safely and validate it; do not invent addresses, reviews, salaries, or vacancies. [Next JSON-LD guidance](https://nextjs.org/docs/app/guides/json-ld)
- The foundation defaults to `SEO_INDEXABLE=false` and has no configured `SITE_URL`. It emits noindex metadata, permits crawling so that noindex can be read, and exposes no sitemap entries for an unfinished site.
- Before launch, set `SITE_URL` to the real HTTPS origin and deliberately enable `SEO_INDEXABLE=true` only with approved content and completed routes. Check canonical URLs, sitemap entries, robots behavior, metadata, and social images on the deployed origin.

CMS, database, authentication, mail delivery, analytics, and hosting remain unselected until the business requirements establish a need. A form validation package does not imply that a submission service exists.

## Installation and commands

From the repository root on Windows:

```powershell
.\scripts\bootstrap-runtime.ps1
.\scripts\npm.ps1 ci
.\scripts\npm.ps1 run dev
```

The wrapper uses the project's pinned runtime and package manager. It does not require replacing the machine's global Node installation.

```powershell
.\scripts\npm.ps1 run check
.\scripts\npm.ps1 run typecheck
.\scripts\npm.ps1 run build
.\scripts\npm.ps1 run test:e2e
.\scripts\npm.ps1 run start
```

`dev` runs local development, `build` creates the production build, and `start` serves that build. `check`, `typecheck`, and `test:e2e` are verification commands. On a fresh environment, run `.\scripts\npm.ps1 run browsers:install` to install the Chromium binary used by the browser tests. Run `build` before `test:e2e`.

## Version evidence and maintenance

Versions were resolved from the live npm registry and checked against official documentation at selection time. Reproducible package metadata is available through the registry's `/<package>/<version>` endpoint, including [Next 16.4.3](https://registry.npmjs.org/next/16.4.3), [React 19.3.1](https://registry.npmjs.org/react/19.3.1), [TypeScript 7.0.2](https://registry.npmjs.org/typescript/7.0.2), [npm 12.2.1](https://registry.npmjs.org/npm/12.2.1), [Tailwind 4.3.3](https://registry.npmjs.org/tailwindcss/4.3.3), [GSAP 3.15.0](https://registry.npmjs.org/gsap/3.15.0), and [Biome 2.6.4](https://registry.npmjs.org/@biomejs%2fbiome/2.6.4). The exact complete list is in the root [package manifest](../package.json); resolved transitive packages are in the [lockfile](../package-lock.json).

Review security advisories and stable release changes intentionally. Update the selected versions and lockfile together, inspect the dependency diff and audit results, then rerun relevant checks. A future higher version should not be installed silently merely because it exists.
