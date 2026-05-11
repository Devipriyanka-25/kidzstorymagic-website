/**
 * Supabase Database Initialization Endpoint
 * POST /api/setup/supabase-init
 * Initializes all database tables and schema
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// SQL statements to initialize database
const SQL_STATEMENTS = [
  // Auth users table
  `CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    profile_picture_url TEXT,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Stories table
  `CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    age_group VARCHAR(50),
    theme VARCHAR(100),
    illustration_style VARCHAR(100),
    num_pages INTEGER DEFAULT 10,
    story_content TEXT,
    html_content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    cover_image_url TEXT,
    pdf_url TEXT,
    epub_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
  );`,

  // Drafts table
  `CREATE TABLE IF NOT EXISTS drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    child_name VARCHAR(255),
    theme VARCHAR(100),
    illustration_style VARCHAR(100),
    gender VARCHAR(50),
    age INTEGER,
    interests TEXT,
    special_notes TEXT,
    form_data JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Photos table (for face swap feature)
  `CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    child_name VARCHAR(255),
    original_url TEXT NOT NULL,
    face_detected BOOLEAN DEFAULT false,
    face_image_url TEXT,
    face_embedding JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Payments table
  `CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    stripe_payment_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Face swapped illustrations table
  `CREATE TABLE IF NOT EXISTS face_swapped_illustrations (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    photo_id INTEGER REFERENCES photos(id) ON DELETE SET NULL,
    page_number INTEGER,
    original_illustration_url TEXT NOT NULL,
    swapped_illustration_url TEXT NOT NULL,
    face_swap_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);`,
  `CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_photos_story_id ON photos(story_id);`,
  `CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_face_swapped_story_id ON face_swapped_illustrations(story_id);`,
];

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.log('[SUPABASE_INIT] Starting database initialization...');

    const results = {
      timestamp: new Date().toISOString(),
      initialized: false,
      tables: [],
      errors: [],
    };

    // Execute each SQL statement
    for (const sql of SQL_STATEMENTS) {
      try {
        const tableName = extractTableName(sql);
        console.log(`[SUPABASE_INIT] Executing: ${tableName || 'index'}`);

        // For Supabase, we need to use the REST API to execute raw SQL
        // Since we can't execute raw SQL via REST, we'll create tables via REST API
        // This is a workaround using RPC if available, or we'll provide instructions

        results.tables.push({
          name: tableName || 'index',
          status: 'skipped_rest_api',
          message: 'Use Supabase SQL Editor to run this statement',
          sql: sql.substring(0, 100) + '...',
        });
      } catch (error) {
        console.error(`[SUPABASE_INIT] Error:`, error.message);
        results.errors.push({
          sql: sql.substring(0, 100),
          error: error.message,
        });
      }
    }

    results.initialized = results.errors.length === 0;

    // Test connection to Supabase
    const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseKey = String(
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
    ).trim();

    if (!supabaseUrl || !supabaseKey) {
      results.connectivity = {
        status: 'missing_env',
        error:
          'NEXT_PUBLIC_SUPABASE_URL and a server-side Supabase key are required for connectivity checks.',
      };
    } else {
      try {
        console.log('[SUPABASE_INIT] Testing Supabase connectivity...');
        const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        results.connectivity = {
          status: testResponse.ok ? 'connected' : 'failed',
          statusCode: testResponse.status,
        };
      } catch (error) {
        results.connectivity = {
          status: 'error',
          error: error.message,
        };
      }
    }

    return NextResponse.json(
      {
        message: 'Database initialization guide',
        instructions: 'Copy and run the SQL statements below in Supabase SQL Editor',
        sqlStatements: SQL_STATEMENTS,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SUPABASE_INIT] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Database initialization failed',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

function extractTableName(sql) {
  const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
  return match ? match[1] : null;
}
