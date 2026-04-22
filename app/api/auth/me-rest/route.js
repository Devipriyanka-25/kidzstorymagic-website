/**
 * Get Current User Endpoint - Using Supabase REST API  
 * GET /api/auth/me-rest
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractProjectId(databaseUrl) {
  const match = databaseUrl.match(/db\.([a-z0-9]+)\.supabase\.co/);
  return match ? match[1] : null;
}

export async function GET(request) {
  try {
    console.log('[ME-REST] Verifying user from token');

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ME-REST] No valid token provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret || 'your-secret-key');
    } catch (err) {
      console.log('[ME-REST] Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.id) {
      console.log('[ME-REST] Invalid token payload');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const databaseUrl = process.env.DATABASE_URL;
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

    // Get user from database
    console.log('[ME-REST] Fetching user:', decoded.id);
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/auth_users?id=eq.${decoded.id}&select=id,name,email,profile_picture_url,preferred_currency,location,created_at&is_active=eq.true`,
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
      console.log('[ME-REST] User not found:', decoded.id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('[ME-REST] User profile retrieved:', user.id);

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
    console.error('[ME-REST] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to retrieve user',
        details: error.message
      },
      { status: 500 }
    );
  }
}
