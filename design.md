# Sankhala Employment Services — Website Design Specification

## Instructions for Codex

Implement this design in the user's existing project. Reproduce the supplied homepage reference closely: its composition, logo, typography, spacing, photography treatment, colors and component styling. Do not substitute a generic recruitment template or redesign the brand.

First inspect the repository, AGENTS.md, framework, routes, existing components, assets and package scripts. Reuse the established stack and conventions. Preserve unrelated work, backend logic and integrations. Implement the homepage and shared visual system; do not replace the project wholesale. Work locally and provide a reviewable result; deployment is outside this instruction.

## Reference and required assets

- Visual reference: `Sankhala Employment Services Homepage Concept.png` supplied with this brief.
- Original logo: `Sankhala-logo-dark.png` for light backgrounds.
- Original logo: `Sankhala-logo-light.png` for charcoal backgrounds.
- Suggested project locations: `public/brand/sankhala-dark.png`, `public/brand/sankhala-light.png`, `public/images/recruitment-team.webp`, and `docs/reference/sankhala-homepage-concept.png`. Adapt to the existing framework.
- Locate the attached assets in the project or supplied files. ChatGPT Library references are not publicly fetchable asset URLs. If the reference image is absent, implement the detailed specification below and request the reference only for the final visual comparison. If logos are absent, identify the missing assets; do not invent a replacement logo.
- The mockup is a visual concept, not proof of actual services or business claims. Copy and service categories below are proposed content requiring business confirmation before public launch.

## Visual direction

Bright, spacious, confident recruitment brand. White is the dominant canvas; charcoal creates hierarchy; red is used sparingly for actions and punctuation. Approximate page balance: 75% white/light grey, 20% charcoal, 5% red. Use aligned grids, restrained borders and subtle shadows. Avoid heavy gradients, glass effects, oversized pills, busy patterns and unnecessary animation.

The reference image is approximately 1024px wide by 1536px tall and compresses a desktop homepage into one view. Translate its proportions into a responsive website rather than scaling the entire image. The design-system strip at its bottom is documentation and MUST NOT appear on the public homepage.

## Color tokens

| Token | Value | Usage |
|---|---|---|
| brand-charcoal | #2E2E2E | Headings, navigation, footer, dark CTA band |
| brand-red | #FF3131 | Original logo dot, accents, decorative dots |
| action | #D92323 | Primary button fill and links on white |
| action-hover | #B91C1C | Primary button hover |
| background | #FFFFFF | Main page and cards |
| surface | #F7F7F7 | Alternate sections and step number circles |
| text | #2E2E2E | Primary text |
| text-secondary | #525252 | Paragraphs and descriptions |
| border | #DEDEDE | Decorative card borders and dividers |
| input-border | #858585 | Form control boundaries on white |
| accent-soft | #FFF1F1 | Subtle selected backgrounds |

Keep original logo colors unchanged. Brand red against white has approximately 3.66:1 contrast: do not use it for small informative text. Use action red for small red labels and links; action red with white is approximately 4.98:1. Do not encode errors or selected states through color alone.

## Typography

- Headings: **Barlow Condensed**, weight 600; 700 only where the reference needs stronger emphasis.
- Body, navigation, buttons, card descriptions and labels: **Inter**, weights 400, 500 and 600.
- Load actual fonts via the framework's font loader or self-hosted WOFF2. Avoid CSS font imports that block rendering. Use `font-display: swap` where applicable.
- Heading fallback: `"Arial Narrow", Arial, sans-serif`; body fallback: `system-ui, sans-serif`.
- The mockup's tall typography is directional. Actual Barlow Condensed font rendering takes precedence over distorted or horizontally compressed text.
- Preserve the logo as artwork; never recreate its lettering with a font.

| Style | Desktop | Mobile | Weight | Line height |
|---|---:|---:|---:|---:|
| H1 | 64px | 40px | 600 | 1.05–1.1 |
| H2 | 44px | 32px | 600 | 1.15 |
| H3/card heading | 24px | 22px | 600 | 1.25 |
| Hero paragraph | 20px | 18px | 400 | 1.5 |
| Body | 18px | 16px | 400 | 1.6 |
| Nav/button | 16px | 16px | 600 | 1.4 |
| Supporting text | 14px | 14px | 400–500 | 1.5 |
| Eyebrow | 12px | 12px | 600 | 1.4 |

Use sentence case for major headings and uppercase for short eyebrows with 0.18em letter spacing. Paragraph text should usually stay under 65 characters per line. Card headings use Inter as specified, even if the generated mockup suggests a condensed treatment.

## Layout and spacing

