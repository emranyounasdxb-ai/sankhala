# Sankhala

Branding preparation for Sankhala Employment, based on the two supplied logo images.

The current repository contains original artwork, website logo exports, icons, favicons, social images, measured brand colors, a reproducible asset builder, and the supplied website design specification. The specification documents Barlow Condensed headings, Inter body text, and the proposed homepage structure. The website itself has not been implemented; the application stack and business details remain to be established.

- [Supplied design specification](design.md)
- [Saved project progress](docs/project-status.md)
- [Brand asset guide](docs/brand/README.md)
- [Asset preview](docs/brand/preview.png)
- [Generated inventory](docs/brand/asset-manifest.json)
- [Integration example](docs/brand/integration.html)

## Rebuild assets

With Node.js and npm installed, run from the repository root:

```sh
cd tools/brand
npm ci
npm run build
npm run verify
```

Original PNGs are preserved in `brand/originals/`. Web assets are written to `public/`; documentation and the preview are in `docs/brand/`. The integration example is a reference snippet, not a launched website.
