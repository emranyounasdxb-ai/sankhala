# Homepage logos and favicon verification

2 November 2026.

- Production Webpack build, TypeScript and Biome checks passed.
- Twelve browser configurations passed: Chromium at 1440/390/320px in both themes, Firefox and WebKit at 390px in both themes, plus reduced-motion and no-JavaScript fallbacks. Six Chromium axe audits reported zero violations.
- Verified actual movement, hover/focus pause, explicit pause/resume, equal loop-group geometry, transparent artwork, no page overflow and no separate homepage captions. All 17 original logos retain accessible names; the duplicate loop is hidden from assistive technology. The static Clients directory retains 25 names and 17 artworks.
- Header widths remain 96px desktop / 80px mobile; footer width remains 160px. Existing links and portfolio data are preserved.
- Each favicon metadata resource returned the exact project bytes. Brand verification passed for all 44 image exports, including the branded ICO alias with 16/32/48px frames.
- Live diagnosis found a hosting placeholder at `/favicon.ico` (4286 bytes), while the project's correct icon is 1652 bytes. Versioned branded URLs avoid the stale browser URL. The deployment helper synchronizes only that named document-root file, preserves its first previous contents privately, and rejects non-regular targets. Isolated checks passed replacement, backup retention, repeated runs, missing-file creation and non-file rejection.

Local screenshots and raw checks are ignored under `.runtime/marquee-checks/`. Physical-device testing remains unverified. Production deployment uses the existing GitHub validation gate and automatic cPanel release process; public resources are checked after release.
