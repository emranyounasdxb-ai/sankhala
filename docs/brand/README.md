# Sankhala brand assets

This pack adapts the two supplied Sankhala Employment logos for web use. It establishes reusable artwork and measured color primitives; it does not finalize the website design system or its UI font.

## Source artwork and colors

The original 6250 × 6250 transparent PNGs are preserved unchanged in `brand/originals/`. Both contain artwork within `(1313, 2191)–(4954, 3819)`, a trimmed area of 3641 × 1628 pixels.

| Primitive | Exact color | Source |
| --- | --- | --- |
| Charcoal | `#2E2E2E` | Dark logo lettering |
| White | `#FFFFFF` | Light logo lettering |
| Red | `#FF3131` | Logo dot |

The original filename `Sankhala-logo-dark.png` describes dark lettering, suitable for a light surface. `Sankhala-logo-light.png` contains white lettering for a dark surface. Generated filenames use **on-light** and **on-dark** to make the intended background explicit.

The full logo retains the supplied lettering, red dot, and vertical “Employment” text. Its font is unknown and has not been retyped. No SVG master is supplied because the sources are raster images; wrapping a PNG in SVG would not make it vector artwork.

The compact **S + dot** mark uses the original S glyph and source red dot in a new layout. It is a derived asset, not an original icon supplied by the user. The dot has a minimum size of two pixels in small favicons to remain visible. The dark asset background is `#181818`, a supporting surface rather than a sampled logo color.

## Asset inventory

Paths below are relative to the repository root. The [generated manifest](asset-manifest.json) records exact output paths and dimensions.

| Location / filename pattern | Use |
| --- | --- |
| `public/brand/logos/logo-on-{light,dark}.png` | Native trimmed full logos, 3641 × 1628 |
| `public/brand/logos/logo-on-{light,dark}-{400,800,1600}.{png,webp}` | Transparent full logos at the named pixel widths |
| `public/brand/icons/mark-on-{light,dark}.png` | Transparent compact marks, 1024 × 1024 |
| `public/brand/icons/icon-on-{light,dark}-{192,512}.png` | Opaque square app icons |
| `public/brand/icons/maskable-on-{light,dark}-512.png` | Padded opaque maskable app icons |
| `public/brand/icons/apple-touch-icon-on-{light,dark}.png` | Opaque touch icons, 180 × 180 |
| `public/brand/icons/favicon-on-{light,dark}-{16,32,48}.png` | Small browser icons |
| `public/brand/social/og-{light,dark}-1200x630.png` | Landscape social link previews |
| `public/brand/social/share-{light,dark}-1200x1200.png` | Square social images |
| `public/brand/social/avatar-{light,dark}-1024.png` | Profile avatars |
| `public/brand/social/cover-{light,dark}-1600x900.png` | Landscape covers |
| `public/brand/logos/email-logo-on-light.png` | Email logo, 400 pixels wide, opaque white backing |
| `public/brand/palette.json`, `public/brand/brand-colors.css` | Measured brand color primitives |

In social filenames, `light` and `dark` describe the background. Social templates use supplied logo artwork without invented claims or taglines.

Default files at `public/` use the dark background with a white S: `favicon.ico` contains 16, 32, and 48 pixel PNG entries; `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, and `site.webmanifest` provide common integration paths.

## Usage

- Use `on-light` artwork on light surfaces and `on-dark` artwork on dark surfaces. Preserve the red dot and original aspect ratio; do not stretch, skew, recolor, or retype the logo.
- Leave clear space on all sides of at least **25% of the displayed logo artwork height**. Transparent padding already present in a particular asset may supply some of that space.
- Display the full logo at **240 CSS pixels wide or more** so the vertical “Employment” label remains usable. Use the compact mark in smaller spaces rather than compressing the full logo.
- Use `alt="Sankhala Employment"` for a meaningful standalone logo. A linked home logo can use `alt="Sankhala Employment home"`. Use `alt=""` only when adjacent text or the parent link already supplies the same accessible name.
- PNG is suitable for broad compatibility; lossless WebP offers a web alternative. Select an export large enough for the intended display density and set intrinsic `width` and `height` to avoid layout shifts.
- Brand red is an accent primitive, not an approved normal-text color. Its measured contrast is **3.66:1 against white** and **3.71:1 against charcoal**. Functional UI colors and accessible text pairings remain a separate design decision.

Maskable icons have opaque backgrounds and extra padding. Keep essential artwork inside the centered safe circle with radius **40% of icon width**. Use the dedicated maskable files with `purpose: "maskable"` and regular icons with `purpose: "any"`; these variants have different padding. See [web.dev maskable icon guidance](https://web.dev/articles/maskable-icon).

Manifest raster `sizes` must match actual dimensions. Relative icon URLs resolve against the manifest URL, so review deployment paths when integrating. See the [MDN manifest icons reference](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons).

## Integration and rebuild

[integration.html](integration.html) provides a reference snippet for favicon, manifest, touch icon, and social metadata integration. It is documentation, not the site itself. Set the real public URL and page metadata when the site is built. The asset manifest and [preview sheet](preview.png) support inspection of the generated pack.

The builder is `tools/brand/build.mjs`, with Sharp dependencies recorded in `tools/brand/package.json`. Run from the repository root:

```sh
cd tools/brand
npm ci
npm run build
npm run verify
```

Exports are generated from the preserved source artwork. Check both themes, the full logo at its minimum displayed size, favicons at actual 16/32/48 pixel sizes, and circular avatar/maskable crops after changing the build.
