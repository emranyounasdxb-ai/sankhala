# Sankhala

Website foundation and branding assets for Sankhala Employment.

The stack is locked to current stable versions verified on 31 October 2026: Next.js App Router, React, TypeScript, Tailwind CSS and GSAP. The repository includes local Barlow Condensed and Inter fonts, metadata and crawl controls, reusable scroll/text effects, browser checks, the supplied design specification, and 43 branding image assets. A minimal holding page validates the foundation; the full homepage, business content and contact flows remain to be implemented.

- [Locked stack and exact versions](docs/stack.md)
- [Supplied design specification](design.md)
- [Saved project progress](docs/project-status.md)
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

Development is available at `http://127.0.0.1:3000`. Run `check`, `typecheck`, `build` and `test:e2e` through the same wrapper. Install the test browser with `.\scripts\npm.ps1 run browsers:install` on a fresh machine. `test:e2e` uses the production build, so run `build` first. Other operating systems can use Node 26.13.0 and npm 12.2.1 with the ordinary npm commands.

The project defaults to `noindex`. Copy `.env.example` to `.env.local` when configuration is needed. Set the real HTTPS `SITE_URL` and enable `SEO_INDEXABLE=true` only when the finished site is ready to launch, then rebuild. No hosting or public deployment has been configured.

## Rebuild assets

On Windows, run from the repository root:

```powershell
.\scripts\npm.ps1 ci --prefix tools/brand
.\scripts\npm.ps1 run build --prefix tools/brand
.\scripts\npm.ps1 run verify --prefix tools/brand
```

Original PNGs are preserved in `brand/originals/`. Web assets are written to `public/`; documentation and the preview are in `docs/brand/`. The integration example is a reference snippet, not a launched website.
