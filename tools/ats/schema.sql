CREATE TABLE IF NOT EXISTS auth_user (
 id VARCHAR(128) PRIMARY KEY, name VARCHAR(160) NOT NULL, email VARCHAR(254) NOT NULL UNIQUE,
 emailVerified BOOLEAN NOT NULL DEFAULT FALSE, image TEXT, createdAt DATETIME(3) NOT NULL, updatedAt DATETIME(3) NOT NULL,
 role VARCHAR(32) NOT NULL DEFAULT 'recruiter', active BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auth_session (
 id VARCHAR(128) PRIMARY KEY, expiresAt DATETIME(3) NOT NULL, token VARCHAR(255) NOT NULL UNIQUE,
 createdAt DATETIME(3) NOT NULL, updatedAt DATETIME(3) NOT NULL, ipAddress VARCHAR(100), userAgent TEXT, userId VARCHAR(128) NOT NULL,
 FOREIGN KEY(userId) REFERENCES auth_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auth_account (
 id VARCHAR(128) PRIMARY KEY, accountId VARCHAR(255) NOT NULL, providerId VARCHAR(100) NOT NULL, userId VARCHAR(128) NOT NULL,
 accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt DATETIME(3), refreshTokenExpiresAt DATETIME(3), scope TEXT, password TEXT,
 createdAt DATETIME(3) NOT NULL, updatedAt DATETIME(3) NOT NULL, UNIQUE KEY account_provider(providerId,accountId),
 FOREIGN KEY(userId) REFERENCES auth_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auth_verification (
 id VARCHAR(128) PRIMARY KEY, identifier VARCHAR(255) NOT NULL, value TEXT NOT NULL, expiresAt DATETIME(3) NOT NULL,
 createdAt DATETIME(3) NOT NULL, updatedAt DATETIME(3) NOT NULL, KEY verification_identifier(identifier)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auth_rate_limit (
 id VARCHAR(128) PRIMARY KEY, `key` VARCHAR(255) NOT NULL UNIQUE, count INT NOT NULL, lastRequest BIGINT NOT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_clients (
 id CHAR(36) PRIMARY KEY, name VARCHAR(160) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_jobs (
 id CHAR(36) PRIMARY KEY, reference VARCHAR(40) NOT NULL UNIQUE, title VARCHAR(160) NOT NULL, category VARCHAR(100) NOT NULL,
 employer_kind VARCHAR(16) NOT NULL, client_id CHAR(36), location VARCHAR(200) NOT NULL, emirate VARCHAR(40),
 status VARCHAR(16) NOT NULL DEFAULT 'draft', employer_confirmed BOOLEAN NOT NULL DEFAULT FALSE, confirmed_by VARCHAR(128),
 closing_date DATE NOT NULL, data JSON NOT NULL, version INT NOT NULL DEFAULT 1,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(client_id) REFERENCES ats_clients(id), FOREIGN KEY(confirmed_by) REFERENCES auth_user(id), KEY job_feed(status,closing_date)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_job_staff (
 job_id CHAR(36) NOT NULL, staff_id VARCHAR(128) NOT NULL, PRIMARY KEY(job_id,staff_id),
 FOREIGN KEY(job_id) REFERENCES ats_jobs(id), FOREIGN KEY(staff_id) REFERENCES auth_user(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_candidates (
 id CHAR(36) PRIMARY KEY, reference VARCHAR(40) NOT NULL UNIQUE, full_name VARCHAR(160) NOT NULL, email VARCHAR(254) NOT NULL, phone VARCHAR(25) NOT NULL,
 profile JSON NOT NULL, talent_pool BOOLEAN NOT NULL DEFAULT FALSE, merged_into CHAR(36), review_after DATE NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(merged_into) REFERENCES ats_candidates(id), KEY candidate_email(email), KEY candidate_phone(phone), KEY candidate_review(review_after)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_applications (
 id CHAR(36) PRIMARY KEY, reference VARCHAR(40) NOT NULL UNIQUE, candidate_id CHAR(36) NOT NULL, job_id CHAR(36),
 candidate_snapshot JSON NOT NULL, job_snapshot JSON, category VARCHAR(100), client_id CHAR(36), applied_role VARCHAR(160) NOT NULL,
 country VARCHAR(100) NOT NULL, emirate VARCHAR(40), experience DECIMAL(5,2) NOT NULL, availability VARCHAR(40) NOT NULL,
 stage VARCHAR(24) NOT NULL DEFAULT 'New', assigned_recruiter_id VARCHAR(128), read_at DATETIME(3),
 consent_version VARCHAR(50) NOT NULL, consent_at DATETIME(3) NOT NULL, idempotency_key CHAR(36) NOT NULL UNIQUE, request_hash CHAR(64) NOT NULL,
 version INT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(candidate_id) REFERENCES ats_candidates(id), FOREIGN KEY(job_id) REFERENCES ats_jobs(id), FOREIGN KEY(client_id) REFERENCES ats_clients(id),
 FOREIGN KEY(assigned_recruiter_id) REFERENCES auth_user(id), KEY application_filters(stage,created_at), KEY application_job(job_id), KEY application_category(category)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_documents (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, storage_key VARCHAR(100) NOT NULL UNIQUE, original_name VARCHAR(200) NOT NULL,
 mime VARCHAR(100) NOT NULL, size_bytes INT NOT NULL, sha256 CHAR(64) NOT NULL, kind VARCHAR(24) NOT NULL,
 scan_status VARCHAR(24) NOT NULL DEFAULT 'pending', scan_attempts INT NOT NULL DEFAULT 0, scanned_at DATETIME(3),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(application_id) REFERENCES ats_applications(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_stage_history (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, actor_id VARCHAR(128), old_stage VARCHAR(24), new_stage VARCHAR(24) NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(application_id) REFERENCES ats_applications(id), FOREIGN KEY(actor_id) REFERENCES auth_user(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_notes (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, actor_id VARCHAR(128) NOT NULL, body TEXT NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(application_id) REFERENCES ats_applications(id), FOREIGN KEY(actor_id) REFERENCES auth_user(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_interviews (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, staff_id VARCHAR(128) NOT NULL, starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL,
 timezone VARCHAR(100) NOT NULL, location VARCHAR(500) NOT NULL, notes TEXT NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'Scheduled',
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(application_id) REFERENCES ats_applications(id), FOREIGN KEY(staff_id) REFERENCES auth_user(id), KEY interview_schedule(staff_id,starts_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_duplicate_matches (
 id CHAR(36) PRIMARY KEY, candidate_id CHAR(36) NOT NULL, possible_candidate_id CHAR(36) NOT NULL, evidence VARCHAR(30) NOT NULL,
 resolution VARCHAR(24) NOT NULL DEFAULT 'pending', resolved_by VARCHAR(128), resolved_at DATETIME(3),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(candidate_id) REFERENCES ats_candidates(id), FOREIGN KEY(possible_candidate_id) REFERENCES ats_candidates(id),
 FOREIGN KEY(resolved_by) REFERENCES auth_user(id), UNIQUE KEY duplicate_pair(candidate_id,possible_candidate_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_outbox (
 id CHAR(36) PRIMARY KEY, application_id CHAR(36) NOT NULL, delivery_key VARCHAR(160) NOT NULL UNIQUE, payload JSON NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'pending', attempts INT NOT NULL DEFAULT 0, next_attempt_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 locked_until DATETIME(3), last_error VARCHAR(200), delivered_at DATETIME(3), created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY(application_id) REFERENCES ats_applications(id), KEY outbox_pending(status,next_attempt_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_activity (
 id CHAR(36) PRIMARY KEY, actor_id VARCHAR(128), action VARCHAR(50) NOT NULL, record_id VARCHAR(128), metadata JSON NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(actor_id) REFERENCES auth_user(id), KEY activity_date(created_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_retention (
 id CHAR(36) PRIMARY KEY, candidate_id CHAR(36) NOT NULL, reason VARCHAR(500) NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'Review',
 verified_by VARCHAR(128), verified_at DATETIME(3), hold_reason VARCHAR(500), completed_at DATETIME(3),
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), FOREIGN KEY(candidate_id) REFERENCES ats_candidates(id), FOREIGN KEY(verified_by) REFERENCES auth_user(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ats_rate_limits (
 bucket CHAR(64) PRIMARY KEY, attempts INT NOT NULL, expires_at DATETIME(3) NOT NULL, KEY rate_expiry(expires_at)
) ENGINE=InnoDB;
