/**
 * Get Current User Endpoint
 * Serverless implementation: GET /api/auth/me
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  let pool = null;
  try {
    console.log('[ME] Verifying user from token');

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ME] No valid token provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret || 'your-secret-key');
    } catch (err) {
      console.log('[ME] Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.id) {
      console.log('[ME] Invalid token payload');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Import pg
    const { Pool } = await import('pg');

    const connectionUrl = process.env.DATABASE_URL;

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

    console.log('[ME] Fetching user:', decoded.id);
    // Get user from database
    const userResult = await pool.query(
      `SELECT id, name, email, profile_picture_url, preferred_currency, location, created_at 
       FROM auth_users 
       WHERE id = $1 AND is_active = true`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      console.log('[ME] User not found:', decoded.id);
      await pool.end();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    console.log('[ME] User verified:', user.id);

    await pool.end();

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePictureUrl: user.profile_picture_url,
          preferredCurrency: user.preferred_currency,
          location: user.location,
          createdAt: user.created_at
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ME] Error:', error.message, error.code);
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('[ME] Error closing pool:', e);
      }
    }
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}
