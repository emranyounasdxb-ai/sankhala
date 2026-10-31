# Sankhala cPanel hosting setup

Verified 31 October 2026 in the owner's already authenticated cPanel session.

- Hosting: InMotion cPanel 138.0.19, primary domain `sankhala.ae`, account `sankhala`.
- SSL is shown active in cPanel. Domain PHP handler: `ea-php85` with PHP-FPM enabled. CLI PHP: **8.5.12**, matching the current stable PHP release checked at [php.net](https://www.php.net/downloads.php?source=Y).
- Node.js CLI **24.22.2** is installed. Application Manager/Phusion Passenger is available, with no registered applications. Compatibility of the eventual deployed Next.js application still needs testing; the local project runtime remains pinned separately.
- MariaDB **10.11.19** and PHP PDO MySQL are installed. Created isolated empty database **`sankhala_ats`** after confirming no databases existed in this account. No ATS tables, database users or application connection have been provisioned yet.
- Created private directories `/home/sankhala/private/sankhala-ats/documents` and `/home/sankhala/private/sankhala-ats/backups`, outside `public_html`, with owner-only permissions. A default public `phpinfo.php` diagnostic was moved into the private backup directory with a timestamp.
- External SSH attempts on ports 22 and 2222 did not connect. A temporary deployment public key was removed from `authorized_keys` after that attempt; there is no retained deployment access from that key. The authenticated cPanel browser terminal is available.

The owner finalized **Node.js / Next.js backend**, superseding the interim PHP request. Provisional Laravel files were archived under ignored `.runtime/provisional-laravel`; no PHP application was deployed. A checksum-verified Node 26.13.0 runtime was installed privately. Its missing libatomic dependency was downloaded from the signed AlmaLinux repository, verified and extracted into the account's private runtime directory. The system Node installation was not replaced.

ClamAV 1.5.4 was downloaded from its official distribution, verified with the Cisco Talos GPG signing key, and extracted privately. Signed daily/main/bytecode databases were downloaded and successfully tested by FreshClam. Relocated library/certificate paths are explicitly configured; no TLS or database signature checks were disabled.

Next integration work: finalize the runtime, provision scoped database credentials securely, apply reviewed migrations, configure staff authentication/private documents, implement durable submission and notification delivery, and test the actual application through Passenger/HTTPS. Storage directories and an empty database do not establish backups, authentication or a working ATS.
