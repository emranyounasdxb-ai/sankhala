# Careers categories and publication policy

Confirmed by the owner on 31 October 2026.

## Public structure

Careers has two vacancy sections: **Jobs at Sankhala** and **Jobs with Our Clients**. Both currently contain explicit empty states because no actual employer-confirmed vacancy has been provided. The owner authorizes publishing only genuinely available vacancies confirmed by the employer. Role titles and category lists are interests/taxonomy, not permission to publish a vacancy.

The 12 categories and all supplied job titles are preserved in `src/lib/job-categories.ts`: Office & Administration; Sales & Customer Service; HR & Recruitment; Accounts & Finance; Cleaning & Facilities; Drivers & Transport; Warehouse & Logistics; Construction & Technical; Security; Hospitality & Catering; Retail & Supermarket; Manufacturing & Production.

Priority role interests: Cleaner, Light Vehicle Driver, Warehouse Helper, Picker & Packer, General Labourer, Security Guard, Sales Executive, Telesales Executive, Customer Service Executive, Office Assistant, Electrician and HVAC Technician.

Each category offers **Submit your CV for future opportunities** through its role links. Selected role titles prefill the editable preferred-role field on the general CV page. Query values must match the approved role list; unknown/repeated values are ignored. This route still prepares a local email introduction and does not automatically submit or upload a CV. Security role copy states that relevant approvals/certification are required; the exact requirements belong on the confirmed vacancy.

## Required job information

Every future published vacancy must contain job title, location/emirate, hiring company (or Sankhala client), vacancy count, salary range, duty hours, weekly off, experience, required licence/certification, benefits and closing date. Each record must identify whether it belongs to Sankhala or a client. Employer confirmation, actual availability and closing status must be checked before publication and application acceptance.

These fields are shown on the separate noindex design-preview detail screen. The fictional sample origin is labeled; unconfirmed employment terms display “Awaiting employer confirmation.” No salary, benefit, headcount, certification or date values were invented. No JobPosting schema was added to the category page or mock detail pages.

## Backend work remains

No job feed, publication API or CRM/database has been added. Future administration must require complete employer-confirmed data, keep unconfirmed records unpublished, remove/close unavailable posts and recheck availability on submission. Do not connect fictional design fixtures to the live job feed. Categories do not imply current demand, availability or employer confirmation.

## Verification

Build, TypeScript and Biome passed. All 20 focused category checks passed across Chromium desktop/Pixel emulation, Firefox desktop and WebKit desktop/iPhone emulation. Coverage includes 12 categories and priority roles, both employer sections, Security certification wording, selected-role CV prefill/editing, ignored unknown query values, all 11 detail labels, absence of mock vacancies/JobPosting schema on public Careers, 320px layouts and light/dark axe scans with zero violations. Services content separately passed its 35 focused browser checks. Desktop and mobile Careers screenshots were inspected. Mobile results are emulation, not hardware verification.
