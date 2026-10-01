-- Run once on existing AliPrompt databases.
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prompt_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_prompt_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_prompt_ratings_prompt FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  CONSTRAINT fk_prompt_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_prompt_ratings_user (prompt_id, user_id),
  INDEX idx_prompt_ratings_prompt (prompt_id),
  INDEX idx_prompt_ratings_user (user_id)
) ENGINE=InnoDB;
