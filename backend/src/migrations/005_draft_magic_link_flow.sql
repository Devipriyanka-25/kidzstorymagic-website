-- Draft persistence, generation guardrails, and secure preview magic links.

ALTER TABLE story_projects
  ADD COLUMN IF NOT EXISTS is_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS draft_expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMP;

UPDATE story_projects
SET draft_expires_at = COALESCE(draft_expires_at, updated_at + INTERVAL '24 hours')
WHERE status IN ('draft', 'in_progress', 'pending');

CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,
  story_id INTEGER NOT NULL REFERENCES story_projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_story_projects_draft_expires_at
  ON story_projects(draft_expires_at);

CREATE INDEX IF NOT EXISTS idx_story_projects_user_status_updated
  ON story_projects(user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash
  ON magic_links(token_hash);

CREATE INDEX IF NOT EXISTS idx_magic_links_story_user
  ON magic_links(story_id, user_id);

CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at
  ON magic_links(expires_at);
