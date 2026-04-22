/**
 * Auth Login Endpoint - Using Supabase REST API
 * POST /api/auth/login-rest
 */

import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractProjectId(databaseUrl) {
  const match = databaseUrl.match(/db\.([a-z0-9]+)\.supabase\.co/);
  return match ? match[1] : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN-REST] Processing login for:', email);

    const databaseUrl = process.env.DATABASE_URL;
    const jwtSecret = process.env.JWT_SECRET;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!databaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    const projectId = extractProjectId(databaseUrl);
    if (!projectId) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    const supabaseUrl = `https://${projectId}.supabase.co`;

    // Find user by email
    console.log('[LOGIN-REST] Finding user...');
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=id,name,email,password_hash,preferred_currency`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Query failed: ${userResponse.status}`);
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      console.log('[LOGIN-REST] User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log('[LOGIN-REST] Found user:', user.id);

    // Verify password
    console.log('[LOGIN-REST] Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log('[LOGIN-REST] Password mismatch for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      jwtSecret || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
    console.error('[LOGIN-REST] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Login failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