- Main content max-width: 1200px, centered.
- Outer padding: 32px desktop, 24px tablet, 20px mobile.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 88px.
- Standard vertical section padding: 88px desktop / 48px mobile; use 64px for compact process sections.
- Grid gap: 24px desktop / 16–24px mobile.
- Hero: two columns approximately 50/50 with 40–48px gap.
- Corners: buttons 8px, cards 12px, hero photograph 20px.
- Borders: 1px solid border token. Shadow: `0 4px 20px rgb(0 0 0 / 5%)`.

## Homepage — exact order and composition

### 1. Header

White header, approximately 88–96px tall desktop, with logo at left, navigation toward right and primary action at far right. Optional hairline bottom border. Keep header static initially to match the reference.

- Navigation: Home, About, Services, Careers, Contact.
- Primary action: Hire Talent.
- Active Home link: action-red text and short thin red underline.
- Trim only transparent margins from a derived logo asset. Preserve proportions, custom lettering, vertical Employment text and red dot. Keep originals untouched.
- Logo visible artwork width: approximately 150–180px desktop; 125–145px mobile, with height auto. Leave at least 16px clear space.
- Mobile: logo left and menu toggle right; expanded menu includes all links and Hire Talent.

### 2. Hero

White background, spacious two-column layout. Left: eyebrow, two-line headline, description, paired buttons. Right: large photograph and restrained decorative shapes.

Proposed copy:

```text
SANKHALA EMPLOYMENT SERVICES

Connecting people.
Building futures.

Recruitment solutions for businesses.
New opportunities for people.

[Hire Talent →]  [Find a Job →]
```

- Use charcoal headline words with small red final punctuation as in the reference.
- Desktop heading width around 540px. Allow natural wrapping on narrower widths; never crop text.
- Primary button action-red/white; secondary white with charcoal outline and charcoal text.
- Photograph: diverse adult professionals in a bright contemporary workplace, natural lighting, authentic and welcoming. Use supplied/approved photography where available. A generated photo is a placeholder until approved, not a claim about actual employees.
- Photo roughly square to 1.1:1, `object-fit: cover`, rounded 20px; avoid cropping faces.
- Behind photo: slightly offset pale-grey rounded rectangle extending toward top/right. A single small red dot near lower-right is decorative and hidden from assistive technology.
- No fabricated statistics, review scores, awards or client logos.

### 3. Services

Full-width soft-grey background; centered inner container; headings left aligned.

```text
WHAT WE DO
The right people. The right opportunities.
```

Three equal white cards in one desktop row:

| Card | Proposed description | Outline icon |
|---|---|---|
| Recruitment | We help businesses find and hire exceptional talent across industries. | People/group |
| Workforce Solutions | Flexible hiring solutions tailored to your business needs. | Person/gear |
| Career Opportunities | We connect talented individuals with meaningful career opportunities. | Resume/document |

- Card padding 32px; centered icon and copy, consistent heights.
- Icons 40–48px, charcoal strokes with a small red accent; use one existing icon library or matching SVGs.
- Use 12px corner radius and thin borders; avoid strong shadows.
- Hover only if the card is actually interactive. Do not make an entire card look clickable without a destination.

### 4. Process

White background, left-aligned section heading:

```text
OUR PROCESS
A clear path forward.
```

Three steps across desktop. Each step combines a light-grey circle with red condensed step number and adjacent text. Thin grey arrows connect steps decoratively.

| Step | Title | Description |
|---|---|---|
| 01 | Tell us your needs | Share your hiring goals or career aspirations. |
| 02 | Find the right match | We connect the right people with the right opportunities. |
| 03 | Move forward | Build stronger teams and brighter futures. |

On mobile stack steps vertically and remove horizontal arrows. Use an ordered list semantically.

### 5. Contact CTA band

Full-width charcoal band. Within the main container, headline and supporting copy at left, red Contact Us button at right. Stack on mobile.

```text
Let’s make the next move.
Whether you’re hiring or looking for your next opportunity,
we’re here to help.

[Contact Us →]
```

White headline/body; red punctuation is optional. Use the light logo only if a separate existing footer needs branding. Preserve the project's real legal/footer content below this band without inventing addresses or registration details.

## Components and behavior

