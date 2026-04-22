import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let client = null;
  try {
    const connectionUrl = process.env.DATABASE_URL;
    
    if (!connectionUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 400 }
      );
    }

    console.log('[DB_INIT] Parsing DATABASE_URL...');
    
    // Parse Supabase connection string
    const url = new URL(connectionUrl);
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.slice(1);

    console.log('[DB_INIT] Creating PostgreSQL connection...');
    
    // Use pg client directly with import
    const pg = await import('pg');
    const { Client } = pg.default || pg;
    
    client = new Client({
      user,
      password,
      host,
      port,
      database,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('[DB_INIT] Connected to database');

    // Create auth_users table
    const createTableSQL = `
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
    `;

    await client.query(createTableSQL);
    console.log('[DB_INIT] auth_users table created successfully');

    // Create index on email
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email)
    `;

    await client.query(createIndexSQL);
    console.log('[DB_INIT] Index created successfully');

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
    if (client) {
      try {
        await client.end();
        console.log('[DB_INIT] Connection closed');
      } catch (err) {
        console.error('[DB_INIT] Error closing connection:', err);
      }
    }
  }
}
