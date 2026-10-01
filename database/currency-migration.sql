-- Existing orders and new live prices are stored in tomans.
-- Run once only on an existing AliPrompt database.
USE aliprompt;
ALTER TABLE account_orders ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'IRT' AFTER amount;
