# Frontend polish verification

31 October 2026. Scope: public frontend only. No backend, CRM, database, real vacancy data, analytics collection or online submission service was added.

This records the earlier polish pass saved in commit `8bae605`. Later form, cross-browser, office-map and contact-number work is recorded in the [final frontend pass](frontend-final-pass.md).

## What changed

- Explicit recruitment messaging and separate three-step employer/candidate journeys.
- Compact mobile spacing, clearer service cards, six useful FAQs, factual About/Services/Contact copy and an honest jobs empty state.
- Sticky navigation with stable dimensions, accessible mobile dialog, visible anchor targets, restrained menu/icon motion and a no-JavaScript fallback.
- Grouped employer/candidate fields; local CV selection with filename, size, replace/remove controls, inline errors and input retention. No simulated upload or success state.
- GSAP/ScrollTrigger and SplitText load as their sections approach the viewport. Reduced-motion visitors retain plain text and do not download animation libraries. Effects revert on unmount or a preference change.
- Responsive hero/logo image sizing and removal of the unused Barlow Condensed 700 preload. The site renders headings in the approved Barlow Condensed 600, with Inter 400/500/600 for the interface.

## Local production performance

Comparison against commit `7a78b20`, using the same local machine and Chromium harness. Three fresh browser contexts per version, 390×844 viewport at DPR1, disabled browser cache, 4× CPU slowdown, 150ms network latency and 1.6Mbps download. Values below are medians before scrolling or interacting.

| Metric | Before | Polished |
| --- | ---: | ---: |
| Initial JavaScript response bytes | 194,045 | 147,707 |
| Resource transfer bytes, excluding document | 348,613 | 268,127 |
| Largest Contentful Paint | 1,688ms | 1,600ms |
| Observed layout shift score | 0 | 0 |
| Observed long-task blocking time | 846ms | 542ms |

Initial JavaScript is 23.9% smaller and resource transfer is 23.1% smaller. Timing results are local lab samples and may vary with machine load, hosting and devices. The blocking-time sample is a custom long-task measurement, not Lighthouse TBT or INP. This is not a field Core Web Vitals report or a guarantee of a production score.

Raw evidence: [baseline](performance-baseline.json) and [polished](performance-polished.json). The reproducible harness is `tools/frontend/audit-performance.mjs`. Build and start a production server, then run:

```powershell
.\scripts\npm.ps1 run audit:performance '--' http://127.0.0.1:3100 current
```

The report is written to the ignored `test-results/` directory. Browser tests use port3100 themselves; stop any manual server on that port before running them.

## Functional checks

The browser suite covers server metadata, both themes, 320/390/768/1440px layouts, keyboard/menu behavior, sticky-header geometry, separate recruitment journeys, real scroll-text activation and cleanup, reduced motion, no-JavaScript content, form validation and CV replace/remove. API and form write requests remain absent. Additional form checks covered empty/oversized files, MIME mismatch and valid-file recovery.

Final result: production build and type checking passed, Biome passed, and 17 Playwright checks passed with three intentionally skipped duplicate viewport scenarios. Automated axe scans on the homepage and both forms reported zero violations in both themes and desktop/mobile viewports.

Real jobs, durable submissions, private CV storage and authenticated team administration remain the next phase. Prelaunch indexing stays disabled.
