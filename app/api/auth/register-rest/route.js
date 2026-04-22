/**
 * Auth Register Endpoint - Using Supabase REST API
 * POST /api/auth/register-rest
 */

import { NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractProjectId(databaseUrl) {
  // Extract project ID from db.{PROJECT_ID}.supabase.co
  const match = databaseUrl.match(/db\.([a-z0-9]+)\.supabase\.co/);
  return match ? match[1] : null;
}

export async function POST(request) {
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

    console.log('[REGISTER-REST] Processing registration for:', email);

    const databaseUrl = process.env.DATABASE_URL;
    const jwtSecret = process.env.JWT_SECRET;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!databaseUrl || !supabaseKey) {
      console.error('[REGISTER-REST] Missing env vars: DATABASE_URL or SUPABASE_ANON_KEY');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    const projectId = extractProjectId(databaseUrl);
    if (!projectId) {
      console.error('[REGISTER-REST] Could not extract project ID from DATABASE_URL');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    const supabaseUrl = `https://${projectId}.supabase.co`;
    console.log('[REGISTER-REST] Using Supabase URL:', supabaseUrl);

    // Hash password
    console.log('[REGISTER-REST] Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if email exists (using Supabase REST API)
    console.log('[REGISTER-REST] Checking if email exists...');
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/auth_users?email=eq.${encodeURIComponent(email)}&select=id`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    if (!checkResponse.ok) {
      throw new Error(`Check email failed: ${checkResponse.status} ${checkResponse.statusText}`);
    }

    const existingUsers = await checkResponse.json();
    if (existingUsers.length > 0) {
      console.log('[REGISTER-REST] Email already registered:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create user using Supabase REST API
    console.log('[REGISTER-REST] Creating user...');
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/auth_users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name,
        email,
        password_hash: passwordHash,
        preferred_currency: preferredCurrency || 'USD',
        is_active: true
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Create user failed: ${createResponse.status} ${error}`);
    }

    const [user] = await createResponse.json();
    console.log('[REGISTER-REST] User created:', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      jwtSecret || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
    console.error('[REGISTER-REST] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
