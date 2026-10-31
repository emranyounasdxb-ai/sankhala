# Careers navigation improvements

31 October 2026. Implements the four approved usability improvements on public Careers.

- Search matches role names and category names, case-insensitively. Matching categories expand and show matching role types; results explicitly distinguish role-type counts from vacancy counts. A no-match state and clear action restore the full list.
- One compact availability notice replaces the large repeated empty messaging. Jobs at Sankhala and Jobs with Our Clients remain separate compact sections. No vacancy has been invented or published.
- The candidate form shows “Future opportunities: [role]” above its fields. Editing Preferred role updates that context. A selected role remains a general CV introduction, not an application to an employer-confirmed vacancy.
- Query `q` and allowed category IDs in `open` hold browsing state. Changes use the native history API without an entry per keystroke. Reload, browser back, direct category links and the CV page's Back to role categories action restore context. Hashes target category anchors under the sticky header.
- Copy link produces a URL containing current search and the selected open category. Clipboard denial shows a selected read-only URL for manual copying. Copying happens only after clicking. Role links disable speculative prefetching.

## Data and access

Only keyword/category navigation is stored in URLs. CV names, phone numbers, email addresses, notes and files are not put into URLs or browser storage. The `from` return destination is reconstructed from an exact `/jobs` pathname, an 80-character query limit, known category IDs and an allowed category anchor. External URLs and arbitrary return paths are discarded. The preferred-role query remains restricted to the owner's approved titles; the form itself is editable.

The role browser is server rendered from its query so native GET search, category links and role selection remain readable without JavaScript. JavaScript enables instant filtering, URL updates and copying. Enhanced search/copy/clear controls are disabled until hydration to prevent lost early input, and a native search form plus clear link are supplied without JavaScript. The candidate form stays disabled without JavaScript, as before. Search appears before the optional priority-role shortcuts so typing does not remove content above the focused input.

No recruitment backend, publication service, profile storage or automatic CV submission was added. Existing employer-confirmation and no-fake-vacancy requirements remain in force. Physical-device and hosted field-performance verification remain pending.

## Verification

Production build, TypeScript and Biome passed. The focused role-browser suite passed 31 supported checks across Chromium desktop/Pixel emulation, Firefox desktop and WebKit desktop/iPhone emulation, with four duplicate server/no-JavaScript combinations intentionally skipped. Coverage includes instant filtering/no-match recovery, URL reload and open state, copied category links, CV context editing, explicit return and browser-back restoration, clipboard denial/selection fallback, external-return rejection, native no-JavaScript search and 20 independent light/dark axe audits with zero violations.

After placing search before priority shortcuts and tightening mobile availability spacing, the final desktop/iPhone run passed seven checks with one duplicate no-JavaScript skip. It rechecked browsing history, native search and initial-page light/dark accessibility. Narrow screenshots, selected-role context and search placement were inspected. Tests wait for navigation to commit before exercising browser back; enhanced inputs stay disabled until hydration to prevent an early-input race.
