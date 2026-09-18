-- Run once on existing AliPrompt MySQL databases.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(80) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- MySQL 8.0.29+ supports IF NOT EXISTS. For older MySQL, add this column manually once.
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL DEFAULT 'کاربر' AFTER id;
INSERT IGNORE INTO schema_migrations(version) VALUES ('001_add_user_name');