- Primary button: action-red background, white Inter 600 text, 48px minimum height, 20–24px horizontal padding, 8px radius. Hover uses action-hover.
- Secondary button: white background, 1px charcoal border, charcoal text; subtle light-grey hover.
- Arrow icons: consistent 18–20px; decorative if the adjacent label already describes the action.
- Link destinations: Home `/`; other navigation should target existing real routes or homepage sections. Hire Talent should open/scroll to the employer inquiry flow; Find a Job should open existing careers/listings or applicant flow. Reuse real routes instead of inventing them.
- If no inquiry route exists, provide a working inline contact section and link to it. Do not create a fake successful submission; wire an existing endpoint or visibly disclose an unavailable submission state.
- Preserve existing contact details and integrations. Do not invent email, telephone, WhatsApp or social profiles.
- Forms: visible labels, associated errors, correct input types, minimum 48px controls. Keep employer and candidate intent clear.
- Focus: visible 2px charcoal outline with offset on light surfaces; white outline on dark surfaces.
- Touch targets at least 44px. All interactions must work by keyboard.
- Transitions 150–200ms for color/shadow only; respect reduced-motion preferences.

## Responsive rules

| Viewport | Behavior |
|---|---|
| 1024px and above | Full navigation, two-column hero, three service cards and process steps |
| 768–1023px | Compact/mobile navigation if links do not fit; reduce gaps; stack hero if needed; two service columns with final card naturally aligned |
| Below 768px | Mobile menu, stacked hero with copy before image, single-column cards and process, stacked CTA |

- Use fluid H1 sizing such as `clamp(2.5rem, 4.5vw, 4rem)`.
- Mobile buttons may share a row if labels fit; otherwise stack at full width.
- No horizontal scroll at 320px viewport width.
- Keep reading order logical in the DOM, rather than rearranging with CSS in a way that breaks navigation.

## CSS foundation

```css
:root {
  --brand-charcoal: #2e2e2e;
  --brand-red: #ff3131;
  --action: #d92323;
  --action-hover: #b91c1c;
  --background: #ffffff;
  --surface: #f7f7f7;
  --text: #2e2e2e;
  --text-secondary: #525252;
  --border: #dedede;
  --input-border: #858585;
  --accent-soft: #fff1f1;
  --font-heading: "Barlow Condensed", "Arial Narrow", Arial, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --container: 1200px;
  --radius-button: 8px;
  --radius-card: 12px;
  --radius-image: 20px;
  --shadow-card: 0 4px 20px rgb(0 0 0 / 5%);
}

* { box-sizing: border-box; }
body {
  margin: 0;
  color: var(--text);
  background: var(--background);
  font-family: var(--font-body);
  line-height: 1.6;
}
.container {
  width: min(var(--container), calc(100% - 64px));
  margin-inline: auto;
}
h1, h2 {
  font-family: var(--font-heading);
  font-weight: 600;
}
h1 { font-size: clamp(2.5rem, 4.5vw, 4rem); line-height: 1.08; }
h2 { font-size: clamp(2rem, 3.2vw, 2.75rem); line-height: 1.15; }
img { max-width: 100%; }
@media (max-width: 767px) {
  .container { width: calc(100% - 40px); }
}
```

Adapt selectors and tokens to the project's existing styling system; do not introduce a competing framework for this page.

## Implementation and acceptance checklist

1. Inspect project and find the supplied reference/logo assets before editing.
2. Implement reusable Header, Button, ServiceCard, ProcessStep and ContactCTA components using existing conventions.
3. Use live HTML text, actual fonts, semantic headings and responsive layout. Never use the complete mockup image as the website.
4. Match the reference's composition and brand treatment. Preserve the supplied logo faithfully. Exclude the reference's bottom design-system documentation strip from the public page.
5. Give image dimensions/aspect ratios to prevent layout shift. Optimize image assets with the existing pipeline; prioritize the hero and lazy-load below-fold images.
6. Verify all menu links, buttons, mobile menu and inquiry flows. No dead `#` links or fake submissions.
7. Run relevant project lint/type/build checks. Fix errors introduced by the change.
8. Capture and inspect the rendered page at desktop approximately 1440px, tablet 768px and mobile 390px; also check overflow at 320px. Compare desktop composition to the reference and correct spacing, typography and wrapping.
9. Confirm readable contrast, visible keyboard focus, useful image alt text, and reduced-motion support.
10. Report changed files, validation results, any missing reference assets and any proposed business copy needing approval. Do not claim pixel-perfect font or photo matching when a placeholder was used.

## Suggested task prompt

> Read design.md and inspect the attached Sankhala homepage reference and original logo files. Implement this design in my existing project, matching the reference closely and following the responsive rules. Keep the existing stack, working routes and integrations. Use the original logo, Barlow Condensed headings, Inter body text, and the specified charcoal/red/white palette. Do not display the design-system strip on the public homepage. Complete the implementation, run appropriate checks, inspect desktop and mobile renders, and report the result.
