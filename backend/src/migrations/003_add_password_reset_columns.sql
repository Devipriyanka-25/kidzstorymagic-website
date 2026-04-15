-- Database Migration: Add password reset token columns
-- Purpose: Support forgot-password and reset-password auth flow

ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_reset_token_hash
ON users(reset_token_hash);
