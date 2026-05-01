-- Database Migration: Add generation tracking columns
-- Purpose: Add columns for tracking story generation start and completion times

ALTER TABLE story_projects
ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_story_projects_generation_started_at
ON story_projects(generation_started_at);

CREATE INDEX IF NOT EXISTS idx_story_projects_generation_completed_at
ON story_projects(generation_completed_at);
