# Sankhala cPanel hosting setup

Verified 31 October 2026 in the owner's already authenticated cPanel session.

- Hosting: InMotion cPanel 138.0.19, primary domain `sankhala.ae`, account `sankhala`.
- SSL is shown active in cPanel. Domain PHP handler: `ea-php85` with PHP-FPM enabled. CLI PHP: **8.5.12**, matching the current stable PHP release checked at [php.net](https://www.php.net/downloads.php?source=Y).
- System Node.js **24.22.2** serves the registered production application through cPanel/Phusion Passenger. Builds, migrations, scheduled workers and local development use the separately pinned **26.13.0** runtime. The hosting account cannot edit the root-owned Passenger interpreter configuration; the system runtime was not replaced. Live staff sign-in and private dashboard API requests have passed on the configured hosting runtime.
- MariaDB **10.11.19** uses isolated database **`sankhala_ats`**, with a DML-only runtime user and a separate migration user. Application tables and the designated initial administrator are provisioned. The hosting database inherited latin1; migration `002_utf8mb4` converts the database and tables for multilingual candidate information, preserving and revalidating foreign keys. The production database and all table collations passed the UTF-8 verification after this migration.
- Created private directories `/home/sankhala/private/sankhala-ats/documents` and `/home/sankhala/private/sankhala-ats/backups`, outside `public_html`, with owner-only permissions. A default public `phpinfo.php` diagnostic was moved into the private backup directory with a timestamp.
- External SSH attempts on ports 22 and 2222 did not connect. A temporary deployment public key was removed from `authorized_keys` after that attempt; there is no retained deployment access from that key. The authenticated cPanel browser terminal is available.

The owner finalized **Node.js / Next.js backend**, superseding the interim PHP request. Provisional Laravel files were archived under ignored `.runtime/provisional-laravel`; no PHP application was deployed. A checksum-verified Node 26.13.0 runtime was installed privately. Its missing libatomic dependency was downloaded from the signed AlmaLinux repository, verified and extracted into the account's private runtime directory. The system Node installation was not replaced.

ClamAV 1.5.4 was downloaded from its official distribution, verified with the Cisco Talos GPG signing key, and extracted privately. Signed daily/main/bytecode databases were downloaded and successfully tested by FreshClam. Relocated library/certificate paths are explicitly configured; no TLS or database signature checks were disabled.

The hosting OS is AlmaLinux 8.10 with glibc 2.28. Next.js 16.4.3's native SWC/Turbopack binding requires glibc 2.29, so production uses the framework's supported `next build --webpack` compatibility mode. Local development/default builds retain Turbopack. The Node/Next application versions are unchanged; system glibc was not modified.

## Live application and deployment

The website is reachable over HTTPS at [sankhala.ae](https://sankhala.ae/), with staff sign-in at [/admin/login](https://sankhala.ae/admin/login). Passenger registers `apps/sankhala-live` at the domain root. Release code directories are readable by Apache for application detection; private credentials and documents remain outside the web root with owner-only permissions. The original `public_html` was backed up before application registration.

The deployment helper fetches `origin/main`, checks the matching successful GitHub Actions validation run, builds an isolated release, applies migrations, and checks local health before atomically switching the live symlink. It then verifies the exact revision through the protected HTTPS health endpoint. A failed live code check restores the previous release when one exists. Database changes require backward-compatible migrations; switching application code does not undo schema changes.

The managed schedule is installed and verified: deployment and application processing every two minutes, encrypted backups daily at 02:23 UTC (server time), and antivirus definitions every four hours. Ordinary code updates will need only a push/merge to `main`, followed by successful checks and the server build. Routine updates do not need an interactive cPanel login. Changes to hosting settings, credentials, DNS or mail routing can still require account access.

Source checkout: `/home/sankhala/apps/sankhala`; releases: `/home/sankhala/apps/sankhala-releases/<commit>`; active symlink: `/home/sankhala/apps/sankhala-live`. Database records, CVs, certificates, secrets and backups are not part of Git deployments. Publishing/editing jobs through the private dashboard updates the database without a Git push.

## Private configuration and handover

Private root: `/home/sankhala/private/sankhala-ats`. The application environment, migration environment, provision state and initial administrator credential are owner-only files. The initial sign-in credential is in `initial-admin.txt`; retrieve it through the owner's cPanel File Manager and change it in the staff account settings. No password is printed in Git, logs or this documentation.

The private transactional sender `ats-notifications@sankhala.ae` authenticates over verified SMTP TLS. The designated HR destination remains `admin@sankhala.ae`; that mailbox was absent from this hosting account, and the owner's mailbox/destination decision is pending. Authentication/TLS verification sent no external test email; actual recipient inbox delivery remains unverified.

The production scanner accepted a benign file and detected the standard harmless EICAR test. Private documents remain quarantined until scanning succeeds. Production encrypted database/document backup generation passed and automated schedules are installed. Restoration has passed against an isolated local scratch database; production restoration remains unverified. An independent offsite backup destination has not been configured.

`SEO_INDEXABLE=false` remains set for review. No fictional jobs or candidates are seeded in production. The employer requirement form still uses its reviewed email-draft handoff; the implemented durable ATS covers candidate applications and general CV submissions.

Automatic deployment proof: commit `5c9a96861a263c3f1f13d5a6adf981321eedb5e2` passed [GitHub validation](https://github.com/emranyounasdxb-ai/sankhala/actions/runs/41209358096), was picked up by the scheduled server deployment, and passed exact-revision live HTTPS verification on 31 October 2026. The subsequent initial smoke check passed public routes, staff login, secure cookies, protected APIs and all UTF-8 table collations. The source code did not require another interactive upload.
