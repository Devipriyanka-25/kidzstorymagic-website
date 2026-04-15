-- Database Migration: Align draft/story-generation routes with schema
-- Purpose: Add columns referenced by dashboard drafts and story generation APIs

ALTER TABLE story_projects
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS illustration_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS custom_illustration_prompt TEXT,
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;

ALTER TABLE story_content
ADD COLUMN IF NOT EXISTS page_illustration_prompt TEXT,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_story_projects_updated_at
ON story_projects(updated_at);
