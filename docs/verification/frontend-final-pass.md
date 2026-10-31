# Frontend final pass

31 October 2026. Scope: the five approved frontend improvements, followed by the supplied office address/map and separate calling number. Backend, CRM, real vacancies and online submissions remain deferred.

## Implemented

1. Persistent role, location and international-phone examples on both forms, connected to their inputs for assistive technology.
2. One focusable error summary after an invalid check, with links to every affected field. Required fields, email format, phone, headcount and local CV checks run together. Inline errors update without moving focus or clearing the user's entries.
3. Contextual WhatsApp action in the Hire Talent header/menu, plus Call us and WhatsApp before the mobile form.
4. Chromium, Firefox and WebKit desktop projects, Pixel 7 Chromium emulation and iPhone 13 WebKit emulation. A deterministic regression check also covers changing the system theme while hydration is delayed; subscription now reconciles that change.
5. Server-rendered Organization JSON-LD on the homepage using confirmed brand name, URL, logo, email, calling number, UAE coverage and the subsequently confirmed postal address. The serialization escapes HTML delimiters. No legal name, ratings, founding date or social profiles were invented; prelaunch indexing stays disabled.

The Contact page now shows Office 218, Business Village B, Deira, Dubai, a responsive lazy Google Maps embed and the supplied directions link. Calling links use `+971 4 611 3100` / `tel:+97146113100`. WhatsApp keeps `+971 56 524 3800` / `https://wa.me/971565243800`. The current privacy information explains the embedded Google service.

## Verification scope

Production build, TypeScript and Biome checks passed. The current suite contains 115 project/scenario combinations: 101 supported checks were verified across the full run and focused final rerun. The focused rerun passed all 46 supported cases with four explicit Windows WebKit skips; the other 55 supported cases had passed in the preceding full run. Ten additional duplicate server-output/no-JavaScript combinations are intentionally skipped. There are no unresolved supported-case failures.

The final focused command was:

```powershell
.\scripts\npm.ps1 run test:e2e '--' --grep 'hiring page contact|skip link and mobile|native keyboard traversal|public layout'
```

All 30 independent homepage/form route-theme accessibility audits passed with zero axe violations across the five projects. Screenshots, live map rendering, field-error focus and narrow layouts were also inspected. Physical-device and Windows WebKit native Tab limitations remain as described below.

- Browser coverage includes both themes, error-summary and CV interactions, contact targets, office-map dimensions, keyboard focus, mobile menu, sticky navigation, reduced motion, actual scroll text, no-JavaScript content, server metadata and local-only form behavior.
- Automated map checks stub Google's iframe response to verify our integration independently. A separate live Chromium inspection loaded the supplied map, including imagery, at desktop and narrow mobile widths. The supplied pin is labeled **ALIYAS Real Estate**; it is preserved as the user's location reference, not represented as Sankhala's verified business listing.
- Native Tab traversal is checked in Chromium and Firefox. The Windows WebKit port skips links with both Tab and Alt+Tab even on a bare HTML fixture, with no exposed full-keyboard-access preference. Those four project/test combinations are explicitly skipped; WebKit still checks programmatic focus, Enter activation, dialog behavior and form controls. macOS Safari native traversal remains a hardware check. Firefox geometry checks tolerate subpixel rounding at device scale.
- Each route/theme accessibility audit gets a fresh Playwright context. An isolated A/B check found that reusing a Windows WebKit page after an axe scan corrupted subsequent computed backgrounds, although stylesheet responses and CSS rules were identical. Fresh pages/contexts rendered correctly and passed axe. The tests retain computed-color assertions and all accessibility rules, with no product CSS workaround.
- No physical iPhone or Android phone was available: ADB listed no attached devices, and the Windows device inventory showed no connected phone. Mobile results are emulation, not hardware testing. Playwright WebKit is browser-engine coverage, not certification of every shipping Safari version.

The earlier performance comparison remains historical evidence for the previous polish pass; this revision does not claim a new field-performance score. See [the original conditions and raw reports](frontend-polish.md).

## References

- [Next.js JSON-LD guidance](https://nextjs.org/docs/app/guides/json-ld)
- [Google Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Playwright browser projects](https://playwright.dev/docs/test-projects) and [emulation](https://playwright.dev/docs/emulation)
- [Playwright's WebKit keyboard guidance](https://github.com/microsoft/playwright/issues/5609)
