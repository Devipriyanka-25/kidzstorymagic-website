import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('[DB_INIT] Starting database initialization...');
    console.log('[DB_INIT] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

    const { Pool } = await import('pg');
    console.log('[DB_INIT] pg module imported successfully');

    const connectionUrl = process.env.DATABASE_URL;
    if (!connectionUrl) {
      console.log('[DB_INIT] ERROR: DATABASE_URL not set');
      return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 400 });
    }

    const pool = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[DB_INIT] Testing database connection...');
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('[DB_INIT] Database connection successful:', testResult.rows[0]);

    console.log('[DB_INIT] Creating auth_users table...');
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
    console.log('[DB_INIT] auth_users table created/verified');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)`);
    console.log('[DB_INIT] Index created/verified');

    await pool.end();

    return NextResponse.json(
      { message: 'Database initialized successfully', tables: ['auth_users'] },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DB_INIT] ERROR:', error.message);
    console.error('[DB_INIT] Stack:', error.stack);
    return NextResponse.json(
      { error: 'Database initialization failed', message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
}
