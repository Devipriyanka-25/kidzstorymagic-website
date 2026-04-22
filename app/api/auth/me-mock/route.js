/**
 * Get Current User Endpoint - Mock Implementation
 * GET /api/auth/me-mock
 */

import { NextResponse } from 'next/server';
import { mockDB } from '../../lib/mock-db.js';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('[ME-MOCK] Verifying user from token');

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ME-MOCK] No valid token provided');
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
      console.log('[ME-MOCK] Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.id) {
      console.log('[ME-MOCK] Invalid token payload');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from mock database
    console.log('[ME-MOCK] Fetching user:', decoded.id);
    const user = mockDB.findUserById(decoded.id);

    if (!user) {
      console.log('[ME-MOCK] User not found:', decoded.id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[ME-MOCK] User profile retrieved:', user.id);

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
        },
        mode: 'mock-test'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ME-MOCK] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to retrieve user',
        details: error.message
      },
      { status: 500 }
    );
  }
}
