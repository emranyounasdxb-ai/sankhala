# ATS foundation verification

31 October 2026. The ATS runs against an isolated local MariaDB database. Production deployment is being configured on the owner's cPanel account.

## Implemented boundary

- Zod schemas validate candidate details, consent, experience, applicable visa information and confirmed vacancy terms. Unexpected candidate fields such as client, category, status and recruiter are rejected.
- Better Auth staff sessions and database permissions deny anonymous/inactive staff and restrict non-admin queries, details, documents and exports to assigned scope. Public signup is disabled.
- CSV exports escape formula prefixes; XLSX cells use inline text, XML escaping and UTF-8. XLSX is generated with `fflate`; tests inspect its ZIP/XML structure, not an installed Microsoft Excel application.
- Candidate/HR notifications are committed to an outbox with the application. Six test messages reached an isolated authenticated STARTTLS Mailpit sink; a failed TLS attempt retained the applications and pending messages, and delivery recovered after the local test CA was trusted. These were not external emails or production inbox-delivery tests.
- Separate candidate/job/application identities, immutable snapshots, duplicate review/linking and transactional persistence are implemented and tested against MariaDB. Repeated identical requests return the saved reference; stale updates and closed vacancies are rejected.
- The HR workspace supports confirmed jobs, clients, staff access, candidate/application lists, filters, stages/history, notes, interview scheduling with conflict checks, Talent Pool and selected exports. Candidate submission supports review before sending.
- Private documents are quarantined until the scanner reports clean. Runtime scanning and production cron setup still need deployment verification; no manual scan bypass is provided.
- Encrypted SQL and three private documents were restored into a separate temporary local database. File hashes matched and a corrupted AES-GCM backup was rejected. Production/offsite backup operations have not yet been verified.

Five focused domain tests and the database/API integration scenario pass. Twenty independent route/theme accessibility audits across desktop and mobile emulation reported no violations. The browser test completed staff login, saved a draft vacancy and sent a general CV through review to a durable receipt. Physical device compatibility and installed Microsoft Excel remain unverified. Build, types, lint and the production dependency audit pass; deployment verification is the next milestone.

## Integration prerequisite

Use only the identified InMotion cPanel account, `sankhala.ae`, the isolated `sankhala_ats` database and private storage. `.env.example` contains non-secret placeholders. Real credentials, CVs, local test databases and generated account passwords are ignored by Git. Unrelated databases and containers remain untouched.
