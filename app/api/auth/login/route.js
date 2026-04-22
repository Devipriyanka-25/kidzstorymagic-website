/**
 * Auth Login Endpoint
 * Serverless implementation: POST /api/auth/login
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let pool = null;
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Processing login for:', email);

    // Import pg
    const { Pool } = await import('pg');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    const connectionUrl = process.env.DATABASE_URL;
    const jwtSecret = process.env.JWT_SECRET;

    if (!connectionUrl) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    pool = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });

    console.log('[LOGIN] Finding user...');
    // Find user
    const userResult = await pool.query(
      'SELECT id, name, email, password_hash, preferred_currency FROM auth_users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('[LOGIN] User not found:', email);
      await pool.end();
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    console.log('[LOGIN] Comparing password...');
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log('[LOGIN] Invalid password for:', email);
      await pool.end();
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] User authenticated:', user.id);

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      jwtSecret || 'your-secret-key',
      { expiresIn: '7d' }
    );

    await pool.end();

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferredCurrency: user.preferred_currency
        },
        token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LOGIN] Error:', error.message, error.code);
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('[LOGIN] Error closing pool:', e);
      }
    }
    return NextResponse.json(
      {
        error: 'Login failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
