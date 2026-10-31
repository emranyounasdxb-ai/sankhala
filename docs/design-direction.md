# Current design direction

Latest user clarification, 31 October 2026: the supplied Sankhala homepage concept is a reference, not an exact reproduction target. The website should feel more modern and advanced, with **both light and dark themes**, informed by the second supplied layout reference.

This clarification overrides the exact-match instructions inside the original `design.md`. Preserve that original brief as supplied; use this document for the updated direction. The confirmed recruitment product requirements and brand identity remain in force.

## Reference roles

| Source | How it is used |
| --- | --- |
| [Sankhala homepage concept](reference/sankhala-homepage-concept.png) | Recruitment context, two audience actions, branding and broad content hierarchy |
| [Modern layout reference](reference/modern-layout-reference.png) | Large visual hero, confident typography, broad rounded surfaces, organized content cards and contrast between sections |
| [Original design specification](../design.md) | Existing font selection, brand palette, baseline component behavior and responsive guidance where consistent with the latest clarification |

The second reference's digital-marketing brand, copy, logos, green accent, testimonials and service categories do not become Sankhala content. Do not reproduce either entire image as the website. The Design System strip at the bottom of the first image stays outside public pages.

## Visual system to implement

- Retain Sankhala's supplied logo artwork and charcoal/red/white identity.
- Typography is locked: **Barlow Condensed 600/700 for main headings; Inter 400/500/600 for body text, navigation, buttons, forms and card copy**. The user explicitly reaffirmed this choice after supplying the new reference. Translate the reference through these actual fonts rather than importing its typefaces or distorting text.
- Use a large photographic hero with deliberate text placement, strong readable contrast and two clear paths: Hire Talent and Find a Job.
- Use spacious section composition, restrained rounded surfaces, clear card hierarchy and sufficient empty space. The page should suit recruitment rather than adopt the reference's marketing-agency content.
- Keep actions and form controls recognizable. Animation is a supporting detail, not a prerequisite for reading or submitting.
- Use actual company details and genuine vacancies. Representative photography must not be described as the actual Sankhala team without confirmation.
- Do not add fabricated clients, numbers, reviews, awards, office locations or job listings to fill the design.

## Light and dark themes

Both are complete themes for the public pages and reusable controls, not an inverted screenshot or one dark section in an otherwise light-only site.

- Light: white/light-grey surfaces, charcoal headings, readable secondary text and the existing red action color.
- Dark: layered charcoal surfaces, light headings and body text, adjusted borders/inputs/focus indicators, and red accents whose contrast is checked on their actual backgrounds.
- Choose the logo variant by the actual surrounding surface. A dark photograph or footer may need the white logo even when the page is otherwise in light mode.
- Provide an accessible theme control. On a first visit, follow system preference; retain an explicit user choice on return visits and avoid a visible theme flash during loading.
- Check cards, forms, empty/error/loading states and mobile menus in both themes. Keep the selection readable without relying only on color.
- Theme preference and reduced-motion preference are independent. Reduced-motion users still receive both complete themes.

## Motion

Use the installed GSAP ScrollTrigger and SplitText foundation for selective section entrances and word/line effects. Keep the underlying text in server-rendered HTML and readable without JavaScript. Honor reduced motion, retain native scrolling and clean up animations when routes or layout change.

Avoid long animation sequences, animation on every element, scroll trapping or effects that delay Hire Talent, Find a Job, forms or job details. Keep keyboard focus stable when text effects are running.

## Verification and status

Review the implemented design at desktop, tablet and mobile widths, including 320px, in both themes. Verify original logo proportions, contrast, theme persistence, keyboard access, form states, reduced motion and working routes.

The reference files and updated direction are saved. The current running page is still the minimal stack-validation holding page; this document does not claim the full modern homepage or theme switcher is implemented.
