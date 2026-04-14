-- PostgreSQL Database Schema for AI Storybook Creator Platform
-- Database: kidz_story_magic

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(500),
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Story Projects Table
CREATE TABLE story_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  age_group VARCHAR(50) NOT NULL,
  theme VARCHAR(100) NOT NULL,
  page_count INTEGER NOT NULL,
  child_name VARCHAR(255) NOT NULL,
  child_gender VARCHAR(20),
  child_interests TEXT,
  child_notes TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  preview_url VARCHAR(500),
  published_pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Story Content Table (stores generated story text)
CREATE TABLE story_content (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES story_projects(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  page_title VARCHAR(255),
  page_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, page_number)
);

-- Images Table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES story_projects(id) ON DELETE CASCADE,
  original_filename VARCHAR(255),
  original_url VARCHAR(500),
  blurred_url VARCHAR(500),
  watermarked_url VARCHAR(500),
  high_res_url VARCHAR(500),
  face_detected BOOLEAN DEFAULT false,
  processing_status VARCHAR(50) DEFAULT 'pending',
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES story_projects(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  original_amount DECIMAL(10, 2),
  original_currency VARCHAR(3),
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  payment_method VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP
);

-- Generated PDFs Table
CREATE TABLE generated_pdfs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES story_projects(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  pdf_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  page_count INTEGER,
  is_blurred BOOLEAN DEFAULT false,
  has_watermark BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Download History Table
CREATE TABLE download_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pdf_id INTEGER NOT NULL REFERENCES generated_pdfs(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Currency Exchange Rates Table (cache)
CREATE TABLE currency_rates (
  id SERIAL PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15, 6) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency)
);

-- Audit Log Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100),
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_story_projects_user_id ON story_projects(user_id);
CREATE INDEX idx_story_projects_status ON story_projects(status);
CREATE INDEX idx_story_content_project_id ON story_content(project_id);
CREATE INDEX idx_images_project_id ON images(project_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_project_id ON orders(project_id);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_generated_pdfs_project_id ON generated_pdfs(project_id);
CREATE INDEX idx_generated_pdfs_order_id ON generated_pdfs(order_id);
CREATE INDEX idx_download_history_user_id ON download_history(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_currency_rates_pair ON currency_rates(from_currency, to_currency);
