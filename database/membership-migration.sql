-- For existing AliPrompt databases: run once after schema.sql.
USE aliprompt;
ALTER TABLE users ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT 'کاربر';
ALTER TABLE users ADD COLUMN plan ENUM('free','pro') NOT NULL DEFAULT 'free';
CREATE TABLE IF NOT EXISTS subscription_payments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 amount INT UNSIGNED NOT NULL DEFAULT 250000,
 reference VARCHAR(100) NOT NULL,
 receipt MEDIUMBLOB NOT NULL,
 receipt_type VARCHAR(30) NOT NULL,
 status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 reviewed_at TIMESTAMP NULL,
 FOREIGN KEY(user_id) REFERENCES users(id),
 INDEX idx_payment_user(user_id), INDEX idx_payment_status(status,created_at)
) ENGINE=InnoDB;
