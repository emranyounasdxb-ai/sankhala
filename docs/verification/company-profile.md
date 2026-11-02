# Company profile content verification

2 November 2026. Scope: Home, Services, About and the new public Clients page, using the owner's supplied profile and current confirmation of services and client artwork use.

- Production Webpack build, TypeScript and Biome checks passed. The static Clients route has unique title/description, canonical and social metadata, follows the existing indexing flag and is included in the sitemap when indexing is enabled.
- 24 route/theme/viewport checks passed: Chromium tested all four pages at desktop/mobile widths in both themes; Firefox and WebKit tested the Clients page at both widths and themes. All 17 client image assets decoded successfully in all three engines.
- 16 independent Chromium accessibility audits reported zero violations. Keyboard focus, mobile navigation dismissal, 320px layouts, the client CTA route and employer form validation were checked. A long client CTA overflowed at 320px in the initial check; its label was shortened to the existing Hire Talent action and the final checks passed.
- Client artwork containers have transparent backgrounds. Native RGBA logo exports preserve source artwork pixels after trimming unused transparent margins; metadata and hashes are in the client asset manifest. Dark ink/monochrome display treatments keep the artwork readable on dark surfaces without adding white image panels. The coloured panels intrinsic to the supplied Al Jaber mark remain part of that artwork.
- Supplied portfolio coverage is 25 names and 17 original artworks. Eight entries use text names because their logo files were not present in the supplied profile. No substitute logo or fabricated project, endorsement, staffing count, company history or availability promise was added.
- Header logo widths remain 96px desktop / 80px mobile; the footer logo remains 160px. Current office/contact details are preserved. Public pages contain no former company name, group founding date, unverified workforce/candidate/visa statistics or 24/7 claim.
- Public portfolio data is a static, owner-approved list, separate from private ATS client records. No database schema, submissions, document storage or staff permissions changed.

Screenshots and raw check results are local review artifacts under `.playwright-mcp/company-profile/` and `.runtime/profile-checks/`; these are ignored by Git. Physical-device testing remains unverified. Deployment is gated by the normal GitHub validation workflow and followed by public-route verification.
