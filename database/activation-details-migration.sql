-- Run once on an existing AliPrompt database before accepting activation details.
USE aliprompt;
ALTER TABLE account_orders
  ADD COLUMN activation_email VARCHAR(190) NULL AFTER currency,
  ADD COLUMN contact_phone VARCHAR(20) NULL AFTER activation_email,
  ADD COLUMN activation_password_ciphertext TEXT NULL AFTER contact_phone,
  ADD COLUMN activation_password_iv VARCHAR(64) NULL AFTER activation_password_ciphertext,
  ADD COLUMN activation_password_tag VARCHAR(64) NULL AFTER activation_password_iv;
