-- Run this once in the AliPrompt MySQL database before accepting account orders.
USE aliprompt;

CREATE TABLE IF NOT EXISTS account_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_slug VARCHAR(80) NOT NULL,
  plan_title VARCHAR(160) NOT NULL,
  amount INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'IRT',
  activation_email VARCHAR(190) NULL,
  contact_phone VARCHAR(20) NULL,
  activation_password_ciphertext TEXT NULL,
  activation_password_iv VARCHAR(64) NULL,
  activation_password_tag VARCHAR(64) NULL,
  reference VARCHAR(100) NOT NULL,
  receipt_name VARCHAR(180) NOT NULL,
  receipt_type VARCHAR(80) NOT NULL,
  receipt MEDIUMBLOB NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note VARCHAR(500) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_account_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_account_orders_status (status, created_at),
  INDEX idx_account_orders_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
