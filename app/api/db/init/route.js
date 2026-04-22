import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let pool = null;
  try {
    // Import pg using require for compatibility
    const pg = require('pg');
    const { Pool } = pg;
    
    const connectionUrl = process.env.DATABASE_URL;
    
    if (!connectionUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 400 }
      );
    }

    console.log('[DB_INIT] Creating connection pool...');
    
    pool = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[DB_INIT] Initializing database schema...');

    // Create auth_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_users (
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
      )
    `);
    console.log('[DB_INIT] auth_users table created');

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)
    `);
    console.log('[DB_INIT] Index created');

    return NextResponse.json(
      { 
        message: 'Database initialized successfully',
        tables: ['auth_users'],
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DB_INIT] Error:', error.message, error.stack);
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    if (pool) {
      try {
        await pool.end();
        console.log('[DB_INIT] Pool closed');
      } catch (err) {
        console.error('[DB_INIT] Error closing pool:', err);
      }
    }
  }
}
