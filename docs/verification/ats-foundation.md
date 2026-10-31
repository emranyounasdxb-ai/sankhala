# ATS foundation verification

31 October 2026. The ATS has an isolated local MariaDB test environment and a production review deployment on the owner's cPanel account at [sankhala.ae](https://sankhala.ae/).

## Implemented boundary

- Zod schemas validate candidate details, consent, experience, applicable visa information and confirmed vacancy terms. Unexpected candidate fields such as client, category, status and recruiter are rejected.
- Better Auth staff sessions and database permissions deny anonymous/inactive staff and restrict non-admin queries, details, documents and exports to assigned scope. Public signup is disabled.
- CSV exports escape formula prefixes; XLSX cells use inline text, XML escaping and UTF-8. XLSX is generated with `fflate`; tests inspect its ZIP/XML structure, not an installed Microsoft Excel application.
- Candidate/HR notifications are committed to an outbox with the application. Six test messages reached an isolated authenticated STARTTLS Mailpit sink; a failed TLS attempt retained the applications and pending messages, and delivery recovered after the local test CA was trusted. These were not external emails or production inbox-delivery tests.
- Separate candidate/job/application identities, immutable snapshots, duplicate review/linking and transactional persistence are implemented and tested against MariaDB. Repeated identical requests return the saved reference; stale updates and closed vacancies are rejected.
- The HR workspace supports confirmed jobs, clients, staff access, candidate/application lists, filters, stages/history, notes, interview scheduling with conflict checks, Talent Pool and selected exports. Candidate submission supports review before sending.
- Private documents are quarantined until the scanner reports clean. All three local documents passed the configured runtime scanner. On production, the scanner accepted a benign file and detected the standard harmless EICAR test; no manual scan bypass is provided.
- Encrypted SQL and three private documents were restored into a separate temporary local database. File hashes matched and a corrupted AES-GCM backup was rejected. Production encrypted SQL/document backup generation passed. Production restoration and an independent offsite destination remain unverified/unconfigured.

Five focused domain tests and the database/API integration scenario pass, including multilingual names (Arabic, Urdu and a four-byte Unicode character). Twenty independent route/theme accessibility audits across desktop and mobile emulation reported no violations. The local browser test completed staff login, saved a draft vacancy and sent a general CV through review to a durable receipt. Physical device compatibility and installed Microsoft Excel remain unverified. Build, types, lint and the production dependency audit pass in GitHub Actions.

Live HTTPS checks passed for the homepage, Careers, Contact, Submit CV and staff login. Production staff sign-in, secure/HttpOnly cookies, authenticated dashboard APIs and anonymous-access denial passed. A separate schema check detected the host's latin1 default; migration `002_utf8mb4` was applied and the production database plus all table collations passed UTF-8 verification. No fictional vacancy or candidate submission was inserted on production. SMTP authentication/TLS verification sent no external test email; actual inbox delivery still needs verification and the HR mailbox decision.

## Integration prerequisite

Use only the identified InMotion cPanel account, `sankhala.ae`, the isolated `sankhala_ats` database and private storage. `.env.example` contains non-secret placeholders. Real credentials, CVs, local test databases and generated account passwords are ignored by Git. Unrelated databases and containers remain untouched.

Scheduled deployment picked up checked commit `5c9a968` without an interactive upload and verified that exact revision over live HTTPS. Scheduled document/email processing completed successfully. Daily encrypted backup and four-hour antivirus-definition update schedules are installed; observing future daily executions and offsite recovery remains operational follow-up.
