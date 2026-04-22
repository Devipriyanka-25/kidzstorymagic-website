/**
 * Get Current User Endpoint
 * Serverless implementation: GET /api/auth/me
 */

import { NextResponse } from 'next/server';
import { verifyUserFromToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('[ME] Verifying user from token');

    // Get and verify user from token
    const user = await verifyUserFromToken(request);
    if (!user) {
      console.log('[ME] No valid token provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[ME] User verified:', user.id);

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
    console.error('[ME] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}
