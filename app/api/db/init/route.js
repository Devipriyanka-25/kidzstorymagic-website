import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let pool = null;
  try {
    console.log('[DB_INIT] Start - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Dynamic import for pg
    const { Pool } = await import('pg');
    
    const connectionUrl = process.env.DATABASE_URL;
    if (!connectionUrl) {
      return NextResponse.json({ error: 'No DATABASE_URL' }, { status: 400 });
    }

    console.log('[DB_INIT] Creating pool with connection URL...');
    pool = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[DB_INIT] Testing connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('[DB_INIT] Connection test passed:', testResult.rows[0]);

    console.log('[DB_INIT] Creating auth_users table...');
    const createTable = await pool.query(`
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
    console.log('[DB_INIT] Table created');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)`);
    console.log('[DB_INIT] Index created');

    return NextResponse.json({
      message: 'Database initialized successfully',
      tables: ['auth_users']
    }, { status: 200 });

  } catch (error) {
    console.error('[DB_INIT] Error:', error.message, error.code);
    return NextResponse.json({
      error: 'Database initialization failed',
      message: error.message
    }, { status: 500 });
  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('[DB_INIT] Error closing pool:', e);
      }
    }
  }
}
