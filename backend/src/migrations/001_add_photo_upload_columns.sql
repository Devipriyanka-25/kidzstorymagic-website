-- Database Migration: Add photo upload columns to story_projects table
-- Purpose: Store photo upload URLs and metadata for personalization

-- Add photo-related columns if they don't already exist
ALTER TABLE story_projects
ADD COLUMN IF NOT EXISTS child_photo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS child_photo_preview_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS child_photo_processed_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS photo_metadata JSONB;

-- Create index for faster lookups by project
CREATE INDEX IF NOT EXISTS idx_story_projects_photo_url 
ON story_projects(child_photo_url);

-- Add comments for documentation
COMMENT ON COLUMN story_projects.child_photo_url IS 'Original uploaded photo URL in Azure Blob Storage';
COMMENT ON COLUMN story_projects.child_photo_preview_url IS 'Blurred (privacy-protected) photo preview URL';
COMMENT ON COLUMN story_projects.child_photo_processed_url IS 'Watermarked photo URL';
COMMENT ON COLUMN story_projects.photo_metadata IS 'JSONB metadata: fileId, facesDetected, faceRegions, uploadedAt, originalFileName';
