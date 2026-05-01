-- Database Migration: Add role column to users table
-- Purpose: Support role-based access control (admin, user, etc.)

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);
