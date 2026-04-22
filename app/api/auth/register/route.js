/**
 * Auth Register Endpoint
 * Serverless implementation: POST /api/auth/register
 */

import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let pool = null;
  try {
    const body = await request.json();
    const { name, email, password, preferredCurrency } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    console.log('[REGISTER] Processing registration for:', email);

    // Import pg
    const { Pool } = await import('pg');

    const connectionUrl = process.env.DATABASE_URL;
    const jwtSecret = process.env.JWT_SECRET;

    if (!connectionUrl) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Connect with retry logic
    let attempts = 0;
    const maxAttempts = 2;
    let lastError = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`[REGISTER] Connection attempt ${attempts}/${maxAttempts}...`);
        pool = new Pool({
          connectionString: connectionUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 10000,
          max: 1,
          keepAlives: false
        });

        const testConn = await pool.query('SELECT 1');
        console.log('[REGISTER] Database connection successful');
        break;
      } catch (err) {
        lastError = err;
        console.error(`[REGISTER] Connection attempt ${attempts} failed:`, err.message);
        if (pool) {
          try {
            await pool.end();
            pool = null;
          } catch (e) {
            console.error('[REGISTER] Error closing pool:', e.message);
          }
        }
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000 * attempts));
        }
      }
    }

    if (!pool) {
      return NextResponse.json(
        { error: 'Registration failed', details: `Database connection failed: ${lastError?.message}` },
        { status: 500 }
      );
    }

    console.log('[REGISTER] Checking if email exists...');
    // Check if user exists
    const checkResult = await pool.query(
      'SELECT id FROM auth_users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log('[REGISTER] Email already registered:', email);
      await pool.end();
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    console.log('[REGISTER] Hashing password...');
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('[REGISTER] Creating user...');
    // Create user
    const createResult = await pool.query(
      `INSERT INTO auth_users (name, email, password_hash, preferred_currency, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, preferred_currency`,
      [name, email, passwordHash, preferredCurrency || 'USD']
    );

    const user = createResult.rows[0];
    console.log('[REGISTER] User created:', user.id);

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      jwtSecret || 'your-secret-key',
      { expiresIn: '7d' }
    );

    await pool.end();

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferredCurrency: user.preferred_currency
        },
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Error:', error.message, error.code);
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('[REGISTER] Error closing pool:', e);
      }
    }
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
