# Sankhala

The owner finalized **Node.js / Next.js** for the ATS, using existing InMotion cPanel hosting and MariaDB. Initial admin and HR notification email: **admin@sankhala.ae**. Local implementation now includes durable applications, private document quarantine, scoped staff authentication, recruitment management, status/history, duplicate review, CSV/XLSX exports and an email outbox. Local integration, browser/accessibility, TLS mail-sink delivery and encrypted backup restoration have been verified. cPanel deployment and automatic GitHub-to-server updates are being configured. [ATS requirements](docs/ats-requirements.md), [data model](docs/ats-data-model.md), [hosting status](docs/hosting-cpanel.md).

Careers usability update: instant role/category search, compact vacancy sections, selected-role CV context and shareable/returnable category URLs are implemented. [Navigation behavior and privacy boundaries](docs/careers-navigation.md).

Public Careers now includes the approved categories, priority role interests and separate own-team/client sections. Only real employer-confirmed vacancies may be published; category links open a general CV introduction for future opportunities. See [the Careers publication policy](docs/careers-content-policy.md).

The public site now explains the owner's [six confirmed services and workforce categories](docs/company-services.md), covering recruitment, manpower supply, outsourcing, HR/PRO, payroll/workforce management and bulk hiring.

Careers now has a separate [design system and four-step preview](docs/careers-design-system.md) at `/design/careers`: filtering, role details, local application review and component states. The public `/jobs` page still shows no published vacancies.

Latest update: validated forms now offer a reviewable message, Copy details and Prepare email draft. Candidates attach their CV manually in their email app. Editing a field clears the previous draft. See [handoff verification and remaining content needs](docs/verification/email-handoff.md).

Public website preview and branding assets for Sankhala Employment.

The stack is locked to stable versions verified on 31 October 2026: Next.js App Router, React, TypeScript, Tailwind CSS and GSAP. The public frontend now includes the homepage, About, Services, Contact, Careers, Hire Talent, Submit CV and Privacy pages. It uses the approved local Barlow Condensed and Inter fonts, the supplied brand assets, persistent light/dark themes, responsive navigation, and selective scroll and text effects with reduced-motion support.

With `ATS_ENABLED=true` and private configuration, candidate applications and general CVs save to MariaDB and private storage, and staff use `/admin`. With ATS disabled, the earlier email-draft CV preview remains available. The employer intake currently retains its reviewed email-draft handoff. No genuine vacancies have been supplied; local test records are labeled `[TEST]`, and test vacancies are closed or drafts. Production receives no demo vacancy seed data.

The frontend polish adds clearer recruitment copy, separate employer/candidate journeys, stable sticky navigation, grouped forms and local CV replace/remove controls. Forms now include persistent examples and a linked error summary; hiring-page contact actions are available before the mobile form. The Contact page includes the confirmed Deira office address, Google map and directions. Optional GSAP code loads near its section rather than with the initial page; reduced-motion visitors do not load it. The approved font families are unchanged. Only the Barlow Condensed 600 weight currently used by headings is downloaded; the unused 700 preload was removed.

- [Locked stack and exact versions](docs/stack.md)
- [Confirmed MVP requirements](docs/product-requirements.md)
- [MVP implementation structure](docs/implementation-plan.md)
- [Current design direction: modern light and dark themes](docs/design-direction.md)
- [Supplied design specification](design.md)
- [Supplied homepage reference](docs/reference/sankhala-homepage-concept.png)
- [Modern layout reference](docs/reference/modern-layout-reference.png)
- [Generated hero image provenance](docs/reference/hero-image.md)
- [Saved project progress](docs/project-status.md)
- [Frontend verification and local performance comparison](docs/verification/frontend-polish.md)
- [Final frontend pass, browser coverage and office/contact updates](docs/verification/frontend-final-pass.md)
- [Brand asset guide](docs/brand/README.md)
- [Asset preview](docs/brand/preview.png)
- [Generated inventory](docs/brand/asset-manifest.json)
- [Integration example](docs/brand/integration.html)

## Run the website

On Windows, use the pinned project runtime without changing the machine's global Node installation:

```powershell
.\scripts\bootstrap-runtime.ps1
.\scripts\npm.ps1 ci
.\scripts\npm.ps1 run dev
```

Development normally starts at `http://127.0.0.1:3000`. If that port is occupied, Next.js chooses the next available port and prints the actual URL; the current local preview uses `http://127.0.0.1:3001`. Run `check`, `typecheck`, `build` and `test:e2e` through the same wrapper. Install Chromium, Firefox and WebKit with `.\scripts\npm.ps1 run browsers:install` on a fresh machine. `test:e2e` uses the production build, so run `build` first. Other operating systems can use Node 26.13.0 and npm 12.2.1 with the ordinary npm commands.

Browser scenarios in `tests/` cover public routes, metadata, organization markup, theme persistence, keyboard navigation, responsive layouts, accessibility, readable content without JavaScript, form errors, direct contact actions and the map integration. Projects cover Chromium, Firefox and WebKit desktop, Pixel 7 emulation and iPhone 13 emulation. Emulation complements visual review and does not establish physical-device compatibility.

The official domain is `https://sankhala.ae`. Public contact is `info@sankhala.ae`; calls use `+971 4 611 3100`, while WhatsApp remains `+971 56 524 3800`. The confirmed office is Office 218, Business Village B, Deira, Dubai. Coverage is Dubai and all UAE emirates; these values are centralized in `src/lib/site.ts`. The supplied Google Maps embed currently labels its pin “ALIYAS Real Estate”; it is a location reference, not a verified Sankhala business listing. The public email does not automatically authorize an admin account.

The project defaults to `noindex`. Copy `.env.example` to `.env.local` when configuration is needed. The canonical domain is already configured; enable `SEO_INDEXABLE=true` only when the finished site is ready to launch, then rebuild. No hosting or public deployment has been configured.

## What remains before launch

- Configure the production database, private CV storage, team authentication and authorized admin access.
- Connect staffing requirements, job applications and general CV submissions to durable storage and the manual recruitment workflow.
- Build private administration for jobs, applications and statuses; supply genuine vacancies and provision the designated initial administrator.
- Confirm detailed company and industry information and approve the complete privacy, access and retention arrangements before accepting online applications.

The current hero is a generated representative office scene, not a photograph of Sankhala's actual staff or office. Its original, optimized web export and generation prompt are preserved in the repository. The public page labels it as illustrative photography.

## Rebuild assets

On Windows, run from the repository root:

```powershell
.\scripts\npm.ps1 ci --prefix tools/brand
.\scripts\npm.ps1 run build --prefix tools/brand
.\scripts\npm.ps1 run verify --prefix tools/brand
```

Original PNGs are preserved in `brand/originals/`. Web assets are written to `public/`; documentation and the preview are in `docs/brand/`. The integration example is a reference snippet, not a launched website.
